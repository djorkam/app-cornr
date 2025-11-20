import { supabase } from '../lib/supabase';

interface SignUpData {
  email: string;
  password: string;
  name: string;
  birthdate: string;
  gender: string;
  customGender?: string;
}

export const authService = {
  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Step 1: Create account with email/password only
  async signUpWithEmail(email: string, password: string) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return { data: null, error: authError };
    if (!authData.user) return { data: null, error: new Error('No user created') };

    // Create minimal profile_member (no personal data yet)
    const { data: memberData, error: memberError } = await supabase
      .from('profile_members')
      .insert({
        auth_user_id: authData.user.id,
        name: null,
        birthdate: null,
        gender: null,
        profile_completed: false
      })
      .select()
      .single();

    if (memberError) {
      // Cleanup: delete auth user if profile_member creation fails
      console.error('Failed to create profile_member:', memberError);
      // Note: Cannot delete user via client, but Supabase will clean up unverified users
      return { data: null, error: memberError };
    }

    return { 
      data: { 
        user: authData.user, 
        member: memberData 
      }, 
      error: null 
    };
  },

  // Step 2: Complete profile after email verification
  async completeProfile(userId: string, userType: 'unicorn' | 'couple', profileData: {
    name: string;
    birthdate: string;
    gender: string;
    customGender?: string;
  }) {
    
    // First, create the profile
    const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .insert({
    user_type: userType,
    location: '',
    looking_for: '',
    interests: [],
    is_complete: userType === 'unicorn'
  })
  .select()
  .single();
    
    
    if (profileError) return { data: null, error: profileError };

    // Then update profile_member with personal data and link to profile
    const { data: memberData, error: updateError } = await supabase
      .from('profile_members')
      .update({
        profile_id: profile.id,
        name: profileData.name,
        birthdate: profileData.birthdate,
        gender: profileData.gender,
        custom_gender: profileData.customGender,
        profile_completed: true
      })
      .eq('auth_user_id', userId)
      .select()
      .single();

    if (updateError) return { data: null, error: updateError };

    return { data: { profile, member: memberData }, error: null };
  },

 
// Get user's profile member info
async getProfileMember(userId: string) {
  const { data, error } = await supabase
    .from('profile_members')
    .select(`
      *,
      profile:profiles(
        id,
        user_type,
        location,
        looking_for,
        couple_bio,
        interests,
        created_at,
        updated_at
      )
    `)
    .eq('auth_user_id', userId)
    .single();
  
  return { data, error };
}
};