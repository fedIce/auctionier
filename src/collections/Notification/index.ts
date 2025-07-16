import { notifyUsers } from "@/functions/notifications/pusher/notify";
import { CollectionConfig, PayloadRequest } from "payload";

export const NotificationCollection: CollectionConfig = {
    slug: 'notifications',
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    fields: [
        {
            name: 'title',
            type: 'text'
        },
        {
            name: 'body',
            type: 'text'
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users'
        },
        {
            name: 'read',
            type: 'checkbox',
            defaultValue: false
        },
        {
            name: 'type',
            type: 'select',
            defaultValue: 'success',
            options: [
                {
                    label: 'Error',
                    value: 'error',
                },
                {
                    label: 'Info',
                    value: 'info',
                },
                {
                    label: 'Warning',
                    value: 'warning',
                },
                {
                    label: 'Success',
                    value: 'success',
                },
            ]
        },
        {
            name: 'extra',
            type: 'array',
            fields: [
                {
                    name: 'key',
                    type: 'text'
                },
                {
                    name: 'value',
                    type: 'text'
                }
            ]
        }
    ],
    endpoints: [
        {
            path: '/push/:event/:auctionid',
            method: 'post',
            handler: async (req: PayloadRequest) => notifyUsers(req)
        }
    ]
}