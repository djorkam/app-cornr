import React, { useState } from 'react';
import { Search, Bell, ArrowLeft } from 'lucide-react';
import { ChatConversation } from './ChatConversation';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantType: 'unicorn' | 'couple';
  lastMessage: Message;
  unreadCount: number;
  isOnline?: boolean;
}

const mockChats: Chat[] = [
  {
    id: '1',
    participantId: 'user1',
    participantName: 'Emma',
    participantAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'unicorn',
    lastMessage: {
      id: 'msg1',
      senderId: 'user1',
      content: 'Hey! I saw your profile and loved your art pieces. Would love to chat more about your creative process!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false
    },
    unreadCount: 2,
    isOnline: true
  },
  {
    id: '2',
    participantId: 'couple1',
    participantName: 'Sarah & Mike',
    participantAvatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'couple',
    lastMessage: {
      id: 'msg2',
      senderId: 'demo-user-id',
      content: 'Thanks for the great conversation yesterday! Looking forward to meeting up this weekend.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: true
    },
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '3',
    participantId: 'user3',
    participantName: 'Luna',
    participantAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'unicorn',
    lastMessage: {
      id: 'msg3',
      senderId: 'user3',
      content: 'The yoga class was amazing! We should definitely go together next time 🧘‍♀️',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true
    },
    unreadCount: 0,
    isOnline: true
  },
  {
    id: '4',
    participantId: 'couple2',
    participantName: 'Alex & Jordan',
    participantAvatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'couple',
    lastMessage: {
      id: 'msg4',
      senderId: 'couple2',
      content: 'We had such a great time at dinner! Hope we can do it again soon.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: true
    },
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '5',
    participantId: 'user5',
    participantName: 'Maya',
    participantAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'unicorn',
    lastMessage: {
      id: 'msg5',
      senderId: 'demo-user-id',
      content: 'Your tech background is so interesting! I\'d love to learn more about your projects.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      isRead: true
    },
    unreadCount: 0,
    isOnline: false
  }
];

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return timestamp.toLocaleDateString();
};

export const ChatList: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedChat) {
    return (
      <ChatConversation
        chat={selectedChat}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b transition-colors" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--purple-light)' }}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/cornr_logo_orig_bg_removed_name_removed.png" 
                alt="CORNR" 
                className="h-6"
              />
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Messages</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 rounded-full transition-colors"
                style={{ 
                  color: 'var(--purple-primary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--purple-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Search conversations"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                className="p-2 rounded-full transition-colors"
                style={{ 
                  color: 'var(--purple-primary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--purple-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
              style={{
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="px-4 py-2">
        {filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No conversations found' : 'No messages yet. Start a conversation!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="w-full p-4 rounded-xl border transition-all duration-200 text-left hover:shadow-md"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                  boxShadow: 'var(--shadow)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--purple-light)';
                  e.currentTarget.style.backgroundColor = 'var(--purple-lighter)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                }}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--purple-light)' }}>
                      <img
                        src={chat.participantAvatar}
                        alt={chat.participantName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online indicator */}
                    {chat.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                    {/* Type badge */}
                    <div className="absolute -top-1 -right-1">
                      <span className={`text-xs ${
                        chat.participantType === 'unicorn' ? '🦄' : '👫'
                      }`}>
                        {chat.participantType === 'unicorn' ? '🦄' : '👫'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium truncate ${
                        chat.unreadCount > 0 ? 'font-semibold' : ''
                      }`} style={{ color: 'var(--text-primary)' }}>
                        {chat.participantName}
                      </h3>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {formatTimestamp(chat.lastMessage.timestamp)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--purple-primary)' }}></div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm truncate ${
                      chat.unreadCount > 0 ? 'font-medium' : ''
                    }`} style={{ 
                      color: chat.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' 
                    }}>
                      {chat.lastMessage.senderId === 'demo-user-id' ? 'You: ' : ''}
                      {chat.lastMessage.content}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};