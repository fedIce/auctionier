import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";
import { FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import options from "./options/options.json"; // Assuming options.json has a default export


export const AuctionItems: CollectionConfig = {
    slug: "auction-items",
    fields: [
        {
            name: "lotId",
            type: "text",
            required: true,
            hidden: true,
            defaultValue: () => `lot-${Math.random().toString(36).substring(2, 15)}`,
        },
        {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
        },
        {
            name: "category",
            label: "Category",
            type: "relationship",
            required: true,
            relationTo: "categories",
            admin:{
                allowCreate: false,
                allowEdit: false
            },
        },
        {
            name: "sub_category",
            label: "Sub Category",
            type: "relationship",
            required: true,
            relationTo: "sub_categories",
            admin:{
                allowCreate: false,
                allowEdit: false
            },
        },
        {
            name: "auction_type",
            label: "Auction Type",
            type: "relationship",
            relationTo: "auction_types",
            required: true,
            admin:{
                allowCreate: false,
                allowEdit: false
            },
        },
        {
            name: "brand",
            label: "Brand",
            type: "relationship",
            relationTo: "brands",
            admin:{
                allowCreate: false,
                allowEdit: false
            },
        },
        {
            name: "condition",
            label: "Condition",
            type: "select",
            options: options.used_condition,
            defaultValue: false
        },
        {
            name: "condition_rating",
            label: "Condition Rating",
            type: "select",
            options: options.condition_rating,
            defaultValue: false
        },
        {
            name: "active",
            type: "checkbox",
            hidden: true,
            defaultValue: true
        },
        {
            name: 'bids',
            type: 'array',
            hidden: true,
            admin: {
                readOnly: true
            },
            fields: [],
        },
        {
            name: "seller",
            label: "Seller",
            type: "relationship",
            relationTo: "sellers",
            required: true,
            admin:{
                allowCreate: false,
                allowEdit: false
            },
        },
        {
            name: "condition_details",
            label: "Condition Details",
            type: "textarea",
            defaultValue: false
        },
        {
            name: "description_short",
            label: "Short Description",
            type: "textarea",
            required: true
        },
        {
            name: "description",
            label: "Long Description",
            type: "richText",
            required: true,
            editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                    ...defaultFeatures,
                    FixedToolbarFeature()
                ],
            })

        },
        {
            name: "authenticity_verified",
            label: "Authenticity Verified",
            type: "checkbox",
            defaultValue: false,
        },
        {
            name: "reserve_price",
            label: "Reserve Price",
            type: "number",
            defaultValue: 0
        },
        {
            type: 'collapsible',
            label: "Buy Now Section",
            fields: [
                {
                    name: "buyNow",
                    label: "Buy Now",
                    type: "checkbox",
                    defaultValue: false
                },
                {
                    name: "buy_now_price",
                    label: "Buy Now Price",
                    type: "number",
                    defaultValue: 0
                }
            ]
        },
        {
            name: "startingBid",
            label: "Starting Bid",
            type: "number",
            required: true,
            defaultValue: 0,
        },
        {
            name: "endDate",
            label: "End Date",
            type: "date",
            required: true,
            defaultValue: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default to 3 days from now
        },
        {
            type: "row",
            fields: [
                {
                    name: "tag",
                    type: "text",
                    required: true,
                    hasMany: true,
                    admin:{
                        placeholder: "Type a tag and hit enter to add it",
                    },
                },
            ],
        },
        {
            name: "image",
            label: "Upload Images",
            type: "upload",
            relationTo: "media", // Assuming you have a Media collection
            required: true,
            hasMany: true,
        },
    ],
}