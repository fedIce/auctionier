import { CollectionConfig } from "payload";
import { generateSlugHook } from "./hooks";


export const AuctionTypes: CollectionConfig = {
    slug: "auction_types",
    labels: {
        singular: "Auction Type",
        plural: "Auction Types",
    },
    fields: [
        {
            name: "auction_type_id",
            type: "text",
            required: true,
            hidden: true,
            defaultValue: `category-${Math.random().toString(36).substring(2, 15)}`,
        },
        {
            name: 'slug',
            type: 'text',
            required: false,
            hidden: true,
            defaultValue: '',

        },
        {
            name: "auctionType",
            label: "Action Type",
            type: "text",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
        },
    ],
    admin:{
        useAsTitle: "auctionType"
    },
    hooks: {
        beforeChange: [
            generateSlugHook,
        ]
    }
}