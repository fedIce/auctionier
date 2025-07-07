import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => true,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    formatOptions: {
      format: 'webp'
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 200,
        height: 200,
        position: 'center',
      },
      {
        name: 'medium',
        width: 800,
        height: 600,
        position: 'center'
      },
    ],
  },
}
