import GuideInfoBox from "@/components/guide/guide-info-box";
import { ChatWindow } from "@/components/chat-window";

export default function ChatPage() {

  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">
          🤝
          <span className="ml-2">
            This template showcases a simple chatbot using{" "}
            <a
              className="text-blue-500"
              href="https://www.langchain.com/langgraph"
              target="_blank"
            >
              LangGraph
            </a>{" "}
            in a{" "}
            <a
              className="text-blue-500"
              href="https://fastapi.tiangolo.com/"
              target="_blank"
            >
              FastAPI
            </a>{" "}
            project.
          </span>
        </li>
        <li className="hidden text-l md:block">
          💻
          <span className="ml-2">
            You can find the prompt and model logic for this use-case in{" "}
            <code>backend/app/api/routes/chat.py</code>.
          </span>
        </li>
        <li className="hidden text-l md:block">
          🎨
          <span className="ml-2">
            The main frontend logic is found in{" "}
            <code>/frontend/src/pages/ChatPage.tsx</code>.
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            Try asking e.g. <code>What can you help me with?</code> below!
          </span>
        </li>
      </ul>
    </GuideInfoBox>
  );

  return (
    <ChatWindow
      endpoint="/api/agent"
      emoji="🤖"
      placeholder={`Hello, I'm your personal assistant. How can I help you today?`}
      emptyStateComponent={InfoCard}
    />
  );
}
