import { slugify } from "@/functions";
import { CollectionConfig } from "payload";
import Icons from "./icons.json"; // Assuming icons.json has a default export
import { search_categories } from "./routes";


export const Categories: CollectionConfig = {
    slug: "categories",
    access: {
        read: () => true,
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
    },
    admin: {
        useAsTitle: "category_name"
    },
    fields: [
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: {
                readOnly: true
            }
        },
        {
            name: "icon",
            label: "Icon",
            type: "select",
            options: Icons,
            defaultValue: "car",
            required: true,

        },
        {
            name: "category_id",
            type: "text",
            required: true,
            hidden: true,
            defaultValue: `category-${Math.random().toString(36).substring(2, 15)}`,
        },
        {
            name: "category_name",
            label: "Category Name",
            type: "text",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
        },
    ],
    endpoints: [
        {
            path: '/t/:key',
            method: 'get',
            handler: async (req) => search_categories(req)
        },
    ],
    hooks: {
        beforeChange: [
            ({ data, operation }) => {
                if (operation === 'create' || operation === 'update') {
                    if (data.category_name) {
                        data.slug = slugify(data.category_name);
                    }
                }

                return data;
            },
        ],
    }
}