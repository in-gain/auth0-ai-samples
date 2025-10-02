import { Message } from '@langchain/langgraph-sdk';

import { cn } from '@/utils/cn';
import { MemoizedMarkdown } from './memoized-markdown';

export function ChatMessageBubble(props: { message: Message; aiEmoji?: string }) {
  // Convert content to string if it's an array
  const getContentAsString = (content: string | any[]): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      // Filter out reasoning_content and extract only text content
      const textContent = content
        .filter((item) => {
          // Skip reasoning_content items
          if (item && typeof item === 'object' && item.type === 'reasoning_content') {
            return false;
          }
          return true;
        })
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && 'text' in item) {
            return item.text || '';
          }
          return '';
        })
        .join('');

      return textContent.trim();
    }
    return String(content);
  };

  const contentString = getContentAsString(props.message.content);

  return ['human', 'ai'].includes(props.message.type) && contentString.length > 0 ? (
    <div
      className={cn(
        `rounded-[24px] max-w-[80%] mb-8 flex`,
        props.message.type === 'human' ? 'bg-secondary text-secondary-foreground px-4 py-2' : null,
        props.message.type === 'human' ? 'ml-auto' : 'mr-auto',
      )}
    >
      {props.message.type === 'ai' && (
        <div className="mr-4 mt-1 border bg-secondary -mt-2 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
          {props.aiEmoji}
        </div>
      )}
      <div className="chat-message-bubble whitespace-pre-wrap flex flex-col prose dark:prose-invert max-w-none">
        <MemoizedMarkdown content={contentString} id={props.message.id ?? ''} />
      </div>
    </div>
  ) : null;
}
