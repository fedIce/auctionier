import { PayloadRequest } from 'payload';
import { pusher } from '.'

export const notifyUsers = async (req: PayloadRequest) => {

    const aucion_id = req.routeParams?.event ?? ''
    try {

        const payload = req.payload

        const lastBid = await payload.find({
            collection: 'bid_item',
            depth: 0,
            limit: 1,
            sort: '-amount'
        })

        const doc = lastBid.docs[0]


        const aucion_item = await payload.findByID({
            id: aucion_id as string | number,
            collection: 'auction-items'
        })


        const data = {
            user: doc.user,
            title: 'Out Bidded',
            body: 'You have been out bidded!',
            extra: [
                { key: 'auction-item', value: aucion_item.slug }
            ]
        }

        pusher.trigger("gavel-app", "app-events", data).then(() => {
            payload.create({
                collection: 'notifications',
                data
            })
        });

        return Response.json({ message: 'notification sent' }, { status: 200 })
    } catch (e) {
        return Response.json({ error: 'could not send notification', message: String(e) }, { status: 200 })

    }


}