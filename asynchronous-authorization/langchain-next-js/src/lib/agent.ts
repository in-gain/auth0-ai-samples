import { createReactAgent, ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatBedrock } from '@langchain/aws';
import { InMemoryStore, MemorySaver } from '@langchain/langgraph';
import { Calculator } from '@langchain/community/tools/calculator';

import { withAsyncAuthorization } from './auth0-ai';
import { shopOnlineTool } from './tools/shop-online';

const date = new Date().toISOString();

const AGENT_SYSTEM_TEMPLATE = `You are a personal assistant named Assistant0. You are a helpful assistant that can answer questions and help with tasks. You have access to a set of tools, use the tools as needed to answer the user's question. Render the email body as a markdown block, do not wrap it in code blocks. Today is ${date}.`;

const region = process.env.BEDROCK_REGION;
const model = process.env.BEDROCK_CHAT_MODEL_ID;

if (!region) {
  throw new Error('BEDROCK_REGION is not defined');
}

if (!model) {
  throw new Error('BEDROCK_CHAT_MODEL_ID is not defined');
}

const llm = new ChatBedrock({
  model,
  region,
  temperature: 0,
});

const tools = [new Calculator(), withAsyncAuthorization(shopOnlineTool)];

const checkpointer = new MemorySaver();
const store = new InMemoryStore();

/**
 * Use a prebuilt LangGraph agent.
 */
export const agent = createReactAgent({
  llm,
  tools: new ToolNode(tools, {
    // Error handler must be disabled in order to trigger interruptions from within tools.
    handleToolErrors: false,
  }),
  // Modify the stock prompt in the prebuilt agent.
  prompt: AGENT_SYSTEM_TEMPLATE,
  store,
  checkpointer,
});
