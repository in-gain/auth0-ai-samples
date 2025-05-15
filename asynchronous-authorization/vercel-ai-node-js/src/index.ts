import { setAIContext } from "@auth0/ai-vercel";
import crypto from "node:crypto";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import { buy } from "./lib/tools/buy";

async function main() {
  const threadID = crypto.randomUUID();
  setAIContext({ threadID });

  console.log(
    "Check your mobile device for Auth0 Guardian notification and approve the request"
  );

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: "Buy 3 stocks of Google",
    maxSteps: 2,
    tools: {
      // pass an Auth0 user id. For example, 'auth0|100000000000000000000' or 'google-oauth2|100000000000000000000'
      buy: buy({ userId: "<authenticated-user-id>" }),
    },
  });

  console.log(text);
}

main().catch(console.error);
