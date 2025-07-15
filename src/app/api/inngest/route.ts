import { inngestApp } from "@/ingest";
import { serve } from "inngest/next";

// Create an API that serves zero functions

const closeAuction = inngestApp.createFunction(
    { id: "close-auction" },
    { event: "app/close.auction" },
    async ({ event, step }: { event: { data: { time?: string; auction_id: string } }; step: any }) => {
        await step.sleepUntil("wait-for-iso-string", event.data.time || new Date().toISOString());
        const res = await fetch(process.env.APP_URL + `/api/bids/test_job/${event.data.auction_id}`)
        const json = await res.json();
        return { message: json, auction: event.data.auction_id };
    },
);

const notifyUsersApi = inngestApp.createFunction(
    { id: "notify-users" },
    { event: "app/notify.users" },
    async ({ event, step }: { event: { data: { time?: string; event: string, data: object } }; step: any }) => {
        await step.sleepUntil("wait-for-iso-string", event.data.time || new Date().toISOString());
        const res = await fetch(process.env.APP_URL + `/api/notifications/push/${event.data.event}`, {
            method: 'POST',
            body: JSON.stringify(event.data.data)
        })
        const json = await res.json();
        return { message: json, auction: event.data.event };
    },
);

export const { GET, POST, PUT } = serve({
    client: inngestApp,
    functions: [
        /* your functions will be passed here later! */
        closeAuction,
        notifyUsersApi
    ],
});