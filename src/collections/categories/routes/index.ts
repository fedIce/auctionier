import { handleFilterQueries } from "@/collections/AuctionItems/funcs/search";
import { PayloadRequest } from "payload";
import { ObjectId } from "mongodb";

export const sortFilter = (sort: string): string => {
    if (sort) {
        switch (sort) {
            case 'ending-soon':
                return 'endDate';
            case 'ending-later':
                return '-endDate';
            case 'newest-first':
                return '-createdAt';
            case 'oldest-first':
                return 'createdAt';
            default:
                return '-createdAt';
        }
    }
    return '-createdAt'; // Default return value if sort is not provided
}

export const search_categories = async (req: PayloadRequest) => {

    let { page = 1, limit = 9, sort = '', depth = 1 } = req.query as Record<string, any>;
    const key = req.routeParams?.key as string
    let slug = req.query.queryslug || ''

    slug = (slug as string).toString().trim();
    sort = (sort as string).toString().trim();
    page = Number(page as string) || 1;
    limit = Number(limit as string) || 1;
    depth = Number(depth as string) || 1;

    console.log('--------------------', key, '<>', slug, req.query, '-------------------------------')
    const items = await req.payload.find({
        collection: 'auction-items',
        sort: sortFilter(sort),
        depth,
        page: page,
        limit: limit,
        disableErrors: false,
        where: {
            [`${key}.slug`]: {
                equals: slug,
            },
            ...handleFilterQueries(req)
        }
    })

    if (items.docs?.length <= 0) {
        return Response.json({
            aggs: [], docs: [],
            hasNextPage: false,
            hasPrevPage: false,
            limit: 0,
            nextPage: 2,
            page: 1,
            pagingCounter: 0,
            prevPage: 0,
            totalDocs: 0,
            totalPages: 0,
            msg: ['--------------------', key, '<>', slug, '-------------------------------']
        }, { status: 200 })
    }

    try {


        const r: Record<string, any> = {}



        const catId = items.docs.length > 0 ? typeof items.docs[0][key as keyof typeof items.docs[0]] === 'string'
            ? items.docs[0][key as keyof typeof items.docs[0]]
            : (items.docs[0][key as keyof typeof items.docs[0]] as { id: string }).id
            : null

        if (catId == null) return Response.json({ error: 'No items found' }, { status: 204 })

        r[key] = new ObjectId(catId as string)



        const aggs = await req.payload.db.collections["auction-items"].aggregate([
            // Match the auction-items based on the search query
            {
                $match: r
            },
            {
                $facet: {
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
            return Response.json({ error: 'No items found' }, { status: 404 });
        }
        return Response.json({ ...items, aggs }, { status: 200 });

    } catch (e) {
        console.error({
            error: String(e),
            message: 'filter failed',
            extra: {
                key,
                items: items.docs
            }
        })
    }
    return Response.json({ error: 'something went wrong fetching ' + key }, { status: 500 })
}