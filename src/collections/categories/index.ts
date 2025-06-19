import { slugify } from "@/functions";
import { CollectionConfig } from "payload";


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