import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      type: "text",
      name: "fullname",
      label: "Full Name",
      required: true
    },
    {
      name: 'won_bids',
      type: 'relationship',
      relationTo: 'bids',
      hasMany: true,
      admin: {
        readOnly: true
      }
    }
  ],
}
