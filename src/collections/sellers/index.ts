import { CollectionConfig } from "payload";


export const Sellers: CollectionConfig = {
    slug: "sellers",
    admin:{
        useAsTitle: "seller_name"
    },
    access: {
        read: () => true,
        create: ({ req }) => !!req.user, 
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
    },
    fields: [
        {
            name: "seller_id",
            type: "text",
            required: true,
            hidden: true,
            defaultValue: () => `category-${Math.random().toString(36).substring(2, 15)}`,
        },
        {
            name: "seller_name",
            label: "Seller Name",
            type: "text",
            required: true,
        },
        {
            name: "seller_phone_number",
            label: "Seller Phone Number",
            type: "text",
            required: true,
        },
        {
            name: "seller_email",
            label: "Seller Email",
            type: "text",
            required: true,
        },
        {
            name: "seller_address",
            label: "Seller Address",
            type: "textarea",
            required: true,
        },

    ]
}