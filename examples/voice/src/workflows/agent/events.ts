import * as functions from "../../functions";
import { defineEvent } from "@restackio/restack-sdk-ts/event";

export type ToolCall = {
  index: number;
  function: {
    name: string;
    arguments:
      | functions.ClassInput
      | functions.RaceInput
      | functions.ResourceInput;
  };
  id?: string;
};

export type Reply = {
  streamSid: string;
  text: string;
};

export const toolCallEvent = defineEvent<ToolCall>("toolCall");
export const replyEvent = defineEvent<Reply>("reply");
export const agentEnd = defineEvent("agentEnd");
