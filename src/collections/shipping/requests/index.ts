import { PayloadRequest } from "payload";

export const saveShipping = async (req: PayloadRequest) => {
    const data = req.json ? await req.json() : null;
    if (data == null) return Response.json({ status: 'error', error: 'invalid request object', message: 'request object is null', timestamp: new Date().toISOString() }, { status: 400 })

    let shipping = null


    try {
        if (data) {
            // Update user with phone number
            if (data.phone) {
                await req.payload.update({
                    collection: 'users',
                    id: data.user,
                    data: {
                        phone: data.phone
                    }
                })
            }

            // Check if user has existing shipping address
            shipping = await req.payload.findByID({
                collection: 'customer-shipping-details',
                id: data.shipping_doc_id
            }).catch(e => e)

            if (shipping.id) {
                // update shipping address if exists
                await req.payload.update({
                    collection: 'customer-shipping-details',
                    id: data.shipping_doc_id,
                    data: {
                        address: data.address,
                        city: data.city,
                        region: data.region,
                        postal: data.postal,
                        country: data.country
                    }
                })
            } else {
                // create new shipping address if not exists
                await req.payload.create({
                    collection: 'customer-shipping-details',
                    data: {
                        user: data.user,
                        address: data.address,
                        city: data.city,
                        region: data.region,
                        postal: data.postal,
                        country: data.country
                    }
                })
            }


        }
    } catch (e) {
        return Response.json({ status: 'error', error: String(e), message: 'something went wrong', timestamp: new Date().toISOString() }, { status: 400 })
    }

    return Response.json({ status: 'success' }, { status: 201 })

}