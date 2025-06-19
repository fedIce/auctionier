import { TaskHandler } from "payload";

const topBid = (bids) => {
  let top = {
    amount: 0,
    user: null
  }

  for (let i = 0; i <= bids.length - 1; i++) {
    if (bids[i].amount > top.amount) {
      top = bids[i]
    }
  }

  return top
}

export const scheduleCloseBidding: TaskHandler<'schedule-close-bidding-task'> = async ({ input, job, req, inlineTask, tasks }) => {

  console.log(`Running reminder job  -----------------------------------`);

  const aucion_item = await req.payload.findByID({
    depth: 2,
    collection: 'auction-items',
    id: input.id
  })

  if (!aucion_item.active && aucion_item.status == 'closed') return { status: false, message: 'auction is closed or deactivated' }


  if (aucion_item.bid_id && typeof aucion_item.bid_id == 'object') {

    const topBidder = topBid(aucion_item.bid_id.bids)

    if (topBidder.amount <= 0) return { status: false, message: 'current bid at 0', bid: aucion_item.bid_id }

    req.payload.update({
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

    req.payload.update({
      collection: 'users',
      id: user.id,
      data: {
        won_bids: [...(user.won_bids ?? []), input.id]
      }
    })

    req.payload.update({
      collection: 'auction-items',
      id: input.id,
      data: {
        active: false,
        status: 'closed'
      }
    })
  }




  // Your logic here (email, external API call, etc.)
  return { status: true, message: 'Done!' }
}

