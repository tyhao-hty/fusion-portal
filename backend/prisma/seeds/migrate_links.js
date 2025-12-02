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
  '../../../frontend/public/data/links.json',
);
const LOG_DIR = path.resolve(__dirname, 'logs');
const DEFAULT_BATCH_SIZE = 200;
const MAX_RETRY = 3;
const RETRY_DELAY_MS = 500;

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  const checksumFlagIndex = argv.indexOf('--checksum');
  const expectedChecksum =
    checksumFlagIndex !== -1 && argv[checksumFlagIndex + 1]
      ? argv[checksumFlagIndex + 1]
      : process.env.LINKS_JSON_CHECKSUM || null;

  const batchSizeFlagIndex = argv.indexOf('--batch');
  const batchSize =
    batchSizeFlagIndex !== -1 && argv[batchSizeFlagIndex + 1]
      ? Number.parseInt(argv[batchSizeFlagIndex + 1], 10)
      : Number.parseInt(process.env.LINKS_BATCH_SIZE ?? DEFAULT_BATCH_SIZE, 10);

  return {
    dryRun: args.has('--dry-run'),
    dataPath: (() => {
      const pathIndex = argv.indexOf('--data');
      if (pathIndex !== -1 && argv[pathIndex + 1]) {
        return path.resolve(argv[pathIndex + 1]);
      }
      return process.env.LINKS_JSON ?? DEFAULT_JSON_PATH;
    })(),
    expectedChecksum,
    batchSize: Number.isNaN(batchSize) ? DEFAULT_BATCH_SIZE : Math.max(1, batchSize),
  };
}

function checksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function normalizeSortOrder(index, total) {
  return total - index;
}

async function validateMigration({ sectionCount, checksumMatch }) {
  if (sectionCount <= 0) {
    throw new Error('Link migration aborted: sectionCount must be greater than zero.');
  }
  if (checksumMatch === false) {
    throw new Error('Link migration aborted: links checksum mismatch detected.');
  }
}

