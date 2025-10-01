import { NextRequest } from 'next/server';
import {
  streamText,
  type UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToCoreMessages,
} from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { shopOnlineTool } from '@/lib/tools/shop-online';

const date = new Date().toISOString();
const AGENT_SYSTEM_TEMPLATE =
  `You are a personal assistant named Assistant0. You can call tools. Today is ${date}.`;

const region = process.env.BEDROCK_REGION;
const modelId = process.env.BEDROCK_CHAT_MODEL_ID;

if (!region) {
  throw new Error('BEDROCK_REGION is not defined');
}

if (!modelId) {
  throw new Error('BEDROCK_CHAT_MODEL_ID is not defined');
}

const credentialsChain = fromNodeProviderChain({ profile: process.env.AWS_PROFILE });

const bedrock = createAmazonBedrock({
  region,
  credentialProvider: async () => {
    const { accessKeyId, secretAccessKey, sessionToken } = await credentialsChain();
    return { accessKeyId, secretAccessKey, sessionToken };
  },
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages = convertToCoreMessages(sanitize(body.messages as UIMessage[]));
  const tools = { shopOnlineTool };

  const stream = createUIMessageStream({
    async execute({ writer }) {
      const result = streamText({
        model: bedrock(modelId),
        system: AGENT_SYSTEM_TEMPLATE,
        messages,
        tools,
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function sanitize(messages: UIMessage[]) {
  return messages.filter(
    (m) =>
      !(
        m.role === 'assistant' &&
        Array.isArray(m.parts) &&
        m.parts.length > 0 &&
        !m.parts.some((p: any) => !!p?.text)
      )
  );
}
