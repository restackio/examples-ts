import { defineEvent } from "@restackio/restack-sdk-ts/event";

export type StreamInfo = {
  streamSid: string;
};

export type AudioIn = {
  streamSid: string;
  username: string;
  payload: string;
};

export type Message = {
  streamSid: string;
  username: string;
  response: string;
  language: string;
  isLast?: boolean;
};

export const streamInfoEvent = defineEvent<StreamInfo>("streamInfo");

export const audioInEvent = defineEvent<AudioIn>("audioIn");

export const messageEvent = defineEvent<Message>("message");

export const streamEndEvent = defineEvent("streamEnd");
