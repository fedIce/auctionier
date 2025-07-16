import { PayloadRequest } from 'payload';
import { pusher } from '.'

export const notifyUsers = async (req: PayloadRequest) => {

    const event = req.routeParams?.event ?? ''
    const bid_id = req.routeParams?.auctionid ?? ''
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