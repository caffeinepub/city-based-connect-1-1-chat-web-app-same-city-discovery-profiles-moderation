import { useState, useEffect, useRef } from 'react';
import { useGetChatHistory, useSendMessage, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatTimestamp } from '../shared/format';
import { parseChatLimitError } from './limits';
import { UpgradePromptDialog } from '../subscription/UpgradePromptDialog';
import { Pressable } from '../shared/motion/Pressable';

interface ChatThreadScreenProps {
  chatId: bigint;
  onBack: () => void;
}

export function ChatThreadScreen({ chatId, onBack }: ChatThreadScreenProps) {
  const [message, setMessage] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useGetChatHistory(chatId);
  const { data: userProfile } = useGetCallerUserProfile();
  const sendMutation = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const content = message.trim();
    setMessage('');

    try {
      await sendMutation.mutateAsync({ chatId, content });
    } catch (error: any) {
      const limitMessage = parseChatLimitError(error.message);
      if (limitMessage) {
        setShowUpgradeDialog(true);
      } else {
        toast.error(error.message || 'Failed to send message');
      }
      setMessage(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <header className="flex items-center gap-4 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
          <Pressable>
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Pressable>
          <h1 className="text-lg font-semibold text-foreground">Chat</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No messages yet. Say hi!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isFromMe = msg.sender.toString() === userProfile?.owner.toString();

                return (
                  <div
                    key={index}
                    className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] space-y-1 ${
                        isFromMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isFromMe
                            ? 'bg-primary text-primary-foreground glow-soft'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                      </div>
                      <span className="px-2 text-xs text-muted-foreground">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card/95 backdrop-blur-lg p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="min-h-[44px] max-h-32 resize-none rounded-full"
            />
            <Pressable>
              <Button
                onClick={handleSend}
                size="icon"
                disabled={!message.trim() || sendMutation.isPending}
                className="h-11 w-11 shrink-0 rounded-full glow-soft"
              >
                <Send className="h-5 w-5" />
              </Button>
            </Pressable>
          </div>
        </div>
      </div>

      <UpgradePromptDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />
    </>
  );
}
