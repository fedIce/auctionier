// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, TaskConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { AuctionItems } from './collections/AuctionItems'
import { Categories } from './collections/categories'
import { SubCategories } from './collections/subcategories'
import { Brands } from './collections/brands'
import { AuctionTypes } from './collections/auction_types'
import { Sellers } from './collections/sellers'
import { Bids } from './collections/bids'
import { BidItem } from './collections/BidItem'
import { CustomerShippingDetails } from './collections/shipping'
import { Orders } from './collections/orders'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)


export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, AuctionItems, Categories, SubCategories, Brands, AuctionTypes, Sellers, Bids, BidItem, CustomerShippingDetails, Orders],
  // globals: [Categories],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  maxDepth: 2,
  csrf: [
    'http://localhost:3000', 'http://localhost:3001', 'https://auctionier-frontend.vercel.app'
  ],
  cors: [
    'http://localhost:3000', 'http://localhost:3001', 'https://auctionier-frontend.vercel.app'
  ],
  jobs: {
    tasks: [
      {
        outputSchema: [
          {
            name: 'status',
            type: 'checkbox',
            required: true
          }
        ],
        inputSchema: [
          {
            name: 'id',
            type: 'text',
            required: true
          }
        ],
        slug: 'schedule-close-bidding-task',
        handler: path.resolve(dirname, 'jobs/scheduleCloseBidding.ts' + "#scheduleCloseBidding")
      } as TaskConfig<'schedule-close-bidding-task'>
    ],
    jobsCollectionOverrides: ({ defaultJobsCollection }) => {
      if (!defaultJobsCollection.admin) {
        defaultJobsCollection.admin = {}
      }

      defaultJobsCollection.admin.hidden = false
      return defaultJobsCollection
    }
  }
})
