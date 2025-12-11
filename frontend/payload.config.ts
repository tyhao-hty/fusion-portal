import { postgresAdapter, PostgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { LinkGroups } from './collections/LinkGroups'
import { LinkSections } from './collections/LinkSections'
import { Links } from './collections/Links'
import { Media } from './collections/Media'
import { Members } from './collections/Members'
import { Papers } from './collections/Papers'
import { Tags } from './collections/Tags'
import { TimelineEvents } from './collections/TimelineEvents'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Members,
    Media,
    Tags,
    Articles,
    Papers,
    TimelineEvents,
    LinkSections,
    LinkGroups,
    Links,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [],
})
