import { CollectionConfig } from "payload";


export const Brands: CollectionConfig = {
    slug: "brands",
    admin:{
        useAsTitle: "brand_name"
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
            name: "brand_name",
            label: "Brand Name",
            type: "text",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
        },
    ]
}