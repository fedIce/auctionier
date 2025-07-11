import type { CollectionConfig, PayloadRequest } from 'payload'
import { saveShipping } from './requests'

export const CustomerShippingDetails: CollectionConfig = {
    slug: 'customer-shipping-details',
    access: {
        read: () => true,
        create: ({ req }) => true,
        update: ({ req }) => true,
        delete: ({ req }) => true,
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            unique: true
        },
        {
            name: 'address',
            type: 'text'
        },
        {
            name: 'city',
            type: 'text'
        },
        {
            name: 'region',
            type: 'text'
        },
        {
            name: 'postal',
            type: 'text'
        },
        {
            name: 'country',
            type: 'text'
        }
    ],
    endpoints: [
        {
            path: '/shipping',
            method: 'post',
            handler: async (req: PayloadRequest) => await saveShipping(req)
        }
    ]
}