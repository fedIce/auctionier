import { CollectionConfig } from "payload";
import { GenerateSlugHook } from "../AuctionItems/hooks";


export const Brands: CollectionConfig = {
    slug: "brands",
    admin: {
        useAsTitle: "title"
    },
    access: {
        read: () => true,
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
    },
    fields: [
        {
            name: "brand_id",
            type: "text",
            required: true,
            hidden: true,
            defaultValue: () => `category-${Math.random().toString(36).substring(2, 15)}`,
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
            name: "title",
            label: "Brand Name",
            type: "text",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
        },
    ],
    hooks: {
        beforeChange: [GenerateSlugHook],
    }
}