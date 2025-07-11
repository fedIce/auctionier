import type { CollectionConfig, PayloadRequest } from 'payload'
import { confirmPayment, createRevolutOrder } from '../functions/payments/revolut'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: () => true,
    create: ({ req }) => true,
    update: ({ req }) => true,
    delete: ({ req }) => true,
  },
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
    },
    {
      name: 'phone',
      type: 'text',
      unique: true
    }
  ],
  endpoints: [
    {
      path: '/revolut/create-order',
      method: 'post',
      handler: async (req: PayloadRequest) => await createRevolutOrder(req)
    },
    {
      path: '/revolut/comfirm/:ref',
      method: 'get',
      handler: async (req: PayloadRequest) => confirmPayment(req)
    }
  ]
}
