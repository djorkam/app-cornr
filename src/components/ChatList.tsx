import React, { useState } from 'react';
import { Search, Bell, Check } from 'lucide-react';
import { ChatConversation } from './ChatConversation';

interface Message {
  id: string;
  senderId: string;
  senderName?: string; // For couples - which partner sent the message
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
  // For couples - individual partner info
  partnerA?: {
    id: string;
    name: string;
    avatar?: string;
  };
  partnerB?: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: Message;
  unreadCount: number;
  isOnline?: boolean;
  isVerified?: boolean;
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
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false
    },
    unreadCount: 3,
    isOnline: true,
    isVerified: true
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
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true
    },
    unreadCount: 0,
    isOnline: false,
    isVerified: false
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
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true
    },
    unreadCount: 1,
    isOnline: true,
    isVerified: true
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
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true
    },
    unreadCount: 0,
    isOnline: false,
    isVerified: false
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
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isRead: true
    },
    unreadCount: 0,
    isOnline: false,
    isVerified: true
  }
];

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w`;
  
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
    <div className="max-w-4xl mx-auto pb-20" style={{ backgroundColor: '#faf7ff' }}>
      {/* Header - keeping original design with purple theme */}
      <div className="sticky top-0 z-10 border-b transition-colors" style={{ backgroundColor: '#ffffff', borderColor: '#e9d5ff' }}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold" style={{ color: '#1f2937' }}>Messages</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 rounded-full transition-colors"
                style={{ 
                  color: '#8b5cf6',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3e8ff';
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
                  color: '#8b5cf6',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3e8ff';
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
              style={{
                borderColor: '#e5e7eb',
                backgroundColor: '#f9fafb',
                color: '#1f2937'
              }}
            />
          </div>
        </div>
      </div>

      {/* Chat List with refined styling */}
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
                className="w-full p-4 rounded-2xl border transition-all duration-200 text-left hover:shadow-md"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#e9d5ff';
                  e.currentTarget.style.backgroundColor = '#faf5ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar with online dot and verification */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2" style={{ borderColor: '#e9d5ff' }}>
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
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium truncate ${
                          chat.unreadCount > 0 ? 'font-semibold' : ''
                        }`} style={{ color: '#1f2937' }}>
                          {chat.participantName}
                        </h3>
                        {/* Verification badge */}
                        {chat.isVerified && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs" style={{ color: '#9ca3af' }}>
                          {formatTimestamp(chat.lastMessage.timestamp)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: '#8b5cf6' }}>
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm truncate ${
                      chat.unreadCount > 0 ? 'font-medium' : ''
                    }`} style={{ 
                      color: chat.unreadCount > 0 ? '#1f2937' : '#6b7280' 
                    }}>
                      {chat.lastMessage.senderId === 'demo-user-id' && (
                        <span style={{ color: '#8b5cf6' }}>You: </span>
                      )}
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
