import { PayloadRequest } from "payload";

export const handleSraechAuctionItems = async (req: PayloadRequest) => {
  let { search = '', page = 1, limit = 10 } = req.query;

  const filters: Record<string, any> = {};
  let sortKey = '-createdAt';


  if (req.query.sort) {
    const sort = Array.isArray(req.query.sort) ? req.query.sort[-1] : req.query.sort;

    switch (sort) {
      case 'ending-soon':
        sortKey = 'endDate';
        break;
      case 'ending-later':
        sortKey = '-endDate';
        break;
      case 'newest-first':
        sortKey = '-createdAt';
        break;
      case 'oldest-first':
        sortKey = 'createdAt';
        break;

      default:
        sortKey = '-createdAt';
    }

  }

  if (req.query.categories) {
    const categoryIds = Array.isArray(req.query.categories) ? req.query.categories : [req.query.categories];
    filters['category.slug'] = {
      in: categoryIds.map((id) => id.toString())
    };
  }

  if (req.query.auction_type) {
    const auctionTypeIds = Array.isArray(req.query.auction_type) ? req.query.auction_type : [req.query.auction_type];
    filters['auction_type.auctionType'] = {
      in: auctionTypeIds.map((id) => id.toString())
    };
  }

  if (req.query.condition) {
    const conditions = Array.isArray(req.query.condition) ? req.query.condition : [req.query.condition];
    filters['condition'] = {
      in: conditions.map((condition) => condition.toString())
    };
  }

  if (req.query.condition_rating) {
    const conditionRatings = Array.isArray(req.query.condition_rating) ? req.query.condition_rating : [req.query.condition_rating];
    filters['condition_rating'] = {
      in: conditionRatings.map((rating) => rating.toString())
    };
  }

  if (req.query.auction) {
    const auctionIds = Array.isArray(req.query.auction) ? req.query.auction : [req.query.auction];
    filters['auction.slug'] = {
      in: auctionIds.map((id) => id.toString())
    };
  }

  if (req.query.brand) {
    const brandIds = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
    filters['brand.slug'] = {
      in: brandIds.map((id) => id.toString())
    };
  }

  if (req.query.reserve_price) {
    const reservePrice = req.query.reserve_price;
    if (reservePrice === 'has-reserve-price') {
      filters['reserve_price'] = { gt: 0 };
    } else if (reservePrice === 'no-reserve-price') {
      filters['reserve_price'] = { equals: 0 };
    }
  }




  search = (search as string).toString().trim();
  page = Number(page as string) || 1;
  limit = Number(limit as string) || 10;

  if (!search || search === '') {
    return Response.json({ error: 'Search query cannot be empty' }, { status: 400 });
  }


  // req.payload.logger.info(`Searching auction items with search: ${search}, page: ${page}, limit: ${limit}`);

  const items = await req.payload.find({
    collection: 'auction-items',
    sort: sortKey,
    page: page as number | undefined,
    limit: 10,
    where: {
      or: [
        { title: { contains: search } },
        { description: { contains: search } },
        { tag: { contains: search } },
      ],
      ...filters
    }
  })

  const aggs = await req.payload.db.collections["auction-items"].aggregate([
    // Match the auction-items based on the search query
    {
      $match: {
        $or: [
          { title: { $regex: search, $options: 'i' } },  // Case-insensitive search in title
          { description: { $regex: search, $options: 'i' } },  // Case-insensitive search in description
          { tag: { $regex: search, $options: 'i' } },  // Case-insensitive search in tags
        ]
      }
    },
    {
      $facet: {
        categories: [
          // First $lookup to join with categories collection
          {
            $lookup: {
              from: 'categories',  // Collection to join with
              localField: 'category',  // Field in auction-items
              foreignField: '_id',  // Field in categories collection
              as: 'categoryDetails',  // Output field name
            },
          },

          // Group by category and count the number of auction-items
          {
            $group: {
              _id: '$category', // Group by category
              count: { $sum: 1 }, // Count the number of auction-items per category
              categoryDetails: { $first: '$categoryDetails' }, // Take the first categoryDetails element for each group
            },
          },

          // Limit the fields returned from the categoryDetails collection
          {
            $project: {
              slug: {
                $cond: {
                  if: { $gt: [{ $size: '$categoryDetails' }, 0] },  // Check if categoryDetails is not empty
                  then: { $arrayElemAt: ['$categoryDetails.slug', 0] },  // Access 'slug' from the first element
                  else: null,  // Return null if no categoryDetails found
                },
              },
              categorySlug: {
                $cond: {
                  if: { $gt: [{ $size: '$categoryDetails' }, 0] },  // Same check for non-empty categoryDetails
                  then: { $arrayElemAt: ['$categoryDetails.slug', 0] },  // Access 'slug'
                  else: null,  // Return null if no categoryDetails found
                },
              },
              count: 1,  // Include the count of auction-items per category
              _id: 1,  // Keep the category ID
            },
          },
        ],
        condition: [
          // Group by condition and count the number of auction-items
          {
            $group: {
              _id: '$condition', // Group by condition
              count: { $sum: 1 }, // Count the number of auction-items per condition
            },
          },
          // Project the condition and count
          {
            $project: {
              condition: '$_id',  // Rename _id to condition
              count: 1,  // Include the count of auction-items per condition
            },
          },
        ],
        condition_rating: [
          // Group by condition and count the number of auction-items
          {
            $group: {
              _id: '$condition_rating', // Group by condition
              count: { $sum: 1 }, // Count the number of auction-items per condition
            },
          },
          // Project the condition and count
          {
            $project: {
              condition: '$_id',  // Rename _id to condition
              count: 1,  // Include the count of auction-items per condition
            },
          },
        ],
        auction_type: [
          {
            $lookup: {
              from: 'auction_types',  // Collection to join with
              localField: 'auction_type',  // Field in auction-items
              foreignField: '_id',  // Field in categories collection
              as: 'auctionDetails',  // Output field name
            },
          },
          // Group by condition and count the number of auction-items
          {
            $group: {
              _id: '$auction_type', // Group by condition
              count: { $sum: 1 }, // Count the number of auction-items per condition
              auctionDetails: { $first: '$auctionDetails' }, // Take the first auctionDetails element for each group
            },
          },
          // Project the condition and count
          {
            $project: {
              slug: {
                $cond: {
                  if: { $gt: [{ $size: '$auctionDetails' }, 0] },  // Check if categoryDetails is not empty
                  then: { $arrayElemAt: ['$auctionDetails.auctionType', 0] },  // Access 'slug' from the first element
                  else: null,  // Return null if no categoryDetails found
                },
              },
              count: 1,  // Include the count of auction-items per category
              _id: 1,  // Keep the category ID
            }
          },
        ],
        auctions: [
          {
            $lookup: {
              from: 'auctions',  // Collection to join with
              localField: 'auction',  // Field in auction-items
              foreignField: '_id',  // Field in categories collection
              as: 'auctionData',  // Output field name
            },
          },
          // Group by condition and count the number of auction-items
          {
            $group: {
              _id: '$auction', // Group by condition
              count: { $sum: 1 }, // Count the number of auction-items per condition
              auctionData: { $first: '$auctionData' }, // Take the first auctionDetails element for each group
            },
          },
          // Project the condition and count
          {
            $project: {
              slug: {
                $cond: {
                  if: { $gt: [{ $size: '$auctionData' }, 0] },  // Check if categoryDetails is not empty
                  then: { $arrayElemAt: ['$auctionData.slug', 0] },  // Access 'slug' from the first element
                  else: null,  // Return null if no categoryDetails found
                },
              },
              count: 1,  // Include the count of auction-items per category
              _id: 1,  // Keep the category ID
            }
          },
        ],
        brand: [
          {
            $lookup: {
              from: 'brands',  // Collection to join with
              localField: 'brand',  // Field in auction-items
              foreignField: '_id',  // Field in categories collection
              as: 'brandDetails',  // Output field name
            },
          },
          // Group by condition and count the number of auction-items
          {
            $group: {
              _id: '$brand', // Group by condition
              count: { $sum: 1 }, // Count the number of auction-items per condition
              brandDetails: { $first: '$brandDetails' }, // Take the first brandDetails element for each group
            },
          },
          // Project the condition and count
          {
            $project: {
              slug: {
                $cond: {
                  if: { $gt: [{ $size: '$brandDetails' }, 0] },  // Check if categoryDetails is not empty
                  then: { $arrayElemAt: ['$brandDetails.slug', 0] },  // Access 'slug' from the first element
                  else: null,  // Return null if no categoryDetails found
                },
              },
              count: 1,  // Include the count of auction-items per category
              _id: 1,  // Keep the category ID
            }
          },
        ],
        reserve_price: [
          {
            $group: {
              _id: {
                $cond: [{ $gt: ["$reserve_price", 0] }, "has-reserve-price", "no-reserve-price"]
              },
              count: { $sum: 1 },
              total: { $sum: "$reserve_price" }
            }
          }
        ]

      }
    }
  ]).exec();


  if (!items || items.docs.length === 0) {
    return Response.json({ error: 'No auction items found' }, { status: 404 });
  }
  return Response.json({ ...items, aggs }, { status: 200 });
}