import { getUserInfoTool } from "@/lib/tools/user-info";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // streamText is used to run the request
  const result = streamText({
    messages,
    model: openai("gpt-4o-mini"),
    // Provides external tools the model can call.
    // In this case, a User Info tool.
    tools: { getUserInfoTool },
    maxSteps: 2,
    onError({ error }) {
      console.error("streamText error", { error });
    },
  });

  return result.toDataStreamResponse();
}
