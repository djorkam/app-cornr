import React, { useState } from 'react';
import { Heart, X, MessageCircle, MoreHorizontal } from 'lucide-react';
import { ContentBlock } from './ContentBlock';

interface Profile {
  id: string;
  name: string;
  age: number;
  type: 'unicorn' | 'couple';
  images: string[];
  bio: string;
  distance: number;
}

const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Emma',
    age: 28,
    type: 'unicorn',
    images: ['https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'],
    bio: 'Adventure seeker, yoga enthusiast, and lover of deep conversations. Looking for genuine connections.',
    distance: 2.5
  },
  {
    id: '2',
    name: 'Alex & Jordan',
    age: 32,
    type: 'couple',
    images: ['https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400'],
    bio: 'Married for 5 years, exploring new connections together. We love hiking, cooking, and board games.',
    distance: 4.1
  },
  {
    id: '3',
    name: 'Maya',
    age: 26,
    type: 'unicorn',
    images: ['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'],
    bio: 'Artist and free spirit. Passionate about music, travel, and meaningful connections.',
    distance: 1.8
  }
];

export const DiscoveryFeed: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'swipe' | 'feed'>('feed');

  const currentProfile = mockProfiles[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    setCurrentIndex((prev) => (prev + 1) % mockProfiles.length);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Discover</h2>
        <div className="flex bg-purple-100 rounded-full p-1">
          <button
            onClick={() => setViewMode('feed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'feed'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setViewMode('swipe')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'swipe'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            Swipe
          </button>
        </div>
      </div>

      {viewMode === 'feed' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProfiles.map((profile) => (
            <ContentBlock
              key={profile.id}
              imageUrl={profile.images[0]}
              title={`${profile.name}, ${profile.age}`}
              description={`${profile.bio.substring(0, 100)}... • ${profile.distance}km away`}
              className="hover:scale-105 transition-transform"
            />
          ))}
        </div>
      ) : (
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={currentProfile.images[0]}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {currentProfile.name}, {currentProfile.age}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentProfile.type === 'unicorn'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-pink-100 text-pink-700'
                }`}>
                  {currentProfile.type === 'unicorn' ? '🦄 Unicorn' : '👫 Couple'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{currentProfile.bio}</p>
              
              <p className="text-sm text-gray-500 mb-6">
                📍 {currentProfile.distance}km away
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleSwipe('left')}
                  className="p-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
                
                <button className="p-4 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </button>
                
                <button
                  onClick={() => handleSwipe('right')}
                  className="p-4 bg-purple-100 hover:bg-purple-200 rounded-full transition-colors"
                >
                  <Heart className="w-6 h-6 text-purple-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};