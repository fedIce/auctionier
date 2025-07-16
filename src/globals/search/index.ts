import { GlobalConfig, PayloadRequest } from 'payload'
import { get_search_string, save_search_string } from '../routes'

export const SearchGlobal: GlobalConfig = {
  slug: 'search',
  access: {
    read: () => true,
    update: () => true
  },
  fields: [
    {
      name: 's',
      type: 'text',
      required: true,
      defaultValue: '{}',
      admin: {
        readOnly: true
      }
    }
  ],
  endpoints: [
    {
      path: '/save/:query',
      method: 'get',
      handler: async (req: PayloadRequest) => save_search_string(req)
    },
    {
      path: '/get/:query',
      method: 'get',
      handler: async (req: PayloadRequest) => get_search_string(req)
    }
  ]
}