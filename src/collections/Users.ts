import type { CollectionConfig, PayloadRequest } from 'payload'
import { confirmPayment, createRevolutOrder } from '../functions/payments/revolut'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: () => true,
    create: ({ req }) => true,
    update: ({ req }) => true,
    delete: ({ req }) => true,
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      type: "text",
      name: "fullname",
      label: "Full Name",
      required: true
    },
    {
      name: 'won_bids',
      type: 'relationship',
      relationTo: 'bids',
      hasMany: true,
      admin: {
        readOnly: true
      }
    },
    {
      name: 'phone',
      type: 'text',
      unique: true
    },
    {
      name: 'username',
      type: 'text',
      unique: true
    },
    {
      name: 'preferences',
      type: 'group',
      defaultValue: {
        auction_ending_soon_notification: true,
        auction_outbided_notification: true,
        auction_new_in_tracked_search_notification: true,
        auction_ending_soon_email: true,
        auction_outbided_email: true,
        auction_new_in_tracked_search_email: true,
        display_user_name_setting: true,
      },
      fields: [
        {
          name: 'auction_ending_soon_notification',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'auction_outbided_notification',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'auction_new_in_tracked_search_notification',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'auction_ending_soon_email',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'auction_outbided_email',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'auction_new_in_tracked_search_email',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'display_user_name_setting',
          type: 'checkbox',
          defaultValue: true,
        }
      ]
    }

  ],
  endpoints: [
    {
      path: '/revolut/create-order',
      method: 'post',
      handler: async (req: PayloadRequest) => await createRevolutOrder(req)
    },
    {
      path: '/revolut/comfirm/:ref',
      method: 'get',
      handler: async (req: PayloadRequest) => confirmPayment(req)
    }
  ],
  // hooks: {
  //   afterRead: [
  //     ({ doc, req }) => {
  //       if (req.url?.startsWith('/api/users') && !req.query.preferences) {
  //         return {
  //           ...doc,
  //           preferences: undefined
  //         };
  //       }

  //       return doc;
  //     }
  //   ]
  // }
}

// auction_ending_soon_notification
// auction_outbided_notification
// auction_new_in_tracked_search_notification
// auction_ending_soon_email
// auction_outbided_email
// auction_new_in_tracked_search_email
// display_user_name_setting