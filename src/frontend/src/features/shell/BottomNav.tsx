import { Home, Users, MessageCircle, User } from 'lucide-react';
import { PressableRow } from '../shared/motion/PressableRow';

type Tab = 'home' | 'people' | 'chat' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'people' as Tab, label: 'People', icon: Users },
    { id: 'chat' as Tab, label: 'Chat', icon: MessageCircle },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ];

  return (
    <nav className="border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <PressableRow
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </PressableRow>
          );
        })}
      </div>
    </nav>
  );
}
