import { supabase } from '../lib/supabase';

export const profileService = {
  // Get user's profile_member info
  async getProfileMember(userId: string) {
    const { data, error } = await supabase
      .from('profile_members')
      .select('*, profile:profiles(*)')
      .eq('auth_user_id', userId)
      .single();
    
    return { data, error };
  },

// Create profile (unicorn or couple)
async createProfile(userId: string, profileData: {
  userType: 'unicorn' | 'couple';
  name: string;
  bio?: string;
}) {
  // Create profile (shared couple data)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_type: profileData.userType,
      location: '',
      looking_for: '',
      interests: []
    })
    .select()
    .single();

  if (profileError) {
    return { data: null, error: profileError };
  }

  // Update profile_member with personal data
  const { data: member, error: memberError } = await supabase
    .from('profile_members')
    .update({
      profile_id: profile.id,
      name: profileData.name,
      bio: profileData.bio || '',
      profile_completed: true
    })
    .eq('auth_user_id', userId)
    .select()
    .single();

  if (memberError) {
    return { data: null, error: memberError };
  }

  return { data: { profile, member }, error: null };
},

  // Update profile
  async updateProfile(profileId: string, updates: Partial<{
    name: string;
    bio: string;
    location: string;
    looking_for: string;
    interests: string[];
  }>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();
    
    return { data, error };
  }
};