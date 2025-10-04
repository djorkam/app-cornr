import React from 'react';
import { Home, Search, MessageCircle, User, Heart } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'discover', icon: Search, label: 'Discover' },
    { id: 'connections', icon: MessageCircle, label: 'Connections' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t px-4 py-2 transition-colors" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--purple-light)' }}>
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center space-y-1 p-2 transition-colors"
            style={{
              color: activeTab === id ? 'var(--purple-primary)' : 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== id) {
                e.currentTarget.style.color = 'var(--purple-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== id) {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <Icon className="w-5 h-5" />
            <span className={`text-xs ${activeTab === id ? 'font-semibold' : 'font-medium'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};