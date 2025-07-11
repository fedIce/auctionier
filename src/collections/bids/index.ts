import { error } from "console";
import { CollectionConfig, PayloadHandler, PayloadRequest } from "payload";
import { post_bid, test_job } from "./routes";


export const Bids: CollectionConfig = {
    slug: "bids",
    access: {
        read: () => true,
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
    },
    fields: [
        {
            name: "auction_id",
            type: "text",
            required: true,
            hidden: true,
        },
        {
            name: "starting_bid",
            label: "Starting Bid",
            type: 'number',
            required: true
        },
        {
            name: "current_bid",
            label: "Current Bid",
            type: 'number'
        },
        {
            name: "auction_starttime",
            label: "Auction Start Time",
            type: "date",
            required: true,
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime'
                }
            }
        },
        {
            name: "auction_endtime",
            label: "Auction End Time",
            type: "date",
            required: true,
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime'
                }
            }
        },
        {
            name: "reserve_price",
            label: "Reserve Price",
            type: 'number',
            defaultValue: 0
        },
        {
            name: "bids",
            label: "Bids",
            type: 'relationship',
            relationTo: 'bid_item',
            hasMany: true,
            admin: {
                // readOnly: true,
                // allowEdit: false,
                allowCreate: false
            }
        },
        {
            name: 'top_biddder',
            label: "Top Bidder",
            type: 'relationship',
            relationTo: 'users',
            admin: {
                // readOnly: true
            }
        }

    ],
    endpoints: [
        {
            path: '/place_bid',
            method: 'post',
            handler: async (req) => post_bid(req)
        },
        {
            path: '/test_job/:id',
            method: 'get',
            handler: async (req) => test_job(req)
        }
    ]
}