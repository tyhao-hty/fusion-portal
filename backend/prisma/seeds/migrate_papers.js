import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_JSON_PATH = path.resolve(
  __dirname,
  '../../../frontend/public/data/papers.json',
);
const LOG_DIR = path.resolve(__dirname, 'logs');

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  const checksumFlagIndex = argv.indexOf('--checksum');
  const expectedChecksum =
    checksumFlagIndex !== -1 && argv[checksumFlagIndex + 1]
      ? argv[checksumFlagIndex + 1]
      : process.env.PAPERS_JSON_CHECKSUM || null;

  return {
    dryRun: args.has('--dry-run'),
    dataPath: (() => {
      const pathIndex = argv.indexOf('--data');
      if (pathIndex !== -1 && argv[pathIndex + 1]) {
        return path.resolve(argv[pathIndex + 1]);
      }
      return process.env.PAPERS_JSON ?? DEFAULT_JSON_PATH;
    })(),
    expectedChecksum,
  };
}

function checksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function toTagSlug(name) {
  return crypto.createHash('sha1').update(name).digest('base64url');
}

function normalizeSortOrder(index, total) {
  return total - index;
}

async function validateMigration({ expectedCount, checksumMatch, sampleRecordIntegrity }) {
  if (expectedCount <= 0) {
    throw new Error('Paper migration aborted: expectedCount must be greater than zero.');
  }
  if (checksumMatch === false) {
    throw new Error('Paper migration aborted: papers checksum mismatch detected.');
  }
  if (!sampleRecordIntegrity) {
    throw new Error('Paper migration aborted: sample record validation failed.');
  }
}

async function main() {
  const { dryRun, dataPath, expectedChecksum } = parseArgs(process.argv);
  const absolutePath = dataPath;

  const jsonBuffer = await fs.readFile(absolutePath);
  const raw = JSON.parse(jsonBuffer.toString());

  if (!Array.isArray(raw)) {
    throw new Error(`Invalid papers data: expected array but received ${typeof raw}`);
  }

  const seenSlugs = new Set();
  const tagRegistry = new Map();
  const now = new Date();

  const records = raw.map((item, index) => {
    const {
      id: slug,
      title,
      authors,
      year,
      venue = null,
      url = null,
      abstract = null,
      tags = [],
    } = item;

    if (!slug || !title || !authors || !year) {
      throw new Error(`Invalid record at index ${index}: missing required fields`);
    }
    if (!Number.isInteger(year)) {
      throw new Error(`Invalid record at index ${index}: year must be an integer`);
    }
    if (seenSlugs.has(slug)) {
      throw new Error(`Duplicate slug detected: ${slug}`);
    }
    seenSlugs.add(slug);

    const uniqueTags = Array.from(new Set(Array.isArray(tags) ? tags : []));
    const tagSlugs = uniqueTags.map((name) => {
      if (!tagRegistry.has(name)) {
        tagRegistry.set(name, {
          name,
          slug: toTagSlug(name),
        });
      }
      return tagRegistry.get(name).slug;
    });

    return {
      slug,
      title,
      authors,
      year,
      venue,
      url,
      abstract,
      sortOrder: normalizeSortOrder(index, raw.length),
      tagSlugs,
    };
  });

  const tagRecords = Array.from(tagRegistry.values());
  const tagBySlug = new Map(tagRecords.map((tag) => [tag.slug, tag]));

  const fileChecksum = checksum(jsonBuffer);

  const existingRecords = await prisma.paper.findMany({
    include: {
      tags: true,
    },
    orderBy: [
      { year: 'desc' },
      { sortOrder: 'desc' },
      { id: 'desc' },
    ],
  });

  const normalizedExisting = existingRecords.map((record) => ({
    slug: record.slug,
    title: record.title,
    authors: record.authors,
    year: record.year,
    venue: record.venue,
    url: record.url,
    abstract: record.abstract,
    sortOrder: record.sortOrder,
    tags: record.tags
      .slice()
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map((tag) => ({ slug: tag.slug, name: tag.name })),
  }));

  const existingChecksum =
    normalizedExisting.length > 0
      ? checksum(JSON.stringify(normalizedExisting))
      : null;

  const checksumMatch =
    expectedChecksum === null ? true : expectedChecksum === fileChecksum;

  const existingSlugs = new Set(normalizedExisting.map((record) => record.slug));
  const fileSlugs = new Set(records.map((record) => record.slug));
  const missingInDatabase = records
    .filter((record) => !existingSlugs.has(record.slug))
    .map((record) => record.slug);
  const missingInFile = normalizedExisting
    .filter((record) => !fileSlugs.has(record.slug))
    .map((record) => record.slug);

  await validateMigration({
    expectedCount: records.length,
    checksumMatch,
    sampleRecordIntegrity: records.length > 0 && typeof records[0].slug === 'string',
  });

  const summary = {
    timestamp: new Date().toISOString(),
    dryRun,
    filePath: absolutePath,
    fileChecksum,
    expectedChecksum,
    checksumMatch: expectedChecksum ? checksumMatch : null,
    recordCount: records.length,
    tagCount: tagRecords.length,
    databaseCountBefore: normalizedExisting.length,
    existingChecksum,
    missingInDatabase: missingInDatabase.slice(0, 10),
    missingInFile: missingInFile.slice(0, 10),
  };

  await fs.mkdir(LOG_DIR, { recursive: true });

  const renderLogFilename = () => {
    const timestamp = summary.timestamp.replace(/[:.]/g, '-');
    const suffix = dryRun ? 'dry-run' : 'migrate';
    return `papers-${suffix}-${timestamp}.json`;
  };

  async function writeSummary(extra = {}) {
    const payload = { ...summary, ...extra };
    const logPath = path.join(LOG_DIR, renderLogFilename());
    await fs.writeFile(logPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`[papers] Summary written to ${logPath}`);
  }

  if (dryRun) {
    console.log('[papers] Dry-run successful.');
    console.table(records.slice(0, 3).map((record) => ({
      slug: record.slug,
      title: record.title,
      year: record.year,
      tagCount: record.tagSlugs.length,
    })));
    await writeSummary({
      applied: false,
      databaseCountAfter: normalizedExisting.length,
    });
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.paper.deleteMany();
    await tx.paperTag.deleteMany();

    for (const record of records) {
      await tx.paper.create({
        data: {
          slug: record.slug,
          title: record.title,
          authors: record.authors,
          year: record.year,
          venue: record.venue,
          url: record.url,
          abstract: record.abstract,
          sortOrder: record.sortOrder,
          createdAt: now,
          updatedAt: now,
          tags: {
            connectOrCreate: record.tagSlugs.map((tagSlug) => {
              const tag = tagBySlug.get(tagSlug);
              return {
                where: { slug: tag.slug },
                create: {
                  slug: tag.slug,
                  name: tag.name,
                  createdAt: now,
                  updatedAt: now,
                },
              };
            }),
          },
        },
      });
    }
  });

  console.log(`[papers] Migrated ${records.length} records from ${absolutePath}.`);
  await writeSummary({
    applied: true,
    databaseCountAfter: records.length,
  });
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('[papers] Migration failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
