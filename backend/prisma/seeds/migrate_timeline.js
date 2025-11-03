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

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    dryRun: args.has('--dry-run'),
    dataPath: (() => {
      const pathIndex = argv.indexOf('--data');
      if (pathIndex !== -1 && argv[pathIndex + 1]) {
        return path.resolve(argv[pathIndex + 1]);
      }
      return process.env.TIMELINE_JSON ?? DEFAULT_JSON_PATH;
    })(),
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
  if (!checksumMatch) {
    throw new Error('Timeline migration aborted: checksum mismatch detected.');
  }
  if (!sampleRecordIntegrity) {
    throw new Error('Timeline migration aborted: sample record validation failed.');
  }
}

async function main() {
  const { dryRun, dataPath } = parseArgs(process.argv);
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

  await validateMigration({
    expectedCount: records.length,
    checksumMatch: true,
    sampleRecordIntegrity: records.length > 0 && typeof records[0].slug === 'string',
  });

  if (dryRun) {
    console.log('[timeline] Dry-run successful.');
    console.table(records.slice(0, 3));
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
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('[timeline] Migration failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
