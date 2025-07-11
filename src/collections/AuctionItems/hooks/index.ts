import { slugify } from "@/functions";
import { inngestApp } from "@/ingest";
import { serve } from "inngest/next";
import { PayloadRequest } from "payload";

interface HookData {
    title?: string;
    slug?: string;
}

type OperationType = 'create' | 'update' | 'delete';

export const GenerateSlugHook = ({ data, operation }: { data: HookData; operation: OperationType }) => {
    if (operation === 'create' || operation === 'update') {
        if (data.title) {
            data.slug = slugify(data.title);
        }
    }

    return data;
}

export const InitializeBidForAuctionHook = async ({ doc, operation, req }: { doc: any; operation: OperationType; req: PayloadRequest }) => {
    // Only run on create
    const payload = req.payload;
    let bid = null
    if (operation === 'create' || operation === 'update') {
        const data: {
            _id: string,
            id: string;
            auction_id: any;
            starting_bid: any;
            auction_starttime: any;
            auction_endtime: any;
            current_bid?: number;
        } = {
            _id: doc.id,
            id: doc.id,
            auction_id: doc.id,
            starting_bid: doc.startingBid,
            auction_starttime: doc.startDate,
            auction_endtime: doc.endDate,
        }
        try {
            bid = await req.payload.findByID({
                collection: 'bids',
                id: doc.id,
            });
        } catch (e) {

            if (operation === 'create') {
                data['current_bid'] = 0
            }

            bid = await payload.update({
                collection: 'bids',
                id: data._id,
                data
            }).catch(async (e) => {
                return await payload.create({
                    collection: 'bids',
                    data
                })
            });
        }
        //SEND INNGEST EVENT TO CLOSE AUCTION
        await inngestApp.send({
            name: "app/close.auction",
            data: {
                auction_id: doc.id,
                time: doc.endDate,
                // time: new Date(Date.now() + 10 * 1000).toISOString(), // For testing purposes, close auction in 10 seconds
            },
        });
    }


    if (operation == 'create' && bid) {
        console.log('updating created auction object')

        await payload.update({
            collection: 'auction-items',
            id: doc.id,
            data: {
                bid_id: bid.id
            }
        }).catch(async e => {
            console.log('update failed, now deleteing auction object')

            await payload.delete({
                collection: 'auction-items',
                id: doc.id
            }).catch(e => {
                console.warn(e)
            }).finally(async () => {
                console.log('update failed, now creating new auction object with same ID')

                await payload.create({
                    collection: 'auction-items',
                    data: { ...doc, _id: bid.id, id: bid.id, bid_id: bid.id }

                }).catch(e => {
                    // console.log(e)
                    console.warn(e)
                })
            })




        })



    }

}
