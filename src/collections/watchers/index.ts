import { CollectionConfig, PayloadRequest } from "payload";

export const Watchers: CollectionConfig = {
    slug: 'watchers',
    fields: [
        {
            name: 'auction_item',
            type: 'relationship',
            relationTo: 'auction-items'
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users'
        },
        {
            name: 'time',
            type: 'date',
            defaultValue: new Date()
        }
    ],
    endpoints: [
        {
            path: '/watch',
            method: 'post',
            handler: async (req: PayloadRequest): Promise<Response> => {
                const data = typeof req.json === 'function' ? await req.json() : {};
                const depth = parseInt(req.query.depth as string, 10) || 0;
                let result = {};

                if (!data.user) {
                    return Response.json({ message: 'user is required' }, { status: 400 });
                }
                if (!data.auction_item) {
                    return Response.json({ message: 'auction id is required' }, { status: 400 });
                }

                const user = data.user;
                const auction_item = data.auction_item;

                const watch = await req.payload.find({
                    collection: 'watchers',
                    depth: depth,
                    where: {
                        and: [
                            { user: { equals: user } },
                            { auction_item: { equals: auction_item } }
                        ]
                    }
                });

                if (watch.docs?.length <= 0) {
                    result = await req.payload.create({
                        collection: 'watchers',
                        depth: depth,
                        data: { user, auction_item }
                    });
                    result = { ...result, action: 'create' }
                } else {
                    result = await req.payload.delete({
                        collection: 'watchers',
                        depth: depth,
                        id: watch.docs[0].id
                    });
                    result = { ...result, action: 'delete' }

                }
                return Response.json({ ...result }, { status: 200 });
            }
        }
    ]
}