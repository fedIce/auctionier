import { Bid, topBid } from "@/jobs/scheduleCloseBidding";
import { PayloadRequest } from "payload";


export const createRevolutOrder = async (req: PayloadRequest) => {

    const data = req.json ? await req.json() : null;
    if (data == null) return Response.json({ status: 'error', error: 'invalid request object', message: 'request object is null', timestamp: new Date().toISOString() }, { status: 400 })



    if (!data.totalAmount) return Response.json({
        "code": "bad_request",
        "message": 'invalid "amount"',
        "timestamp": new Date().toLocaleTimeString()
    }, { status: 400 })

    data.amount = parseFloat(data.totalAmount)
    const order = data.order
    data.order = null
    let json = { token: null }

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.REVOLUTE_URL}/orders`,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Revolut-Api-Version': '2024-09-01',
            'Authorization': `Bearer ${process.env.REVOLUTE_API}`
        },
        body: JSON.stringify({
            amount: data.amount,
            currency: data.currency
        })
    } as any;

    // create Revolute Order
    if (data) {
        const result = await fetch(config)
        json = await result.json()
        console.log(order, data)


        //get Top Bid
        const aucion_item = await req.payload.findByID({
            collection: 'auction-items',
            id: order.auction
        })
        if (aucion_item.bid_id && typeof aucion_item.bid_id == 'object') {

            const _topBid = aucion_item.bid_id?.bids && Array.isArray(aucion_item.bid_id.bids)
                ? topBid((aucion_item.bid_id.bids as Bid[]))
                : null;


            //create Local order
            await req.payload.create({
                collection: 'orders',
                data: {
                    user: order.user,
                    auction: order.auction,
                    amount: data.totalAmount / 100,
                    currency: data.currency,
                    winning_bid: _topBid ? _topBid.id : null,
                    status: 'pending',
                    payment_status: 'unpaid',
                    payment_ref: json.token,
                    payment_method: 'revolut pay'

                }
            }).then(async (a_order) => {

                await req.payload.update({
                    collection: 'auction-items',
                    id: aucion_item.id,
                    data: {
                        order: a_order.id
                    }
                })
            })

        }
        return Response.json(json, { status: 200 })
    }


    return Response.json({
        "code": "unknown",
        "message": 'something went wrong',
        "timestamp": new Date().toLocaleTimeString()
    }, { status: 500 })

}


export const confirmPayment = async (req: PayloadRequest) => {

    const ref = await req.routeParams?.ref ?? null


    const result = await req.payload.update({
        collection: 'orders',
        where: {
            payment_ref: {
                equals: ref
            }
        },
        data: {
            payment_status: 'paid',
            status: 'completed'
        }
    }).catch(e => {
        return Response.json({ status: 'error', message: String(e) })
    })

    if ('docs' in result && Array.isArray(result.docs) && result.docs.length > 0) {
        return Response.json({ id: result.docs[0].id, status: "success" });
    } else {
        return Response.json({ status: 'error', message: 'Invalid result structure' });
    }

}


const temp = {
    TransactionCreated: {
        "event": "TransactionCreated",
        "timestamp": "2023-01-26T16:22:21.753463Z",
        "data": {
            "id": "63d2a8bd-8b67-a2de-b1d2-b58ee21d7073",
            "type": "transfer",
            "state": "pending",
            "request_id": "6a8b2ad9-d8b9-4348-9207-1c5737ccf11b",
            "created_at": "2023-01-26T16:22:21.765313Z",
            "updated_at": "2023-01-26T16:22:21.765313Z",
            "reference": "To John Doe",
            "legs": [
                {
                    "leg_id": "63d2a8bd-8b67-a2de-0000-b58ee21d7073",
                    "account_id": "05018b0d-e67c-4fec-bea6-415e9da9432c",
                    "counterparty": {
                        "id": "7e18625a-3e6c-4d4f-8429-216c25309a5f",
                        "account_type": "external",
                        "account_id": "ff29e658-f07f-4d81-bc0f-7ad0ff141357"
                    },
                    "amount": -10,
                    "currency": "GBP",
                    "description": "To Acme Corp"
                }
            ]
        }
    },
    TransactionStateChanged: {
        "event": "TransactionStateChanged",
        "timestamp": "2023-04-06T12:21:49.865Z",
        "data": {
            "id": "9a6434d8-3581-4faa-988b-48875e785be7",
            "request_id": "6a8b2ad9-d8b9-4348-9207-1c5737ccf11b",
            "old_state": "pending",
            "new_state": "reverted"
        }
    }

}

export const webHookHandler = async (req: PayloadRequest) => {

    const hooks = ['TransactionCreated', 'TransactionStateChanged']
    const data = temp.TransactionStateChanged

    if (data.event == hooks[0]) {
        // log new transaction created with transaction iD and lotID/auction-item id/
        return Response.json({ message: 'Acknowledged: transaction created successfully!' })
    }

    if (data.event == hooks[1]) {
        const _ = data.data
        const id = _.id
        if (_.new_state == 'complete') {

        }
    }


}