async function main() {
  const { dryRun, dataPath, expectedChecksum, batchSize } = parseArgs(process.argv);
  const jsonBuffer = await fs.readFile(dataPath);
  const raw = JSON.parse(jsonBuffer.toString());

  if (!Array.isArray(raw)) {
    throw new Error(`Invalid links data: expected array but received ${typeof raw}`);
  }

  const sections = [];
  const groups = [];
  const links = [];
  const now = new Date();

  raw.forEach((section, sectionIndex) => {
    const { id: sectionSlug, title, groups: sectionGroups = [] } = section;
    if (!sectionSlug || !title) {
      throw new Error(`Invalid section at index ${sectionIndex}: missing id/title`);
    }

    const sectionSortOrder = normalizeSortOrder(sectionIndex, raw.length);

    sections.push({
      slug: sectionSlug,
      title,
      sortOrder: sectionSortOrder,
      createdAt: now,
      updatedAt: now,
    });

    sectionGroups.forEach((group, groupIndex) => {
      const { id: groupSlug, title: groupTitle = null, items = [] } = group;
      if (!groupSlug) {
        throw new Error(`Invalid group in section ${sectionSlug}: missing id`);
      }

      const groupSortOrder = normalizeSortOrder(groupIndex, sectionGroups.length);

      groups.push({
        slug: groupSlug,
        title: groupTitle,
        sortOrder: groupSortOrder,
        sectionSlug,
        createdAt: now,
        updatedAt: now,
      });

      items.forEach((item, itemIndex) => {
        const { id: linkSlug, name, url, description = null } = item;
        if (!linkSlug || !name || !url) {
          throw new Error(`Invalid link in group ${groupSlug}: missing id/name/url`);
        }

        const linkSortOrder = normalizeSortOrder(itemIndex, items.length);

        links.push({
          slug: linkSlug,
          name,
          url,
          description,
          sortOrder: linkSortOrder,
          groupSlug,
          createdAt: now,
          updatedAt: now,
        });
      });
    });
  });

  const fileChecksum = checksum(jsonBuffer);
  const existingSections = await prisma.linkSection.findMany({
    include: {
      groups: {
        include: {
          links: true,
        },
        orderBy: [
          { sortOrder: 'desc' },
          { id: 'desc' },
        ],
      },
    },
    orderBy: [
      { sortOrder: 'desc' },
      { id: 'desc' },
    ],
  });

  const normalizedExisting = existingSections.map((section) => ({
    slug: section.slug,
    title: section.title,
    sortOrder: section.sortOrder,
    groups: section.groups.map((group) => ({
      slug: group.slug,
      title: group.title,
      sortOrder: group.sortOrder,
      links: group.links
        .slice()
        .sort((a, b) => b.sortOrder - a.sortOrder || b.id - a.id)
        .map((link) => ({
          slug: link.slug,
          name: link.name,
          url: link.url,
          description: link.description,
          sortOrder: link.sortOrder,
        })),
    })),
  }));

  const existingChecksum =
    normalizedExisting.length > 0 ? checksum(JSON.stringify(normalizedExisting)) : null;

  const checksumMatch =
    expectedChecksum === null ? true : expectedChecksum === fileChecksum;

  await validateMigration({
    sectionCount: sections.length,
    checksumMatch,
  });

  const summary = {
    timestamp: new Date().toISOString(),
    dryRun,
    filePath: dataPath,
    fileChecksum,
    expectedChecksum,
    checksumMatch: expectedChecksum ? checksumMatch : null,
    sectionCount: sections.length,
    groupCount: groups.length,
    linkCount: links.length,
    databaseSectionCountBefore: normalizedExisting.length,
    existingChecksum,
    batchSize,
  };

  await fs.mkdir(LOG_DIR, { recursive: true });

  const renderLogFilename = () => {
    const timestamp = summary.timestamp.replace(/[:.]/g, '-');
    const suffix = dryRun ? 'dry-run' : 'migrate';
    return `links-${suffix}-${timestamp}.json`;
  };

  async function writeSummary(extra = {}) {
    const payload = { ...summary, ...extra };
    const logPath = path.join(LOG_DIR, renderLogFilename());
    await fs.writeFile(logPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`[links] Summary written to ${logPath}`);
  }

  if (dryRun) {
    console.log('[links] Dry-run successful.');
    console.table(
      sections.slice(0, 3).map((section) => ({
        slug: section.slug,
        title: section.title,
        groupCount: groups.filter((group) => group.sectionSlug === section.slug).length,
      })),
    );
    await writeSummary({
      applied: false,
      databaseSectionCountAfter: normalizedExisting.length,
    });
    await prisma.$disconnect();
    return;
  }

  await prisma.link.deleteMany();
  await prisma.linkGroup.deleteMany();
  await prisma.linkSection.deleteMany();

  for (const section of sections) {
    const createdSection = await prisma.linkSection.create({
      data: {
        slug: section.slug,
        title: section.title,
        sortOrder: section.sortOrder,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      },
    });

    const sectionGroups = groups.filter((group) => group.sectionSlug === section.slug);

    for (const group of sectionGroups) {
      const createdGroup = await prisma.linkGroup.create({
        data: {
          slug: group.slug,
          title: group.title,
          sortOrder: group.sortOrder,
          sectionId: createdSection.id,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
        },
      });

      const groupLinks = links.filter((link) => link.groupSlug === group.slug);

      for (const link of groupLinks) {
        const payload = {
          slug: link.slug,
          name: link.name,
          url: link.url,
          description: link.description,
          sortOrder: link.sortOrder,
          groupId: createdGroup.id,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
        };

        let attempts = 0;
        for (;;) {
          try {
            await prisma.link.create({ data: payload });
            break;
          } catch (err) {
            attempts += 1;
            if (attempts >= MAX_RETRY) {
              throw err;
            }
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          }
        }
      }
    }
  }

  console.log(`[links] Migrated ${sections.length} sections, ${groups.length} groups, ${links.length} links from ${dataPath}.`);
  await writeSummary({
    applied: true,
    databaseSectionCountAfter: sections.length,
  });
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('[links] Migration failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
