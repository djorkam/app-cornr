import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { SignInScreen } from './components/SignInScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { DiscoveryFeed } from './components/DiscoveryFeed';
import { ProfileScreen } from './components/ProfileScreen';
import { EnterCodeScreen } from './components/EnterCodeScreen';
import { ChatList } from './components/ChatList';
import { extractInviteCodeFromUrl, storePendingInviteCode } from './utils/partnerUtils';

export default function App() {
  const [showInviteFlow, setShowInviteFlow] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<'signin' | 'register'>('signin');
  const [activeTab, setActiveTab] = useState('home');
  const [userType, setUserType] = useState<'unicorn' | 'couple'>('unicorn');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    birthdate: "",
    gender: "prefer-not",
    bio: "",
    photo: null,
    location: "",
    lookingFor: "",
    interests: [],
  });
  const [saveMessage, setSaveMessage] = useState('');

  // Handle deep link invite codes
  useEffect(() => {
    const codeFromUrl = extractInviteCodeFromUrl();
    if (codeFromUrl && !isAuthenticated) {
      setInviteCode(codeFromUrl);
      storePendingInviteCode(codeFromUrl);
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isAuthenticated]);

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

  const handleInviteCodeEntry = () => {
    setShowInviteFlow(true);
  };

  const handleBackFromInvite = () => {
    setShowInviteFlow(false);
    setInviteCode(null);
  };

  const handlePartnerLinked = (partnerInfo: any) => {
    console.log('Partner linked:', partnerInfo);
    setShowInviteFlow(false);
    setInviteCode(null);
    // Could show a success message or update user profile
  };

  // Show invite code entry screen if we have a deep link code and user is authenticated
  if (showInviteFlow || (inviteCode && isAuthenticated)) {
    return (
      <EnterCodeScreen
        userId="demo-user-id"
        onBack={handleBackFromInvite}
        onPartnerLinked={handlePartnerLinked}
        onGenerateCode={() => {
          setShowInviteFlow(false);
          setActiveTab('profile');
        }}
        prefilledCode={inviteCode || undefined}
      />
    );
  }

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
          <ChatList />
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
    <div className="min-h-screen transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Header />
      <main className="pt-4">
        {renderContent()}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}