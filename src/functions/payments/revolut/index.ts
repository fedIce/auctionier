import { topBid } from "@/jobs/scheduleCloseBidding";
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

            const _topBid = topBid(aucion_item.bid_id.bids)


            //create Local order
            req.payload.create({
                collection: 'orders',
                data: {
                    user: order.user,
                    auction: order.auction,
                    amount: data.totalAmount / 100,
                    currency: data.currency,
                    winning_bid: _topBid.id,
                    status: 'pending',
                    payment_status: 'unpaid',
                    payment_ref: json.token,
                    payment_method: 'revolut pay'

                }
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
            payment_status: 'paid'
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