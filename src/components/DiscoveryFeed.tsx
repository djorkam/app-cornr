// Refactored DiscoveryFeed.tsx for CORNR
import React, { useState } from 'react';
import { Heart, X, MessageCircle } from 'lucide-react';
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
  // Sample profiles (unchanged)
];

export const DiscoveryFeed: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'swipe' | 'feed'>('feed');

  const currentProfile = mockProfiles[currentIndex];

  const handleSwipe = () => {
    setCurrentIndex((prev) => (prev + 1) % mockProfiles.length);
  };

  return (
    <div className="max-w-screen-sm mx-auto p-6">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Discover</h2>
        <div className="flex rounded-full bg-gray-100 border border-gray-200">
          {['feed', 'swipe'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as 'swipe' | 'feed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-white text-purple-700 shadow'
                  : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Feed View */}
      {viewMode === 'feed' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mockProfiles.map((profile) => (
            <ContentBlock
              key={profile.id}
              imageUrl={profile.images[0]}
              title={`${profile.name}, ${profile.age}`}
              description={`${profile.bio.substring(0, 100)}... • ${profile.distance}km away`}
              className="bg-white rounded-xl shadow hover:scale-105 transition-transform"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="aspect-[3/4] rounded-t-2xl overflow-hidden">
            <img
              src={currentProfile.images[0]}
              alt={currentProfile.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {currentProfile.name}, {currentProfile.age}
              </h3>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  currentProfile.type === 'unicorn'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-pink-100 text-pink-700'
                }`}
              >
                {currentProfile.type === 'unicorn' ? '🦄 Unicorn' : '👫 Couple'}
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {currentProfile.bio}
            </p>
            <p className="text-xs text-gray-500 mb-6">📍 {currentProfile.distance} km away</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleSwipe}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition transform hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition transform hover:scale-110">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </button>
              <button
                onClick={handleSwipe}
                className="p-3 bg-purple-100 hover:bg-purple-200 rounded-full transition transform hover:scale-110"
              >
                <Heart className="w-5 h-5 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
