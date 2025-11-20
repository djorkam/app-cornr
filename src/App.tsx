import { useState, useEffect } from 'react';
import { SignInScreen } from './components/SignInScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { DiscoveryFeed } from './components/DiscoveryFeed';
import { ProfileScreen } from './components/ProfileScreen';
import { EnterCodeScreen } from './components/EnterCodeScreen';
import { ConnectionsScreen } from './components/ConnectionsScreen';
import { DiscoveryPreferencesScreen } from './components/DiscoveryPreferencesScreen';
import { AccountSettingsScreen } from './components/AccountSettingsScreen';
import { extractInviteCodeFromUrl, storePendingInviteCode } from './utils/partnerUtils';
import {UserProfile} from './utils/utils';
import { useAuth } from './hooks/useAuth';
import { authService } from './services/authService';
import { photoService } from './services/photoService';

import { testSupabaseConnection } from './test/test-supabase';
import { supabase } from './lib/supabase';


//import { TestAuthButton } from './test/test-auth';

export default function App() {
  const [showInviteFlow, setShowInviteFlow] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const isAuthenticated = !!user; // user exists = authenticated
  // const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  // const [isCheckingProfile, setIsCheckingProfile] = useState(true);
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
  const [showDiscoveryPreferences, setShowDiscoveryPreferences] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [discoveryPreferences, setDiscoveryPreferences] = useState({
    maxDistance: 50,
    pauseDiscovery: false,
    preferredCoupleAgeRange: [22, 45] as [number, number],
    coupleComposition: ['any-couple'],
    preferredUnicornAgeRange: [22, 45] as [number, number],
    preferredUnicornGender: ['open-to-all']
  });

// const { user, loading: authLoading } = useAuth();
  
  // Handle deep link invite codes
  useEffect(() => {
    // testSupabaseConnection();
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

  // // Keep isAuthenticated synced with user (separate useEffect() block)
useEffect(() => {
  if (!user) {
    setIsAuthenticated(false);
    return;
  }

  // Check if user has completed profile before marking as authenticated
  authService.getProfileMember(user.id).then(({ data }) => {
    if (data && data.profile_completed) {
      setIsAuthenticated(true);
    } else {
      // User exists but profile incomplete - stay in registration flow
      setIsAuthenticated(false);
    }
  });
}, [user?.id]);

  // Load user profile from database when authenticated
  useEffect(() => {
  if (!user || !isAuthenticated) return;

  authService.getProfileMember(user.id).then(({ data }) => {
    if (data && data.profile) {
      setUserProfile(prev => ({
        ...prev,
        name: data.name || '',
        birthdate: data.birthdate || '',
        gender: data.gender || 'prefer-not',
        customGender: data.gender === 'other' ? (data.custom_gender || '') : '',
        bio: data.bio || '',
        photoUrl: data.photo_url || '',
        location: data.profile.location || '',
        lookingFor: data.profile.looking_for || '',
        interests: data.profile.interests || []
      }));
      setUserType(data.profile.user_type);
    }
  });
}, [user, isAuthenticated]);
  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSkipForNow = () => {
    // Allow users to preview the app without authentication
    setIsAuthenticated(true);
    setUserType('unicorn'); // Default type for preview
  };

const handleRegister = async (type: 'unicorn' | 'couple', profileData?: any) => {
  if (!user) return;
  
  setUserType(type);
  if (profileData) {
    setUserProfile(prev => ({
      ...prev,
      ...profileData,
      interests: []
    }));
  }
  
  // Save profile data to database
  try {
    const { data: memberData } = await authService.getProfileMember(user.id);
    
    if (!memberData || !memberData.profile_id) {
      console.error('Profile not found');
      return;
    }

    let photoUrl: string | null = null;

    // Upload photo if provided
    if (profileData?.photo) {
      photoUrl = await photoService.uploadProfilePhoto(user.id, profileData.photo);
    }

    // Update profile_members table with bio and photo_url
    await supabase
      .from('profile_members')
      .update({
        bio: profileData?.bio || '',
        photo_url: photoUrl
      })
      .eq('auth_user_id', user.id);
  } catch (error) {
    console.error('Error saving profile:', error);
  }
  
  setIsAuthenticated(true);
};

const handleSaveProfile = async () => {
  if (!user) return;

  setSaveMessage('');
  
  try {
    // Get current profile data
    const { data: memberData } = await authService.getProfileMember(user.id);
    
    if (!memberData || !memberData.profile_id) {
      setSaveMessage('Error: Profile not found');
      return;
    }

    // Update profile table with bio, location, interests, looking_for
    // Update shared couple data in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        
        location: userProfile.location,
        looking_for: userProfile.lookingFor,
        interests: userProfile.interests,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberData.profile_id);

    if (profileError) {
      setSaveMessage('Error saving profile');
      return;
    }

    // Update profile_member with name, gender, custom_gender
    const { error: memberError } = await supabase
      .from('profile_members')
      .update({
        name: userProfile.name,
        gender: userProfile.gender,
        custom_gender: userProfile.customGender,
        bio: userProfile.bio
      })
      .eq('auth_user_id', user.id);

    if (memberError) {
      setSaveMessage('Error saving personal info');
      return;
    }

    setSaveMessage('Profile saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  } catch (error) {
    setSaveMessage('Error saving profile');
    console.error(error);
  }
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

  const handleNavigateToDiscoveryPreferences = () => {
    setShowDiscoveryPreferences(true);
  };

  const handleBackFromDiscoveryPreferences = () => {
    setShowDiscoveryPreferences(false);
  };

  const handleSaveDiscoveryPreferences = (preferences: any) => {
    setDiscoveryPreferences(preferences);
    setShowDiscoveryPreferences(false);
  };

  const handleOpenAccountSettings = () => {
    setShowAccountSettings(true);
  };

  const handleCloseAccountSettings = () => {
    setShowAccountSettings(false);
  };

  const handleLogOutFromSettings = async () => {
    setShowAccountSettings(false);
      // Clear the Supabase session (ignore errors)
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.log("Session clear error (expected if user already deleted):", error);
  }
    setIsAuthenticated(false);
    // Optionally reset other state
    setUserProfile({
      name: "",
      birthdate: "",
      gender: "prefer-not",
      bio: "",
      photo: null,
      location: "",
      lookingFor: "",
      interests: [],
    });
    
  };


  // --- Show loading while checking authentication ---
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}
  
  // Show invite code entry screen if we have a deep link code and user is authenticated
  
  if (showInviteFlow || (inviteCode && user)) {
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

  // Show Discovery Preferences screen
  if (showDiscoveryPreferences) {
    return (
      <DiscoveryPreferencesScreen
        userType={userType}
        onBack={handleBackFromDiscoveryPreferences}
        onSave={handleSaveDiscoveryPreferences}
        initialPreferences={discoveryPreferences}
      />
    );
  }

    // Show Account Settings screen
  if (showAccountSettings && user) {
    return (
      <AccountSettingsScreen
        userId={user.id}
        onBack={handleCloseAccountSettings}
        onLogOut={handleLogOutFromSettings}
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
      case 'connections':
        return <ConnectionsScreen />;
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
      <Header 
        onNavigateToHome={() => setActiveTab('home')} 
        onNavigateToDiscoveryPreferences={handleNavigateToDiscoveryPreferences}
        onOpenAccountSettings={handleOpenAccountSettings}
      />
      <main className="pt-4">
        {renderContent()}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* <TestAuthButton /> */}
    </div>
  );
}