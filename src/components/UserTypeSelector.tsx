import React, { useState } from 'react';
import { Heart, Users } from 'lucide-react';

type UserType = 'unicorn' | 'couple' | null;

interface UserTypeSelectorProps {
  onSelect: (type: UserType) => void;
  selected?: UserType;
}

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ onSelect, selected }) => {
  const [selectedType, setSelectedType] = useState<UserType>(selected || null);

  const handleSelect = (type: UserType) => {
    setSelectedType(type);
    onSelect(type);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        How would you like to join CORNR?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button
          onClick={() => handleSelect('unicorn')}
          className={`p-6 rounded-xl border-2 transition-all duration-200 ${
            selectedType === 'unicorn'
              ? 'border-purple-400 bg-purple-50 shadow-lg'
              : 'border-purple-200 hover:border-purple-300 hover:bg-purple-25'
          }`}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className={`p-3 rounded-full ${
              selectedType === 'unicorn' ? 'bg-purple-200' : 'bg-purple-100'
            }`}>
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Single Unicorn</h3>
            <p className="text-sm text-gray-600 text-center">
              Join as an individual looking to connect with couples or other unicorns
            </p>
          </div>
        </button>

        <button
          onClick={() => handleSelect('couple')}
          className={`p-6 rounded-xl border-2 transition-all duration-200 ${
            selectedType === 'couple'
              ? 'border-purple-400 bg-purple-50 shadow-lg'
              : 'border-purple-200 hover:border-purple-300 hover:bg-purple-25'
          }`}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className={`p-3 rounded-full ${
              selectedType === 'couple' ? 'bg-purple-200' : 'bg-purple-100'
            }`}>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Couple</h3>
            <p className="text-sm text-gray-600 text-center">
              Join as a couple looking to connect with unicorns
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};