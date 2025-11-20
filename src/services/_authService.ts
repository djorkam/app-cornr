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
  // Step 1: Sign up creates auth.users + profile_member
  async signUp(data: SignUpData) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) return { data: null, error: authError };
    if (!authData.user) return { data: null, error: new Error('No user created') };

    // Create profile_member record
    const { data: memberData, error: memberError } = await supabase
      .from('profile_members')
      .insert({
        auth_user_id: authData.user.id,
        name: data.name,
        birthdate: data.birthdate,
        gender: data.gender,
        custom_gender: data.customGender,
        profile_id: null, // Not linked yet
        role: null
      })
      .select()
      .single();

    if (memberError) {
      // Cleanup: delete auth user if profile_member creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { data: null, error: memberError };
    }

    return { data: { user: authData.user, member: memberData }, error: null };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
};