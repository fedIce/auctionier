import { extractFavouriteData } from "@/functions"
import { inngestApp } from "@/ingest"
import { scheduleCloseBidding } from "@/jobs/scheduleCloseBidding"
import { BidItem } from "@/payload-types"
import { RetryConfig } from "node_modules/payload/dist/queues/config/types/taskTypes"
import { PayloadRequest, RunInlineTaskFunction, RunningJob, RunTaskFunctions } from "payload"

export const post_bid = async (req: PayloadRequest) => {

    // if (!req.user) return Response.json({ error: 'you do not have permission to perform this action' }, { status: 401 }) //---------> !INVESTIGATE!!!!

    const data = typeof req.json === 'function' ? await req.json() : {}
    if (data.customer_id === undefined || data.customer_id === null || !data.customer_id) {
        return Response.json({ error: 'Must be Logged in to Bid' }, { status: 400 })
    }

    const auction_id = data.auction_id
    const customer_id = data.customer_id
    const amount = parseFloat(data.amount)
    const auction_type = data.auction_type
    let validBid = true
    const auction = await req.payload.findByID({
        id: auction_id,
        collection: 'auction-items'
    })

    const bid = await req.payload.findByID({
        collection: 'bids',
        id: auction_id
    })

    // CREATE A NEW BID ITEM    
    const current_bid = typeof bid.current_bid === 'number' ? bid.current_bid : 0
    const nextBid = Math.ceil(current_bid + (current_bid * 0.05))

    if (nextBid > amount) return Response.json({ error: `bids must be higher than ${nextBid} euros ` }, { status: 500 })

    // check is auction is still open
    if (auction.endDate <= new Date().toISOString() && auction.active == true) return Response.json({ error: 'sorry, this auction is closed!' }, { status: 401 })

    if ((parseFloat(String(bid.reserve_price ?? 0))) > amount) {
        validBid = false
    }

    const bidItem = await req.payload.create({
        collection: 'bid_item',
        data: {
            user: customer_id,
            amount: amount,
            timestamp: new Date().toISOString(),
            auction_type: auction_type,
            open_status: true,
            bid_id: bid.id,
            valid_bid: validBid
        }
    })


    // Add bid item to the auction Bids andupdate current bid
    if (!auction.bid_id) {
        return Response.json({ error: 'Invalid auction bid ID' }, { status: 400 });
    }

    const new_bids: { bids: (string | BidItem)[], current_bid: number, starting_bid?: number } = {
        bids: [...(Array.isArray(bid?.bids) ? bid.bids : []), bidItem.id],
        current_bid: amount
    }

    if ((bid.bids ?? []).length <= 0) {
        new_bids.starting_bid = amount
    }

    const bids = await req.payload.update({
        collection: 'bids',
        id: auction_id,
        data: new_bids
    })

    inngestApp.send({
        name: "app/notify.users",
        data: {
            auction_id: auction_id,
            time: new Date(Date.now() + 5 * 1000).toISOString(),
            event: 'out_bidded'
        },
    });

    // check for reserve price requirements
    // check for user permissions requirements

    return Response.json({ new_bids: bids, validBid }, { status: 200 })
}


export const loadUserWatchList = async (req: PayloadRequest) => {

    const user_id = req.routeParams?.uid ?? null
    let bidsIds = []

    const userBids = await req.payload.find({
        collection: 'bid_item',
        depth: 0,
        where: {
            user: {
                equals: user_id
            }
        }
    })

    bidsIds = userBids.docs.map((doc) => {
        return doc.bid_id
    })

    bidsIds = [...new Set(bidsIds)]

    const auctionItems = await req.payload.find({
        collection: 'auction-items',
        where: {
            id: {
                in: bidsIds
            }
        }
    })



    const result = await Promise.all(auctionItems.docs.map(i => extractFavouriteData(i)))

    return Response.json({ docs: result }, { status: 200 })

}


export const test_job = async (req: PayloadRequest) => {

    const user = await req.payload.findByID({
        collection: 'bids',
        id: typeof req.routeParams?.id === 'string' || typeof req.routeParams?.id === 'number' ? req.routeParams.id : '',
    })

    const result = await scheduleCloseBidding({
        input: {
            id: user.id
        },
        job: {} as RunningJob<any>,
        req,
        inlineTask: function <TTaskInput extends object, TTaskOutput extends object>(taskID: string, taskArgs: { input?: TTaskInput; retries?: number | RetryConfig | undefined; task: (args: { inlineTask: RunInlineTaskFunction; input: TTaskInput; job: RunningJob<any>; req: PayloadRequest; tasks: RunTaskFunctions }) => { errorMessage?: string; state: "failed" } | { output: TTaskOutput; state?: "succeeded" } | Promise<{ errorMessage?: string; state: "failed" } | { output: TTaskOutput; state?: "succeeded" }> }): Promise<TTaskOutput> {
            throw new Error("Function not implemented.")
        },
        tasks: {} as RunTaskFunctions
    })


    return Response.json({ result }, { status: 200 })

}