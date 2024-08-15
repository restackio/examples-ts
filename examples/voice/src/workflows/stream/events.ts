import { defineEvent } from "@restackio/restack-sdk-ts/event";

export type StreamInfo = {
  streamSid: string;
};

export type AudioIn = {
  streamSid: string;
  payload: string;
};

export type Answer = {
  streamSid: string;
  response: string;
  isLast?: boolean;
};

export const streamInfoEvent = defineEvent<StreamInfo>("streamInfo");

export const audioInEvent = defineEvent<AudioIn>("audioIn");

export const answerEvent = defineEvent<Answer>("answer");

export const streamEndEvent = defineEvent("streamEnd");

// use for websocket event shown to show transcript in frontend for ex.

export const questionEvent = defineEvent("question");
export const imageEvent = defineEvent("image");
