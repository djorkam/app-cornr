import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MoreHorizontal, Check } from 'lucide-react';

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
      senderId: 'sarah_id',
      senderName: 'Sarah',
      content: 'Hi there! We really enjoyed chatting with you yesterday. You seem like such a genuine person!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg2-2',
      senderId: 'demo-user-id',
      content: 'Aww thank you! I had such a great time talking with you both too. You have such a beautiful connection.',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg2-3',
      senderId: 'mike_id',
      senderName: 'Mike',
      content: 'That\'s so sweet of you to say! We were thinking, would you like to grab dinner this weekend? Nothing fancy, just good food and conversation.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg2-4',
      senderId: 'demo-user-id',
      content: 'Thanks for the great conversation yesterday! Looking forward to meeting up this weekend.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: 'msg2-5',
      senderId: 'sarah_id',
      senderName: 'Sarah',
      content: 'Perfect! We can\'t wait to meet you in person. Mike found this great little place downtown.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isRead: true
    }
  ],
  '3': [
    {
      id: 'msg3-1',
      senderId: 'user3',
      content: 'The yoga class was amazing! We should definitely go together next time 🧘‍♀️',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true
    }
  ]
};

const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return timestamp.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Safety Menu Component
const SafetyMenu: React.FC<{isOpen: boolean, onClose: () => void}> = ({ isOpen }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 min-w-[160px] z-50">
      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        Report User
      </button>
      <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
        Block User
      </button>
    </div>
  );
};

export const ChatConversation: React.FC<ChatConversationProps> = ({ chat, onBack }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages[chat.id] || []);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to get partner-specific colors based on CORNR logo
  const getPartnerColor = (senderId: string, senderName?: string) => {
    if (chat.participantType === 'couple' && senderName) {
      // Partner A gets teal from logo, Partner B gets burgundy from logo
      if (senderName === 'Sarah' || senderId === 'sarah_id') {
        return {
          background: 'linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%)', // Very light teal
          text: '#0d9488', // Teal from logo
          border: '#99f6e4' // Light teal border
        };
      } else {
        return {
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', // Very light burgundy/pink
          text: '#be185d', // Burgundy/deep pink from logo  
          border: '#f9a8d4' // Light pink border
        };
      }
    }
    // Default for user's own messages - purple theme
    return {
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', // Very light purple
      text: '#7c3aed', // Purple to match theme
      border: '#d8b4fe' // Light purple border
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when component mounts
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClick = () => setShowSafetyMenu(false);
    if (showSafetyMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showSafetyMenu]);

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
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = '48px';
    }
    
    // Simulate a response after a short delay
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        'Thanks for your message! 😊',
        'That sounds great! When would work for you?',
        'I\'d love to know more about that!',
        'Absolutely! Let\'s plan something soon.'
      ];
      const response: Message = {
        id: `msg-response-${Date.now()}`,
        senderId: chat.participantId,
        senderName: chat.participantType === 'couple' ? ['Sarah', 'Mike'][Math.floor(Math.random() * 2)] : undefined,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        isRead: false
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(inputRef.current.scrollHeight, 48), 120);
      inputRef.current.style.height = newHeight + 'px';
    }
  }, [newMessage]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-white" style={{ paddingBottom: '80px' }}>
      {/* Header with refined styling */}
      <div className="flex-shrink-0 bg-white border-b border-purple-100 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 rounded-full text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-purple-200">
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
                  <h2 className="font-semibold text-gray-900 truncate">
                    {chat.participantName}
                  </h2>
                  {chat.isVerified && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {chat.isOnline ? 'Online' : 'Last seen recently'}
                </p>
              </div>
            </div>

            {/* Safety Menu */}
            <div className="relative">
              <button 
                className="p-2 rounded-full text-gray-600 hover:bg-purple-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSafetyMenu(!showSafetyMenu);
                }}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <SafetyMenu isOpen={showSafetyMenu} onClose={() => setShowSafetyMenu(false)} />
            </div>
          </div>
        </div>
      </div>

      {/* Messages with bottom padding for fixed input - HIDE SCROLLBAR ON MOBILE */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-hide" 
        style={{ 
          paddingBottom: '120px',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none'  /* IE/Edge */
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Start your conversation with {chat.participantName}</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderId === 'demo-user-id';
              const showTime = index === 0 || 
                Math.abs(message.timestamp.getTime() - messages[index - 1].timestamp.getTime()) > 15 * 60 * 1000;
              
              return (
                <div key={message.id}>
                  {showTime && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-gray-400 bg-white/80 px-3 py-1.5 rounded-full shadow-sm font-medium backdrop-blur-sm">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div 
                      className={`max-w-xs lg:max-w-md px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md ${
                        isOwn
                          ? 'rounded-2xl rounded-br-md border'
                          : 'bg-white rounded-2xl rounded-bl-md text-gray-800 border border-gray-100'
                      }`}
                      style={{
                        ...(isOwn ? {
                          background: getPartnerColor(message.senderId, message.senderName).background,
                          color: getPartnerColor(message.senderId, message.senderName).text,
                          borderColor: getPartnerColor(message.senderId, message.senderName).border
                        } : {}),
                        animation: 'messageSlideIn 0.3s ease-out'
                      }}
                    >
                      {!isOwn && message.senderName && chat.participantType === 'couple' && (
                        <p className={`text-xs font-semibold mb-1 ${
                          message.senderName === 'Sarah' ? 'text-teal-600' : 'text-pink-600'
                        }`}>
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm leading-snug">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md max-w-xs shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400 text-sm mr-2">{chat.participantName} is typing</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Clean Input Area - Fixed at bottom with footer spacing */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 px-4 py-3 shadow-lg" style={{ marginBottom: '80px', zIndex: 10 }}>
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          {/* Textarea container with proper flex behavior */}
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${chat.participantName}...`}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200"
              style={{ 
                minHeight: '44px',
                maxHeight: '100px',
                lineHeight: '1.3',
                fontSize: '16px',
                resize: 'none',
                overflow: 'hidden'
              }}
              rows={1}
            />
          </div>
          
          {/* Send button - aligned to visual center of textarea */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-sm"
            style={{
              backgroundColor: newMessage.trim() ? '#8b5cf6' : '#d1d5db',
              color: '#ffffff',
              transform: newMessage.trim() ? 'scale(1.05)' : 'scale(1)',
              alignSelf: 'center'
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Hide scrollbar on mobile - much cleaner UX */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Ensure textarea behaves properly - NO RESIZE ARROWS */
        textarea {
          font-family: inherit;
          -webkit-appearance: none;
          -moz-appearance: none;
          resize: none !important;
          overflow: hidden;
        }
        
        /* Hide resize handle on all browsers */
        textarea::-webkit-resizer {
          display: none;
        }
        
        /* Smooth focus transitions */
        textarea:focus {
          background-color: #ffffff;
          box-shadow: 0 0 0 2px #8b5cf6, 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};
