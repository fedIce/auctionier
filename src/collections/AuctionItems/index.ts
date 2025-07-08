import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";
import { FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import options from "./options/options.json"; // Assuming options.json has a default export
import { slugify } from '../../functions'
import { GenerateSlugHook, InitializeBidForAuctionHook } from "./hooks";
import { handleSraechAuctionItems } from "./funcs/search";


export const AuctionItems: CollectionConfig = {
    slug: "auction-items",
    access: {
        read: () => true,
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
    },
    fields: [
        {
            name: "lotId",
            type: "text",
            required: true,
            hidden: true,
            unique: true,
            defaultValue: `lot-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        },
        {
            name: 'bid_id',
            label: 'Bid ID',
            type: 'relationship',
            relationTo: 'bids',
            unique: true,
            admin: {
                // readOnly: true
                // hidden: true
            }
        },
        {
            name: "auction",
            label: "Auction",
            type: "relationship",
            relationTo: "auctions"
        },
        {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            unique: true,
            admin: {
                readOnly: true
            }
        },
        {
            name: "category",
            label: "Category",
            type: "relationship",
            required: true,
            relationTo: "categories",
            admin: {
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
            filterOptions: ({ siblingData, relationTo }: { siblingData: unknown; relationTo: string }) => {
                const typedSiblingData = siblingData as { category?: string }; // Explicitly cast siblingData
                if (relationTo === 'sub_categories' && typedSiblingData?.category) {
                    return {
                        category: {
                            equals: typedSiblingData.category
                        }
                    };
                }
                return false; // Explicitly return false if the condition is not met
            }
        },
        {
            name: "auction_type",
            label: "Auction Type",
            type: "relationship",
            relationTo: "auction_types",
            required: true,
            admin: {
                allowCreate: false,
                allowEdit: false
            },
        },
        {
            name: "brand",
            label: "Brand",
            type: "relationship",
            relationTo: "brands",
            admin: {
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
            defaultValue: true,
            admin: {
                readOnly: true
            }
        },
        {
            name: "seller",
            label: "Seller",
            type: "relationship",
            relationTo: "sellers",
            required: true,
            admin: {
                allowCreate: false,
                allowEdit: false
            }
        },
        {
            name: "condition_details",
            label: "Condition Details",
            type: "textarea",
            defaultValue: false
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true
        },
        {
            type: 'collapsible',
            label: 'Details',

            fields: [
                {
                    name: 'item_details',
                    label: "Item Details",
                    type: 'array',
                    required: true,
                    fields: [
                        {
                            name: 'detail_key',
                            label: "Property",
                            type: 'text',
                            required: true
                        },
                        {
                            name: 'detail_value',
                            label: "Value",
                            type: 'text',
                            required: true
                        }
                    ]
                }

            ]
        },
        // {
        //     name: "description",
        //     label: "Long Description",
        //     type: "richText",
        //     required: true,
        //     editor: lexicalEditor({
        //         features: ({ defaultFeatures }) => [
        //             ...defaultFeatures,
        //             FixedToolbarFeature()
        //         ],
        //     })

        // },
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
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: true,
            defaultValue: new Date(),
        },
        {
            name: "endDate",
            label: "End Date",
            type: "date",
            required: true,
            defaultValue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default to 3 days from now
        },
        {
            type: "row",
            fields: [
                {
                    name: "tag",
                    type: "text",
                    required: true,
                    hasMany: true,
                    admin: {
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
        {
            name: 'status',
            type: 'select',
            options: [
                {
                    label: 'Open',
                    value: 'open',
                },
                {
                    label: 'Closed',
                    value: 'closed',
                },
                {
                    label: 'Suspended',
                    value: 'suspended',
                },
            ],
            required: true,
            defaultValue: 'open'
        }
    ],
    hooks: {
        beforeChange: [GenerateSlugHook],
        afterChange: [InitializeBidForAuctionHook]

    },
    endpoints: [
        {
            path: '/search',
            method: 'get',
            handler: async (req) => handleSraechAuctionItems(req)
        }
    ]

}
