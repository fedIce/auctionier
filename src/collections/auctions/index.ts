import { CollectionConfig } from "payload";
import { GenerateSlugHook } from "../AuctionItems/hooks";

export const Auctions: CollectionConfig = {
    slug: "auctions",
    access: {
        read: () => true,
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
    },
    admin: {
        useAsTitle: "title"
    },
    fields: [
        {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
        },
        {
            name: "slug",
            type: "text",
            unique: true,
            admin: {
                readOnly: true
            }
        },
        {
            name: "verticalbannerImage",
            label: "Vertical Banner Image",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "horizontalbannerImage",
            label: "Horizontal Banner Image",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
        },
        {
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: true,
        },
        {
            name: "endDate",
            label: "End Date",
            type: "date",
            required: true,
        },
        {
            name: "startingBid",
            label: "Starting Bid",
            type: 'number',
        },
        {
            name: "tag",
            type: "text",
            required: true,
            hasMany: true,
            admin: {
                placeholder: "Type a tag and hit enter to add it",
            },
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

    ],
    hooks: {
        beforeChange: [GenerateSlugHook],
    }
}