import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { HomeScreen } from '../home/HomeScreen';
import { ChatListScreen } from '../chat/ChatListScreen';
import { ProfileScreen } from '../profile/ProfileScreen';
import { ChatThreadScreen } from '../chat/ChatThreadScreen';
import { ScreenTransition } from '../shared/motion/ScreenTransition';

type Tab = 'home' | 'people' | 'chat' | 'profile';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeChatId, setActiveChatId] = useState<bigint | null>(null);

  const handleOpenChat = (chatId: bigint) => {
    setActiveChatId(chatId);
    setActiveTab('chat');
  };

  const handleCloseChat = () => {
    setActiveChatId(null);
  };

  const renderContent = () => {
    if (activeTab === 'chat' && activeChatId !== null) {
      return (
        <ScreenTransition transitionKey={`chat-${activeChatId.toString()}`}>
          <ChatThreadScreen chatId={activeChatId} onBack={handleCloseChat} />
        </ScreenTransition>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <ScreenTransition transitionKey="home">
            <HomeScreen onStartChat={handleOpenChat} />
          </ScreenTransition>
        );
      case 'people':
        return (
          <ScreenTransition transitionKey="people">
            <HomeScreen onStartChat={handleOpenChat} />
          </ScreenTransition>
        );
      case 'chat':
        return (
          <ScreenTransition transitionKey="chat-list">
            <ChatListScreen onOpenChat={handleOpenChat} />
          </ScreenTransition>
        );
      case 'profile':
        return (
          <ScreenTransition transitionKey="profile">
            <ProfileScreen />
          </ScreenTransition>
        );
      default:
        return (
          <ScreenTransition transitionKey="home-default">
            <HomeScreen onStartChat={handleOpenChat} />
          </ScreenTransition>
        );
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <main className="flex-1 overflow-hidden">{renderContent()}</main>
      {activeChatId === null && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
