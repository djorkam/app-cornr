import React, { useState } from 'react';
import { Search, Bell, MessageCircle, Sparkles, Check } from 'lucide-react';
import { ChatConversation } from './ChatConversation';

interface Message {
  id: string;
  senderId: string;
  senderName?: string;
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
  isVerified?: boolean;
}

interface NewMatch {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantType: 'unicorn' | 'couple';
  matchedAt: Date;
  isVerified?: boolean;
}

// Mock new matches data
const mockNewMatches: NewMatch[] = [
  {
    id: 'new-match-1',
    participantId: 'user6',
    participantName: 'Zoe',
    participantAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'unicorn',
    matchedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isVerified: true
  },
  {
    id: 'new-match-2',
    participantId: 'couple3',
    participantName: 'Emma & Jake',
    participantAvatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'couple',
    matchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isVerified: false
  },
  {
    id: 'new-match-3',
    participantId: 'user7',
    participantName: 'Aria',
    participantAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'unicorn',
    matchedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isVerified: true
  }
];

// Mock active conversations data
const mockActiveChats: Chat[] = [
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

interface NewMatchCardProps {
  match: NewMatch;
  onStartChat: (match: NewMatch) => void;
}

const NewMatchCard: React.FC<NewMatchCardProps> = ({ match, onStartChat }) => {
  return (
    <div className="flex-shrink-0 w-32 mr-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-all duration-200">
        {/* Profile Picture */}
        <div className="relative mb-3">
          <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-purple-100">
            <img
              src={match.participantAvatar}
              alt={match.participantName}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* New Match Badge */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          
          {/* Verification Badge */}
          {match.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-800 text-sm text-center mb-2 leading-tight">
          {match.participantName}
        </h3>

        {/* Type Badge */}
        <div className="flex justify-center mb-3">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              match.participantType === 'unicorn'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-pink-100 text-pink-700'
            }`}
          >
            {match.participantType === 'unicorn' ? '🦄' : '👫'}
          </span>
        </div>

        {/* Start Chat Button */}
        <button
          onClick={() => onStartChat(match)}
          className="w-full bg-purple-400 hover:bg-purple-500 text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors"
        >
          Start Chat
        </button>
      </div>
    </div>
  );
};

interface ChatCardProps {
  chat: Chat;
  onClick: () => void;
}

const ChatCard: React.FC<ChatCardProps> = ({ chat, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-25 transition-all duration-200 text-left shadow-sm hover:shadow-md"
    >
      <div className="flex items-center space-x-4">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-purple-100">
            <img
              src={chat.participantAvatar}
              alt={chat.participantName}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Online Indicator */}
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
          
          <div className="flex items-center justify-between">
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
            
            <span
              className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                chat.participantType === 'unicorn'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-pink-100 text-pink-700'
              }`}
            >
              {chat.participantType === 'unicorn' ? '🦄' : '👫'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export const ConnectionsScreen: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockActiveChats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = (match: NewMatch) => {
    // Convert NewMatch to Chat format for ChatConversation component
    const chatData: Chat = {
      id: match.id,
      participantId: match.participantId,
      participantName: match.participantName,
      participantAvatar: match.participantAvatar,
      participantType: match.participantType,
      lastMessage: {
        id: 'placeholder',
        senderId: match.participantId,
        content: 'Start your conversation...',
        timestamp: match.matchedAt,
        isRead: true
      },
      unreadCount: 0,
      isOnline: Math.random() > 0.5,
      isVerified: match.isVerified || false
    };
    
    setSelectedChat(chatData);
  };

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat);
  };

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
      {/* Header */}
      <div className="sticky top-0 z-10 border-b transition-colors" style={{ backgroundColor: '#ffffff', borderColor: '#e9d5ff' }}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold" style={{ color: '#1f2937' }}>Connections</h1>
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
                title="Search connections"
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
              placeholder="Search connections..."
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

      <div className="px-4 py-6">
        {/* New Matches Section */}
        {mockNewMatches.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">New Matches</h2>
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                {mockNewMatches.length}
              </span>
            </div>
            
            {/* Horizontal Carousel */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {mockNewMatches.map((match) => (
                <NewMatchCard
                  key={match.id}
                  match={match}
                  onStartChat={handleStartChat}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active Conversations Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Active Conversations</h2>
          </div>
          
          {filteredChats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? 'No conversations found' : 'No active conversations yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChats.map((chat) => (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  onClick={() => handleChatClick(chat)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Empty State for No Matches */}
        {mockNewMatches.length === 0 && filteredChats.length === 0 && !searchQuery && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No connections yet</h3>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-sm mx-auto">
              Start exploring and liking profiles to find your perfect connections!
            </p>
            <button className="bg-purple-400 hover:bg-purple-500 text-white font-medium py-3 px-6 rounded-xl transition-colors">
              Start Discovering
            </button>
          </div>
        )}
      </div>

      {/* Hide scrollbar for horizontal carousel */}
      <style>{`
        .flex.overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};