import React, { useState } from 'react';

interface ProfileScreenProps {
  userType: 'unicorn' | 'couple' | null;
  userProfile: {
    name: string;
    birthdate: string;
    bio: string;
    photo: File | null;
    location: string;
    lookingFor: string;
    interests: string[];
  };
  setUserProfile: React.Dispatch<React.SetStateAction<{
    name: string;
    birthdate: string;
    bio: string;
    photo: File | null;
    location: string;
    lookingFor: string;
    interests: string[];
  }>>;
  saveMessage: string;
  handleSaveProfile: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userType,
  userProfile,
  setUserProfile,
  saveMessage,
  handleSaveProfile
}) => {
  const [newInterest, setNewInterest] = useState('');
  
  const addInterest = (interest: string) => {
    if (interest.trim() && !userProfile.interests.includes(interest.trim())) {
      setUserProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
    }
  };
  
  const removeInterest = (interest: string) => {
    setUserProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };
  
  const handleInterestKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      addInterest(newInterest);
      setNewInterest('');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto page-container pb-20">
      <h2 className="text-2xl font-semibold mb-6 section-spacing">Your Profile</h2>
      
      {/* Profile Type Badge */}
      <div className="mb-6 section-spacing">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          userType === 'unicorn' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-pink-100 text-pink-700'
        }`}>
          {userType === 'unicorn' ? '🦄 Unicorn Profile' : '👫 Couple Profile'}
        </span>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Profile Photo</h3>
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 text-2xl">
              {userType === 'unicorn' ? '🦄' : '👫'}
            </span>
          </div>
          <div>
            <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: '#B19CD9', color: '#FFFFFF' }}>
              {userType === 'couple' ? 'Upload Joint Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs mt-1" style={{ color: '#B0B0B0' }}>
              {userType === 'couple' ? 'Joint photo or two small ones' : 'Your best photo'}
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="form-label">
              {userType === 'couple' ? 'Names (e.g. "Anna & Luca")' : 'Name'}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder={userType === 'couple' ? 'Anna & Luca' : 'Your name'}
              value={userProfile.name}
              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Age */}
          <div>
            <label className="form-label">
              {userType === 'couple' ? 'Ages (both individuals)' : 'Age'}
            </label>
            {userType === 'couple' ? (
              <div className="flex space-x-2">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Your age"
                  min="18"
                  max="99"
                />
                <input
                  type="number"
                  className="form-input"
                  placeholder="Partner's age"
                  min="18"
                  max="99"
                />
              </div>
            ) : (
              <input
                type="number"
                className="form-input"
                placeholder="Your age"
                min="18"
                max="99"
                value={userProfile.birthdate ? (() => {
                  const birthDate = new Date(userProfile.birthdate);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                  return age;
                })() : ''}
                readOnly
              />
            )}
          </div>

          {/* Location */}
          <div>
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="City, State"
              value={userProfile.location}
              onChange={(e) => setUserProfile(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">About {userType === 'couple' ? 'Us' : 'Me'}</h3>
        <div>
          <label className="form-label">
            Bio / About {userType === 'couple' ? 'us' : 'me'}
          </label>
          <textarea
            rows={4}
            className="form-input resize-none"
            placeholder={userType === 'couple' 
              ? 'Tell others about yourselves as a couple. You can write a shared bio or include short individual descriptions.'
              : 'Tell others about yourself, your interests, and what makes you unique.'
            }
            value={userProfile.bio}
            onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
          />
          <p className="text-sm mt-1 text-gray-500 leading-relaxed">
            {userType === 'couple' ? 'Can be a shared bio or two short individual bios' : 'Share what makes you unique'}
          </p>
        </div>
      </div>

      {/* Looking For Section */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Looking For</h3>
        <div>
          <label className="form-label">What are you looking for?</label>
          <select 
            className="form-input"
            value={userProfile.lookingFor}
            onChange={(e) => setUserProfile(prev => ({ ...prev, lookingFor: e.target.value }))}
          >
            <option value="">Select what you're looking for</option>
            {userType === 'couple' ? (
              <>
                <option value="unicorn">Looking for a unicorn</option>
                <option value="curious-connections">Open to curious connections</option>
                <option value="friendship">Friendship first</option>
                <option value="casual-meetup">Grab a beer or a glass of wine</option>
                <option value="exploring">Just exploring</option>
              </>
            ) : (
              <>
                <option value="couples">Interested in couples</option>
                <option value="curious-connections">Curious connections</option>
                <option value="friendship">Friendship first</option>
                <option value="casual-meetup">Grab a beer or a glass of wine</option>
                <option value="exploring">Just exploring</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Interests/Tags Section */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Interests & Tags</h3>
        <div className="mb-4">
          <label className="form-label">Add your interests</label>
          <input
            type="text"
            className="form-input"
            placeholder="Type an interest and press Enter"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={handleInterestKeyPress}
          />
        </div>
        
        {/* Current Interests */}
        {userProfile.interests.length > 0 && (
          <div className="mb-4">
            <p className="form-label">Your interests:</p>
            <div className="flex flex-wrap gap-2">
              {userProfile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm flex items-center"
                >
                  {interest}
                  <button
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Sample Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['Travel', 'Yoga', 'Cooking', 'Music', 'Art', 'Hiking', 'Photography', 'Dancing'].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors cursor-pointer"
              onClick={() => addInterest(tag)}
            >
              {tag} +
            </button>
          ))}
        </div>
        
        <p className="text-sm text-gray-500 leading-relaxed">Click on interests above to add them to your profile</p>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 section-spacing">
        {saveMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {saveMessage}
          </div>
        )}
        <button 
          className="btn-primary"
          onClick={handleSaveProfile}
        >
          Save Profile Changes
        </button>
      </div>
    </div>
  );
};