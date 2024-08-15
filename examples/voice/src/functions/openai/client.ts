import OpenAI from "openai";

let clientOpenai: OpenAI | null = null;

export function openaiClient() {
  if (!clientOpenai) {
    clientOpenai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return clientOpenai;
}
