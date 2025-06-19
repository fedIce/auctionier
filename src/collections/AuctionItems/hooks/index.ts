import { slugify } from "@/functions";
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
            auction_id: any;
            starting_bid: any;
            auction_starttime: any;
            auction_endtime: any;
            current_bid?: number;
        } = {
            _id: doc.id,
            auction_id: doc.id,
            starting_bid: doc.startingBid,
            auction_starttime: doc.startDate,
            auction_endtime: doc.endDate,
        }
        const existing = await req.payload.findByID({
            collection: 'bids',
            id: doc.id,
        }).catch(e => null);
        if (!existing) {
            if (operation === 'create') {
                data['current_bid'] = 0
            }

            bid = await payload.create({
                collection: 'bids',
                data
            });
        }
    }

    if (operation == 'create' && bid) {
        await payload.update({
            collection: 'auction-items',
            id: doc.id,
            data: {
                bid_id: bid.id
            }
        })
    }
    return doc
}
