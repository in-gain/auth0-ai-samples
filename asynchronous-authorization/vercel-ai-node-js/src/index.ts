import "dotenv/config";
import { setAIContext } from "@auth0/ai-vercel";
import crypto from "node:crypto";
import { generateText } from "ai";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

import { buy } from "./lib/tools/buy";

const region = process.env.BEDROCK_REGION;
const modelId = process.env.BEDROCK_CHAT_MODEL_ID;

if (!region) {
  throw new Error("BEDROCK_REGION is not defined");
}

if (!modelId) {
  throw new Error("BEDROCK_CHAT_MODEL_ID is not defined");
}

const credentialsChain = fromNodeProviderChain({ profile: process.env.AWS_PROFILE });

const bedrock = createAmazonBedrock({
  region,
  credentialProvider: async () => {
    const { accessKeyId, secretAccessKey, sessionToken } = await credentialsChain();
    return { accessKeyId, secretAccessKey, sessionToken };
  },
});

async function main() {
  const threadID = crypto.randomUUID();
  setAIContext({ threadID });

  console.log(
    "Check your mobile device for Auth0 Guardian notification and approve the request"
  );

  const { text } = await generateText({
    model: bedrock(modelId),
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
