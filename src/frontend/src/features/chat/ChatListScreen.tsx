import { useGetUserChats, useGetCallerUserProfile } from '../../hooks/useQueries';
import { MessageCircle } from 'lucide-react';
import { EmptyState } from '../shared/components/EmptyState';
import { formatTimestamp } from '../shared/format';
import type { Chat } from '../../backend';
import { PressableRow } from '../shared/motion/PressableRow';

interface ChatListScreenProps {
  onOpenChat: (chatId: bigint) => void;
}

export function ChatListScreen({ onOpenChat }: ChatListScreenProps) {
  const { data: chats = [], isLoading } = useGetUserChats();
  const { data: userProfile } = useGetCallerUserProfile();

  const getOtherParticipant = (chat: Chat) => {
    return chat.participant1.toString() === userProfile?.owner.toString()
      ? chat.participant2
      : chat.participant1;
  };

  const getLastMessage = (chat: Chat) => {
    return chat.messages[chat.messages.length - 1];
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border bg-card/95 backdrop-blur-lg px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Chats</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <EmptyState
              imageSrc="/assets/generated/empty-chat.dim_1200x800.png"
              title="No conversations yet"
              description="Start chatting with people you discover"
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {chats.map((chat) => {
              const lastMessage = getLastMessage(chat);
              const isFromMe = lastMessage?.sender.toString() === userProfile?.owner.toString();

              return (
                <PressableRow
                  key={chat.id.toString()}
                  onClick={() => onOpenChat(chat.id)}
                  className="flex w-full items-start gap-4 px-6 py-4 text-left transition-colors"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                    <MessageCircle className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="truncate font-semibold text-foreground">
                        Chat #{chat.id.toString()}
                      </h3>
                      {lastMessage && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatTimestamp(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="truncate text-sm text-muted-foreground">
                        {isFromMe ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </PressableRow>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
