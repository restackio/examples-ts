import { websocketConnect } from "./connect";

export async function websocketSendEvent({
  streamSid,
  eventName,
  data,
}: {
  streamSid: string;
  eventName: string;
  data: { text?: string; language?: string; username?: string };
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
