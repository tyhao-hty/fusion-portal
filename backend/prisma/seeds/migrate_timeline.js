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
  '../../../frontend/public/data/timeline.json',
);
const LOG_DIR = path.resolve(__dirname, 'logs');

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  const checksumFlagIndex = argv.indexOf('--checksum');
  const expectedChecksum =
    checksumFlagIndex !== -1 && argv[checksumFlagIndex + 1]
      ? argv[checksumFlagIndex + 1]
      : process.env.TIMELINE_JSON_CHECKSUM || null;
  return {
    dryRun: args.has('--dry-run'),
    dataPath: (() => {
      const pathIndex = argv.indexOf('--data');
      if (pathIndex !== -1 && argv[pathIndex + 1]) {
        return path.resolve(argv[pathIndex + 1]);
      }
      return process.env.TIMELINE_JSON ?? DEFAULT_JSON_PATH;
    })(),
    expectedChecksum,
  };
}

function checksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function toYearValue(yearLabel) {
  const matched = String(yearLabel).match(/\d{4}/);
  return matched ? Number(matched[0]) : null;
}

function normalizeSortOrder(index, total) {
  // Higher sortOrder should appear first in DESC ordering
  return total - index;
}

async function validateMigration({ expectedCount, checksumMatch, sampleRecordIntegrity }) {
  if (expectedCount <= 0) {
    throw new Error('Timeline migration aborted: expectedCount must be greater than zero.');
  }
  if (checksumMatch === false) {
    throw new Error('Timeline migration aborted: timeline checksum mismatch detected.');
  }
  if (!sampleRecordIntegrity) {
    throw new Error('Timeline migration aborted: sample record validation failed.');
  }
}

async function main() {
  const { dryRun, dataPath, expectedChecksum } = parseArgs(process.argv);
  const absolutePath = dataPath;

  const jsonBuffer = await fs.readFile(absolutePath);
  const raw = JSON.parse(jsonBuffer.toString());
  if (!Array.isArray(raw)) {
    throw new Error(`Invalid timeline data: expected array but received ${typeof raw}`);
  }

  const seenSlugs = new Set();
  const records = raw.map((item, index) => {
    const { id: slug, year, title, description } = item;
    if (!slug || !title || !description) {
      throw new Error(`Invalid record at index ${index}: missing required fields`);
    }
    if (seenSlugs.has(slug)) {
      throw new Error(`Duplicate slug detected: ${slug}`);
    }
    seenSlugs.add(slug);

    const yearLabel = year ?? '';

    return {
      slug,
      yearLabel,
      yearValue: toYearValue(yearLabel),
      title,
      description,
      sortOrder: normalizeSortOrder(index, raw.length),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const fileChecksum = checksum(jsonBuffer);
  const existingRecords = await prisma.timelineEvent.findMany({
    select: {
      slug: true,
      yearLabel: true,
      yearValue: true,
      title: true,
      description: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'desc' },
  });

  const existingChecksum =
    existingRecords.length > 0
      ? checksum(
          JSON.stringify(
            existingRecords.map((record) => ({
              slug: record.slug,
              yearLabel: record.yearLabel,
              yearValue: record.yearValue,
              title: record.title,
              description: record.description,
              sortOrder: record.sortOrder,
            })),
          ),
        )
      : null;

  const checksumMatch =
    expectedChecksum === null ? true : expectedChecksum === fileChecksum;

  const existingSlugs = new Set(existingRecords.map((record) => record.slug));
  const fileSlugs = new Set(records.map((record) => record.slug));
  const missingInDatabase = records
    .filter((record) => !existingSlugs.has(record.slug))
    .map((record) => record.slug);
  const missingInFile = existingRecords
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
    databaseCountBefore: existingRecords.length,
    existingChecksum,
    missingInDatabase: missingInDatabase.slice(0, 10),
    missingInFile: missingInFile.slice(0, 10),
  };

  await fs.mkdir(LOG_DIR, { recursive: true });

  const renderLogFilename = () => {
    const timestamp = summary.timestamp.replace(/[:.]/g, '-');
    const suffix = dryRun ? 'dry-run' : 'migrate';
    return `timeline-${suffix}-${timestamp}.json`;
  };

  async function writeSummary(extra = {}) {
    const payload = { ...summary, ...extra };
    const logPath = path.join(LOG_DIR, renderLogFilename());
    await fs.writeFile(logPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`[timeline] Summary written to ${logPath}`);
  }

  if (dryRun) {
    console.log('[timeline] Dry-run successful.');
    console.table(records.slice(0, 3));
    await writeSummary({
      applied: false,
      databaseCountAfter: existingRecords.length,
    });
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.timelineEvent.deleteMany();

    for (const record of records) {
      await tx.timelineEvent.create({ data: record });
    }
  });

  console.log(`[timeline] Migrated ${records.length} records from ${absolutePath}.`);
  await writeSummary({
    applied: true,
    databaseCountAfter: records.length,
  });
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('[timeline] Migration failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
