import type { CollectionConfig } from 'payload'
import { hasAnyRole } from './access'
import { ensureAltText } from './hooks/media'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => hasAnyRole(req, ['editor', 'publisher', 'admin']),
    update: ({ req }) => hasAnyRole(req, ['editor', 'publisher', 'admin']),
    delete: ({ req }) => hasAnyRole(req, ['publisher', 'admin']),
  },
  hooks: {
    beforeChange: [ensureAltText],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
  ],
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
      },
      {
        name: 'feature',
        width: 1024,
        height: 768,
      },
    ],
  },
}
