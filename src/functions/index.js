export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')         // Replace spaces and underscores with -
    .replace(/[^\w\-]+/g, '')        // Remove all non-word chars
    .replace(/\-\-+/g, '-')          // Replace multiple - with single -
    .replace(/^-+/, '')              // Trim - from start of text
    .replace(/-+$/, '');             // Trim - from end of text
}



export const extractFavouriteData = async (data) => {
  const bids = data.bid_id
  // if (typeof data.bid_id == 'object') {
  //   bids.bids = {
  //     length: bids.bids.length,
  //     top_bid: topBid(bids.bids)
  //   }

  // }

  return {
    thumbnail: data.image[0],
    title: data.title,
    category: data.category,
    sub_category: data.sub_category,
    endDate: data.endDate,
    bid_id: bids,
    id: data.id,
    slug: data.slug
  }
}