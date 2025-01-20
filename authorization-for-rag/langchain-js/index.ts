/**
 * LangChain + LangGraph Agents Example: Agentic Retrieval with Okta FGA (Fine-Grained Authorization)
 */
import "dotenv/config";

import { z } from "zod";

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { FGARetriever } from "./helpers/fga-retriever";
import { readDocuments } from "./helpers/read-documents";

/**
 * Demonstrates the usage of the Okta FGA (Fine-Grained Authorization)
 * with a vector store index to query documents with permission checks.
 *
 * The FGARetriever checks if the user has the "viewer" relation to the document
 * based on predefined tuples in Okta FGA.
 *
 * Example:
 * - A tuple {user: "user:*", relation: "viewer", object: "doc:public-doc"} allows all users to view "public-doc".
 * - A tuple {user: "user:user1", relation: "viewer", object: "doc:private-doc"} allows "user1" to view "private-doc".
 *
 * The output of the query depends on the user's permissions to view the documents.
 */
async function main() {
  console.info(
    "\n..:: LangChain + LangGraph Agents Example: Agentic Retrieval with Okta FGA (Fine-Grained Authorization)\n\n"
  );

  // UserID
  const user = "user1";
  // 1. Read and load documents from the assets folder
  const documents = await readDocuments();
  // 2. Create an in-memory vector store from the documents for OpenAI models.
  const vectorStore = await MemoryVectorStore.fromDocuments(
    documents,
    new OpenAIEmbeddings({ model: "text-embedding-3-small" })
  );
  // 3. Create a retriever that uses FGA to gate fetching documents on permissions.
  const retriever = FGARetriever.create({
    retriever: vectorStore.asRetriever(),
    // FGA tuple to query for the user's permissions
    buildQuery: (doc) => ({
      user: `user:${user}`,
      object: `doc:${doc.metadata.id}`,
      relation: "viewer",
    }),
  });
  // 4. Convert the retriever into a tool for an agent.
  // The agent will call the tool, rephrasing the original question and
  // populating the "query" argument, until it can answer the user's question.
  const retrieverTool = tool(
    async ({ query }) => {
      const documents = await retriever.invoke(query);
      return documents.map((doc) => doc.pageContent).join("\n\n");
    },
    {
      name: "financial-researcher",
      description: "Returns the latest information on financial markets.",
      schema: z.object({
        query: z.string(),
      }),
    }
  );
  // 5. Create a retrieval agent that has access to the retrieval tool.
  const retrievalAgent = createReactAgent({
    llm: new ChatOpenAI({ model: "gpt-4o-mini" }),
    tools: [retrieverTool],
    stateModifier: [
      "Answer the user's question based only on context retrieved from provided tools.",
      "Only use the information provided by the tools.",
      "If you need more information, ask for it.",
    ].join(" "),
  });
  // 6. Query the retrieval agent with a prompt
  const { messages } = await retrievalAgent.invoke({
    messages: [
      {
        role: "user",
        content: "Show me forecast for ZEKO?",
      },
    ],
  });

  /**
   * Output: `The provided context does not include specific financial forecasts...`
   */
  console.info(messages.at(-1)?.content);

  /**
   * If we add the following tuple to the Okta FGA:
   *
   *    { user: "user:user1", relation: "viewer", object: "doc:private-doc" }
   *
   * Then, the output will be: `The forecast for Zeko Advanced Systems Inc. (ZEKO) for fiscal year 2025...`
   */
}

main().catch(console.error);
