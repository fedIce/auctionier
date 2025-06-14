import { CollectionConfig } from "payload";


export const SubCategories: CollectionConfig = {
    slug: "sub_categories",
    labels: {
        singular: "Sub Category",
        plural: "Sub Categories",
    },
    fields: [
        {
            name: "sub_category_id",
            type: "text",
            required: true,
            hidden: true,
            defaultValue: () => `sub-category-${Math.random().toString(36).substring(2, 15)}`,
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
    ]
}