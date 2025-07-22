import React from 'react';
import { useState } from 'react';
import { SignInScreen } from './components/SignInScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { DiscoveryFeed } from './components/DiscoveryFeed';
import { ProfileScreen } from './components/ProfileScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<'signin' | 'register'>('signin');
  const [activeTab, setActiveTab] = useState('home');
  const [userType, setUserType] = useState<'unicorn' | 'couple' | null>(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    birthdate: '',
    bio: '',
    photo: null as File | null,
    location: '',
    lookingFor: '',
    interests: [] as string[]
  });
  const [saveMessage, setSaveMessage] = useState('');

  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSkipForNow = () => {
    // Allow users to preview the app without authentication
    setIsAuthenticated(true);
    setUserType('unicorn'); // Default type for preview
  };

  const handleRegister = (type: 'unicorn' | 'couple', profileData?: any) => {
    setUserType(type);
    if (profileData) {
      setUserProfile(prev => ({
        ...prev,
        ...profileData,
        interests: []
      }));
    }
    setIsAuthenticated(true);
  };

  const handleSaveProfile = () => {
    // Here you would typically save to a backend/database
    // For now, we'll just show a success message
    setSaveMessage('Profile saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    if (authScreen === 'signin') {
      return (
        <SignInScreen 
          onSignIn={handleSignIn}
          onSwitchToRegister={() => setAuthScreen('register')}
          onSkipForNow={handleSkipForNow}
        />
      );
    } else {
      return (
        <RegisterScreen 
          onRegister={handleRegister}
          onSwitchToSignIn={() => setAuthScreen('signin')}
        />
      );
    }
  }

  // Main app content after authentication
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigateToProfile={() => setActiveTab('profile')} />;
      case 'discover':
        return <DiscoveryFeed />;
      case 'matches':
        return (
          <div className="max-w-4xl mx-auto p-4 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Matches</h2>
            <div className="text-center py-12">
              <p className="text-gray-500">No matches yet. Keep exploring!</p>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="max-w-4xl mx-auto p-4 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Messages</h2>
            <div className="text-center py-12">
              <p className="text-gray-500">No messages yet. Start a conversation!</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <ProfileScreen
            userType={userType}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            saveMessage={saveMessage}
            handleSaveProfile={handleSaveProfile}
          />
        );
      default:
        return <HomePage onNavigateToProfile={() => setActiveTab('profile')} />;
    }
  };

  return (
    <div className="min-h-screen bg-purple-25">
      <Header />
      <main className="pt-4">
        {renderContent()}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}