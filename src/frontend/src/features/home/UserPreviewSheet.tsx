import { useState } from 'react';
import { useStartChat, useBlockUser, useReportUser } from '../../hooks/useQueries';
import { useAuth } from '../../hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { User, MessageCircle, Ban, Flag, Info } from 'lucide-react';
import { toast } from 'sonner';
import { ReportDialog } from '../moderation/ReportDialog';
import { UpgradePromptDialog } from '../subscription/UpgradePromptDialog';
import type { Profile } from '../../backend';
import { formatInterestsPreview, getRandomDistance } from '../shared/format';
import { parseChatLimitError } from '../chat/limits';
import { Pressable } from '../shared/motion/Pressable';

interface UserPreviewSheetProps {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: (chatId: bigint) => void;
}

export function UserPreviewSheet({ user, open, onOpenChange, onStartChat }: UserPreviewSheetProps) {
  const { currentPrincipal } = useAuth();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const startChatMutation = useStartChat();
  const blockMutation = useBlockUser();
  const reportMutation = useReportUser();

  if (!user) return null;

  const photoUrl = user.profilePhoto?.blob.getDirectURL();
  const distance = getRandomDistance();

  const handleStartChat = async () => {
    try {
      const chatId = await startChatMutation.mutateAsync(user.owner);
      toast.success('Chat started!');
      onOpenChange(false);
      onStartChat(chatId);
    } catch (error: any) {
      const limitMessage = parseChatLimitError(error.message);
      if (limitMessage) {
        setShowUpgradeDialog(true);
      } else {
        toast.error(error.message || 'Failed to start chat');
      }
    }
  };

  const handleBlock = async () => {
    try {
      await blockMutation.mutateAsync(user.owner);
      toast.success('User blocked');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to block user');
    }
  };

  const handleReport = async () => {
    setShowReportDialog(true);
  };

  const handleReportSubmit = async () => {
    try {
      await reportMutation.mutateAsync(user.owner);
      toast.success('Report submitted');
      setShowReportDialog(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="sr-only">
            <SheetTitle>{user.name}</SheetTitle>
            <SheetDescription>User profile</SheetDescription>
          </SheetHeader>

          <div className="flex h-full flex-col overflow-y-auto pb-6">
            <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-2xl bg-muted">
              {photoUrl ? (
                <img src={photoUrl} alt={user.name} className="h-full w-full object-cover animate-avatar-entrance" />
              ) : (
                <div className="flex h-full w-full items-center justify-center animate-avatar-entrance">
                  <User className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              <div className="absolute bottom-4 right-4 rounded-full bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground backdrop-blur-sm">
                {distance}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground">{user.city}</p>
              </div>

              {user.bio && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">About</h3>
                  <p className="text-muted-foreground">{user.bio}</p>
                </div>
              )}

              {user.interests.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Free browsing hint */}
              <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browsing profiles is free. A subscription is required to start conversations.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Pressable>
                  <Button
                    onClick={handleStartChat}
                    size="lg"
                    className="w-full rounded-full glow-soft"
                    disabled={startChatMutation.isPending}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {startChatMutation.isPending ? 'Starting...' : 'Start Chat'}
                  </Button>
                </Pressable>

                <div className="flex gap-3">
                  <Pressable className="flex-1">
                    <Button
                      onClick={handleBlock}
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full"
                      disabled={blockMutation.isPending}
                    >
                      <Ban className="mr-2 h-5 w-5" />
                      Block
                    </Button>
                  </Pressable>
                  <Pressable className="flex-1">
                    <Button
                      onClick={handleReport}
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full"
                      disabled={reportMutation.isPending}
                    >
                      <Flag className="mr-2 h-5 w-5" />
                      Report
                    </Button>
                  </Pressable>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onSubmit={handleReportSubmit}
        userName={user.name}
      />

      <UpgradePromptDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />
    </>
  );
}
