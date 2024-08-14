import { websocketConnect } from "./connect";

export async function websocketSendAudio({
  streamSid,
  audio,
  username,
  language,
}: {
  streamSid: string;
  audio: string;
  username: string;
  language: string;
}) {
  const ws = await websocketConnect();

  const audioEvent = {
    streamSid: streamSid,
    event: "media",
    media: {
      payload: audio,
      username,
      language,
    },
  };
  ws.send(JSON.stringify(audioEvent));
  ws.close();
  return true;
}
