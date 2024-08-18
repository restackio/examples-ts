# Install dependencies

pnpm i

Add OPENAI_API_KEY and DEEPGRAM_API_KEY keys in .env

pnpm dev-server
pnpm dev-worker

# Use frontend with browser microphone:

https://github.com/restackio/voice-frontend

pnpm dev

# Or use Twilio voice calls

## Start ngrok funnel

pnpm ngrok

## Trigger Twilio call with

pnpm call

### Troubleshooting

Error: listen EADDRINUSE: address already in use :::4000

Websocket not properly closed, list which process is using port:

lsof -i :4000

should return for ex. 1234.

Kill process:

kill 1234
