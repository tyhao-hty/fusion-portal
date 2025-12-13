import type { CollectionConfig } from 'payload'
import { isAdmin } from './access'

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    hidden: true,
  },
  auth: false,
  access: {
    read: ({ req }) => isAdmin(req),
    create: ({ req }) => isAdmin(req),
    update: ({ req }) => isAdmin(req),
    delete: ({ req }) => isAdmin(req),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      unique: true,
      required: true,
    },
    {
      name: 'displayName',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Banned', value: 'banned' },
      ],
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Moderator', value: 'moderator' },
      ],
    },
  ],
}
