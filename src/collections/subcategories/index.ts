import { slugify } from "@/functions";
import { CollectionConfig } from "payload";

export const SubCategories: CollectionConfig = {
    slug: "sub_categories",
    access: {
        read: () => true,
        create: ({ req }) => !!req.user, 
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
    },
    labels: {
        singular: "Sub Category",
        plural: "Sub Categories",
    },
    admin: {
        useAsTitle: "title"
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
            name: "sub_category_id",
            type: "text",
            required: true,
            hidden: true,
            defaultValue: `sub-category-${Math.random().toString(36).substring(2, 15)}`,
        },
        {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
        },
        {
            name: "category",
            label: "Category",
            type: "relationship",
            relationTo: "categories",
        }
    ],
    hooks: {
            beforeChange: [
                ({ data, operation }) => {
                    if (operation === 'create' || operation === 'update') {
                        if (data.title) {
                            data.slug = slugify(data.title);
                        }
                    }
    
                    return data;
                },
            ],
        },
}