import React, { useState } from 'react';
import { MessageCircle, Sparkles, Clock } from 'lucide-react';
import { ChatConversation } from './ChatConversation';

interface MatchesScreenProps {
  onNavigateToChat?: () => void;
}

interface Match {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantType: 'unicorn' | 'couple';
  isNewMatch: boolean;
  lastMessageTime?: Date;
  hasUnreadMessages?: boolean;
  matchedAt: Date;
}

// Mock matches data
const mockMatches: Match[] = [
  {
    id: 'match-1',
    participantId: 'user1',
    participantName: 'Emma',
    participantAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'unicorn',
    isNewMatch: true,
    matchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'match-2',
    participantId: 'couple1',
    participantName: 'Sarah & Mike',
    participantAvatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'couple',
    isNewMatch: true,
    matchedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: 'match-3',
    participantId: 'user3',
    participantName: 'Luna',
    participantAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'unicorn',
    isNewMatch: false,
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    hasUnreadMessages: true,
    matchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: 'match-4',
    participantId: 'couple2',
    participantName: 'Alex & Jordan',
    participantAvatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'couple',
    isNewMatch: false,
    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    hasUnreadMessages: false,
    matchedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
  {
    id: 'match-5',
    participantId: 'user5',
    participantName: 'Maya',
    participantAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    participantType: 'unicorn',
    isNewMatch: false,
    lastMessageTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    hasUnreadMessages: false,
    matchedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
  },
];

const formatMatchTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-25 transition-all duration-200 text-left shadow-sm hover:shadow-md"
    >
      <div className="flex items-center space-x-4">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-100">
            <img
              src={match.participantAvatar}
              alt={match.participantName}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* New Match Badge */}
          {match.isNewMatch && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
          
          {/* Unread Messages Indicator */}
          {match.hasUnreadMessages && !match.isNewMatch && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* Match Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800 truncate text-lg">
              {match.participantName}
            </h3>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {match.lastMessageTime && (
                <span className="text-xs text-gray-500">
                  {formatMatchTime(match.lastMessageTime)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                match.participantType === 'unicorn'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-pink-100 text-pink-700'
              }`}
            >
              {match.participantType === 'unicorn' ? '🦄 Unicorn' : '👫 Couple'}
            </span>
            
            {match.isNewMatch && (
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                New Match!
              </span>
            )}
          </div>
        </div>

        {/* Chat Icon */}
        <div className="flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </button>
  );
};

export const MatchesScreen: React.FC<MatchesScreenProps> = ({ onNavigateToChat }) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Separate matches into new and active conversations
  const newMatches = mockMatches.filter(match => match.isNewMatch);
  const activeConversations = mockMatches
    .filter(match => !match.isNewMatch)
    .sort((a, b) => {
      // Sort by last message time, then by match time
      const aTime = a.lastMessageTime || a.matchedAt;
      const bTime = b.lastMessageTime || b.matchedAt;
      return bTime.getTime() - aTime.getTime();
    });

  const handleMatchClick = (match: Match) => {
    // Notify parent component that we're navigating to chat
    onNavigateToChat?.();
    
    // Convert Match to Chat format for ChatConversation component
    const chatData = {
      id: match.id,
      participantId: match.participantId,
      participantName: match.participantName,
      participantAvatar: match.participantAvatar,
      participantType: match.participantType,
      lastMessage: {
        id: 'placeholder',
        senderId: match.participantId,
        content: 'Start your conversation...',
        timestamp: match.lastMessageTime || match.matchedAt,
        isRead: true
      },
      unreadCount: match.hasUnreadMessages ? 1 : 0,
      isOnline: Math.random() > 0.5, // Random online status for demo
      isVerified: Math.random() > 0.3 // Random verification for demo
    };
    
    setSelectedMatch(match);
  };

  if (selectedMatch) {
    const chatData = {
      id: selectedMatch.id,
      participantId: selectedMatch.participantId,
      participantName: selectedMatch.participantName,
      participantAvatar: selectedMatch.participantAvatar,
      participantType: selectedMatch.participantType,
      lastMessage: {
        id: 'placeholder',
        senderId: selectedMatch.participantId,
        content: 'Start your conversation...',
        timestamp: selectedMatch.lastMessageTime || selectedMatch.matchedAt,
        isRead: true
      },
      unreadCount: selectedMatch.hasUnreadMessages ? 1 : 0,
      isOnline: Math.random() > 0.5,
      isVerified: Math.random() > 0.3
    };

    return (
      <ChatConversation
        chat={chatData}
        onBack={() => setSelectedMatch(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20" style={{ backgroundColor: '#faf7ff' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-purple-100 shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">Your Matches</h1>
            <div className="text-sm text-gray-500">
              {mockMatches.length} total matches
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* New Matches Section */}
        {newMatches.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">New Matches</h2>
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                {newMatches.length}
              </span>
            </div>
            <div className="space-y-3">
              {newMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => handleMatchClick(match)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active Conversations Section */}
        {activeConversations.length > 0 && (
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Active Conversations</h2>
            </div>
            <div className="space-y-3">
              {activeConversations.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => handleMatchClick(match)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {mockMatches.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-sm mx-auto">
              Keep exploring and liking profiles to find your perfect connections!
            </p>
            <button className="bg-purple-400 hover:bg-purple-500 text-white font-medium py-3 px-6 rounded-xl transition-colors">
              Start Discovering
            </button>
          </div>
        )}
      </div>
    </div>
  );
};