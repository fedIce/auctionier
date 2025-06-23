import type { CollectionConfig, PayloadRequest } from 'payload'

export const Orders: CollectionConfig = {
    slug: 'orders',
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            unique: true
        },
        {
            name: 'auction',
            type: 'relationship',
            relationTo: 'auction-items'
        },
        {
            name: 'payment_ref',
            type: 'text'
        },
        {
            name: 'winning_bid',
            type: 'relationship',
            relationTo: 'bid_item'
        },
        {
            name: 'amount',
            type: 'number'
        },
        {
            name: 'currency',
            type: 'text'
        },
        {
            name: 'status',
            type: 'select',
            options: [
                {
                    label: 'Pending',
                    value: 'pending'
                },
                {
                    label: 'Completed',
                    value: 'completed'
                },
                {
                    label: 'Cancelled',
                    value: 'cancelled'
                },
                {
                    label: 'Shipped',
                    value: 'shipped'
                }
            ]
        },
        {
            name: 'payment_status',
            type: 'select',
            options: [
                {
                    label: 'Paid',
                    value: 'paid'
                },
                {
                    label: 'Unpaid',
                    value: 'unpaid'
                },
                {
                    label: 'Refunded',
                    value: 'refunded'
                }
            ],
        },
        {
            name: 'payment_method',
            type: 'text'
        }
    ]
}