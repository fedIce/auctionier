import { CollectionSlug, PayloadHandler, PayloadRequest } from 'payload';
import { pusher } from '.'


export async function bulkCreate(req: PayloadRequest, collection: CollectionSlug, dataArray: any[]) {
    const payload = req.payload;
    try {
        const results = await Promise.all(
            dataArray.map(data =>
                payload.create({
                    depth: 0,
                    collection: collection,
                    data: data,
                })
            )
        );
        return results;
    } catch (error) {
        console.error("Error during bulk create:", error);
        throw error;
    }
}

export const notifyUsers = async (req: PayloadRequest) => {

    const event = req.routeParams?.event as string ?? ''
    const bid_id = req.routeParams?.auctionid as string ?? ''

    if (event == 'out_bidded') {
        return await outBiddedNotificationEvent(req, bid_id)
    }

    if (event == 'auction_closing') {
        return await auctionClosingNotificationEvent(req, bid_id)
    }

    return await Response.json({ errors: [{ message: "something went wrong" }] }, { status: 400 })

}

const outBiddedNotificationEvent = async (req: PayloadRequest, bid_id: string): Promise<Response> => {
    try {

        const payload = req.payload

        const lastBid = await payload.find({
            collection: 'bid_item',
            where: {
                bid_id: { equals: bid_id }
            },
            depth: 0,
            limit: 2,
            sort: '-amount'
        })

        const doc = lastBid.docs[1]

        if (lastBid.docs[0].user == lastBid.docs[1].user) {
            return Response.json({ message: 'current bidder is last bidder' }, { status: 200 })
        }

        const aucion_item = await payload.findByID({
            id: doc.bid_id as string | number,
            collection: 'auction-items'
        })


        const data = {
            user: doc.user,
            title: 'Out Bidded',
            body: 'You have been out bidded!',
            extra: [
                { key: 'link', value: `${process.env.FRONTEND_APP_URL}/auctions/${aucion_item.slug}` }
            ]
        }


        await payload.create({
            collection: 'notifications',
            data: {
                type: 'warning',
                ...data
            }
        }).then(async (res) => {
            await pusher.trigger("gavel-app", "app-events", res)
        });

        return Response.json({ message: 'notification sent', lastBid, doc }, { status: 200 })
    } catch (e) {
        return Response.json({ error: 'could not send notification', message: String(e) }, { status: 200 })

    }
}

const auctionClosingNotificationEvent = async (req: PayloadRequest, bid_id: string): Promise<Response> => {
    try {

        const payload = req.payload

        const auction = await payload.findByID({
            collection: 'auction-items',
            id: bid_id
        })

        const watchers = await payload.find({
            collection: 'watchers',
            depth: 0,
            where: {
                auction_item: { equals: bid_id }
            }
        })

        const bids = await payload.find({
            collection: 'bid_item',
            depth: 0,
            where: {
                bid_id: { equals: bid_id }
            }
        })

        const users = new Set([...watchers.docs.map(i => i.user), ...bids.docs.map(i => i.user)])

        const data = Array.from(users).map((user, i) => {
            return ({
                user: user,
                title: 'Auction Closing',
                body: 'An auction you are following closes in 30 minutes',
                type: 'info',
                extra: [
                    { key: 'link', value: `${process.env.FRONTEND_APP_URL}/auctions/${auction.slug}` }
                ]
            })
        })

        const bulked = await bulkCreate(req, 'notifications', data)
        await bulked?.map(async item => {
            await pusher.trigger("gavel-app", "app-events", item)
        })


        return Response.json({ message: 'notification sent', bulked }, { status: 200 })
    } catch (e) {
        return Response.json({ error: 'could not send notification', message: String(e) }, { status: 200 })

    }
}