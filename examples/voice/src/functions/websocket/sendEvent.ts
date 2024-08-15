import { websocketConnect } from "./connect";

export async function websocketSendEvent({
  streamSid,
  eventName,
  data,
}: {
  streamSid: string;
  eventName: string;
  data: { text?: string; image?: { prompt: string; url: string } };
}) {
  const ws = await websocketConnect();

  const audioEvent = {
    streamSid: streamSid,
    event: eventName,
    data: data,
  };

  ws.send(JSON.stringify(audioEvent));
  ws.close();
  return true;
}
