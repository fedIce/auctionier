import { CollectionConfig } from "payload";
import { loadUserWatchList } from "../bids/routes";


export const BidItem: CollectionConfig = {
    slug: 'bid_item',
    access: {
        read: () => true,
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            admin: {
                readOnly: true,
                allowEdit: false
            }
        },
        {
            name: 'bid_id',
            label: 'Parent Bid ID',
            type: 'relationship',
            relationTo: 'bids',
            admin: {
                readOnly: false
            }
        },
        {
            name: 'amount',
            type: 'number',
            label: 'Amount',
            admin: {
                readOnly: true,
            }
        },
        {
            name: 'timestamp',
            type: 'date',
            label: 'Time',
            admin: {
                readOnly: true
            }
        },
        {
            name: 'auction_type',
            type: 'relationship',
            relationTo: 'auction_types',
            admin: {
                readOnly: true,
                allowEdit: false
            }
        },
        {
            name: 'open_status',
            type: 'checkbox',
            label: 'Auction Open',
            admin: {
                readOnly: true,
            }
        }
    ],
    endpoints: [
        {
            path: '/watch-list/:uid',
            method: 'get',
            handler: async (req, res) => loadUserWatchList(req, res)
        }
    ]
}