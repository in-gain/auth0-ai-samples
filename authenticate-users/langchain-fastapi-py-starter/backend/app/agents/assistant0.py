from langgraph.prebuilt import ToolNode, create_react_agent
from langchain_openai import ChatOpenAI


tools = []

llm = ChatOpenAI(model="gpt-4.1-mini")

agent = create_react_agent(
    llm,
    tools=ToolNode(tools, handle_tool_errors=False),
    prompt="You are a personal assistant named Assistant0. You are a helpful assistant that can answer questions and help with tasks. You have access to a set of tools, use the tools as needed to answer the user's question. Render the email body as a markdown block, do not wrap it in code blocks.",
)
