import React from 'react';
import { ContentBlock } from './ContentBlock';
import { Sparkles, Users, Heart, Shield } from 'lucide-react';

interface HomePageProps {
  onNavigateToProfile?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToProfile }) => {
  const latestMatches = [
    {
      id: '1',
      name: 'Sarah & Mike',
      image: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'New match! They love hiking and cooking together.'
    },
    {
      id: '2',
      name: 'Luna',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Artist and yoga instructor, 2.5 km away'
    }
  ];

  const suggestions = [
    {
      id: '1',
      title: 'Complete Your Profile',
      description: 'Add more photos and details to increase your matches by 3x',
      onClick: onNavigateToProfile
    },
    {
      id: '2',
      title: 'Verify Your Identity',
      description: 'Build trust with photo verification'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-white rounded-full">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Welcome to CORNR</h2>
        </div>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Your safe space for meaningful connections. Explore, connect, and build trust with like-minded individuals.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 rounded-lg p-3">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-700 leading-relaxed">1.2k+ Members</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <Heart className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-700 leading-relaxed">Safe & Trusted</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <Shield className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-700 leading-relaxed">Verified Users</p>
          </div>
        </div>
      </div>

      {/* Latest Matches */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestMatches.map((match) => (
            <ContentBlock
              key={match.id}
              imageUrl={match.image}
              title={match.name}
              description={match.description}
            />
          ))}
        </div>
      </section>

      {/* Suggestions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Suggestions for You</h2>
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <ContentBlock
              key={suggestion.id}
              title={suggestion.title}
              description={suggestion.description}
              className="border-l-4 border-purple-400"
              onClick={suggestion.onClick}
            />
          ))}
        </div>
      </section>
    </div>
  );
};