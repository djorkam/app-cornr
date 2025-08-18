import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

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

interface ChatConversationProps {
  chat: Chat;
  onBack: () => void;
}

// Mock conversation messages
const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'msg1-1',
      senderId: 'user1',
      content: 'Hi there! I saw your profile and I love your art pieces!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg1-2',
      senderId: 'demo-user-id',
      content: 'Thank you so much! That means a lot. I saw you\'re into yoga - I\'ve been wanting to try it.',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg1-3',
      senderId: 'user1',
      content: 'Oh that\'s perfect! I teach classes downtown. Would love to show you some basics sometime.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg1-4',
      senderId: 'demo-user-id',
      content: 'That sounds amazing! I\'d love that. When are you usually free?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg1-5',
      senderId: 'user1',
      content: 'Hey! I saw your profile and loved your art pieces. Would love to chat more about your creative process!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false
    }
  ],
  '2': [
    {
      id: 'msg2-1',
      senderId: 'couple1',
      content: 'Hi! We really enjoyed chatting with you yesterday. You seem like such a genuine person!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg2-2',
      senderId: 'demo-user-id',
      content: 'Aww thank you! I had such a great time talking with you both too. You have such a beautiful connection.',
      timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg2-3',
      senderId: 'couple1',
      content: 'That\'s so sweet of you to say! We were thinking, would you like to grab dinner this weekend? Nothing fancy, just good food and conversation.',
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg2-4',
      senderId: 'demo-user-id',
      content: 'Thanks for the great conversation yesterday! Looking forward to meeting up this weekend.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true
    }
  ]
};

const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  return timestamp.toLocaleDateString();
};

export const ChatConversation: React.FC<ChatConversationProps> = ({ chat, onBack }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages[chat.id] || []);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'demo-user-id',
      content: newMessage.trim(),
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate a response after a short delay
    setTimeout(() => {
      const response: Message = {
        id: `msg-response-${Date.now()}`,
        senderId: chat.participantId,
        content: 'Thanks for your message! I\'ll get back to you soon.',
        timestamp: new Date(),
        isRead: false
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b transition-colors" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
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
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--purple-light)' }}>
                <img
                  src={chat.participantAvatar}
                  alt={chat.participantName}
                  className="w-full h-full object-cover"
                />
              </div>
              {chat.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {chat.participantName}
                </h2>
                <span className="text-sm">
                  {chat.participantType === 'unicorn' ? '🦄' : '👫'}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {chat.isOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Start your conversation with {chat.participantName}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 'demo-user-id' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.senderId === 'demo-user-id'
                  ? 'rounded-br-md'
                  : 'rounded-bl-md'
              }`}
              style={{
                backgroundColor: message.senderId === 'demo-user-id' 
                  ? 'var(--purple-primary)' 
                  : 'var(--bg-tertiary)',
                color: message.senderId === 'demo-user-id' 
                  ? '#FFFFFF' 
                  : 'var(--text-primary)'
              }}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === 'demo-user-id' 
                    ? 'text-white/70' 
                    : 'text-gray-500'
                }`}>
                  {formatMessageTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t px-4 py-4" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 rounded-full transition-colors disabled:opacity-50"
            style={{
              backgroundColor: newMessage.trim() ? 'var(--purple-primary)' : 'var(--bg-tertiary)',
              color: newMessage.trim() ? '#FFFFFF' : 'var(--text-tertiary)'
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};