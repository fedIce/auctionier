import { PayloadRequest } from "payload";
import { Trie } from '../../functions/search'

export const save_search_string = async (req: PayloadRequest) => {

    try {
        const query = req.routeParams?.query as string ?? ''

        const payload = req.payload

        const s = await payload.findGlobal({
            slug: 'search',
        })

        const trie = Trie.fromJSON(s.s.toLowerCase())

        const res = await trie.insert(query.toLowerCase()).then(async (json_string) => {
            return await payload.updateGlobal({
                slug: 'search',
                data: {
                    s: json_string
                }
            })
        })
        return Response.json({ data: await trie.getWordsByInsertCount(query.toLowerCase()) })
    } catch (e) {
        return Response.json({ errors: [{ message: "failed to add search word", error: String(e) }] })
    }

    return Response.json('done')
}

export const get_search_string = async (req: PayloadRequest) => {

    try {
        const query = req.routeParams?.query as string ?? ''

        const payload = req.payload

        const s = await payload.findGlobal({
            slug: 'search',
        })

        const trie = Trie.fromJSON(s.s.toLowerCase())

        return Response.json({ data: trie.getWordsByInsertCount(query.toLowerCase()) })
    } catch (e) {
        return Response.json({ errors: [{ message: "failed to add search word", error: String(e) }] })
    }

    return Response.json('done')
}