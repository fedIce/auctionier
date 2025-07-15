import Pusher from "pusher";


export const pusher = new Pusher({
  appId: process.env.PUSHET_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECERT,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

