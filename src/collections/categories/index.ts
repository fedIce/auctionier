import { CollectionConfig } from "payload";


export const Categories: CollectionConfig = {
    slug: "categories",
    fields: [
        {
            name: "category_id",
            type: "text",
            required: true,
            hidden: true,
            defaultValue: () => `category-${Math.random().toString(36).substring(2, 15)}`,
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
    ]
}