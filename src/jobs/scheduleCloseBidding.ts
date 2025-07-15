import { TaskHandler } from "payload";



export interface Bid {
  amount: number;
  user: string | null;
  id: string | null;
  valid_bid: boolean;
}

export const topBid = (bids: Bid[]): Bid => {
  let top: Bid = {
    amount: 0,
    user: null,
    id: null,
    valid_bid: true
  };

  for (let i = 0; i <= bids.length - 1; i++) {
    if (bids[i].amount > top.amount && bids[i].valid_bid) {
      top = bids[i];
    }
  }

  return top;
};

// export const scheduleCloseBidding: TaskHandler<'schedule-close-bidding-task'> = async ({ input, job, req, inlineTask, tasks }) => {
export const scheduleCloseBidding = async ({ input, job, req, inlineTask, tasks }: { input: any; job: any; req: { payload: any }; inlineTask: any; tasks: any }) => {

  console.log(`Running reminder job  -----------------------------------`);

  const aucion_item = await req.payload.findByID({
    depth: 2,
    collection: 'auction-items',
    id: input.id
  })

  if (aucion_item.status == 'closed') return { status: false, message: 'auction is closed', stat: aucion_item.status }
  if (aucion_item.active == false) return { status: false, message: 'auction is deactivated', active: aucion_item.active }


  if (!(aucion_item.bid_id && typeof aucion_item.bid_id == 'object')) return { status: false, message: 'No Bid object for this auction' }

  const topBidder = topBid(aucion_item.bid_id.bids)

  if (topBidder.amount <= 0) return { status: false, message: 'current bid at 0', bid: aucion_item.bid_id }

  const bidderUpdate = await req.payload.update({
    collection: 'bids',
    id: input.id,
    data: {
      top_biddder: topBidder.user
    }
  })

  const user = await req.payload.findByID({
    collection: 'users',
    id: topBidder.user ?? '',
  })

  const wonBidsUpdate = await req.payload.update({
    collection: 'users',
    id: user.id,
    data: {
      won_bids: [...(user.won_bids ?? []), input.id]
    }
  })

  const auctionItemUpdate = await req.payload.update({
    collection: 'auction-items',
    id: input.id,
    data: {
      active: false,
      status: 'closed'
    }
  })





  // Your logic here (email, external API call, etc.)
  return { status: true, message: 'successfully closed auction!', bidderUpdate: bidderUpdate.id, wonBidsUpdate: wonBidsUpdate.id, auctionItemUpdate: auctionItemUpdate.id }
}

