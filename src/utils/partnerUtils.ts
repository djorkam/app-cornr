import { supabase } from '../lib/supabase';
import { InviteCode, PartnerLinkResponse } from '../types/partnerTypes';

// Deep link handling
export const extractInviteCodeFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
};

export const createInviteLink = (code: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}?code=${code}`;
};

export const storePendingInviteCode = (code: string): void => {
  localStorage.setItem('pending_invite_code', code);
};

export const getPendingInviteCode = (): string | null => {
  return localStorage.getItem('pending_invite_code');
};

export const clearPendingInviteCode = (): void => {
  localStorage.removeItem('pending_invite_code');
};

// Generate a unique 6-character alphanumeric invite code
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate invite code format
export const isValidInviteCodeFormat = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

// Calculate expiration date (48 hours from now)
export const getInviteCodeExpiration = (): Date => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 48);
  return expiration;
};

// Check if invite code is expired
export const isInviteCodeExpired = (expiresAt: string): boolean => {
  return new Date() > new Date(expiresAt);
};

// Generate user invite code and store in database
export const generateUserInviteCode = async (userId: string): Promise<string> => {
  try {
    // Get user's profile_id
    const { data: memberData, error: memberError } = await supabase
      .from('profile_members')
      .select('profile_id')
      .eq('auth_user_id', userId)
      .single();

    if (memberError || !memberData) {
      throw new Error('User profile not found');
    }

    // Generate unique code
    let code = generateInviteCode();
    let isUnique = false;
    let attempts = 0;

    // Ensure code is unique (try up to 5 times)
    while (!isUnique && attempts < 5) {
      const { data: existing } = await supabase
        .from('partner_invites')
        .select('id')
        .eq('invite_code', code)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      } else {
        code = generateInviteCode();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique code');
    }

    // Create invite in database
    const { error: insertError } = await supabase
      .from('partner_invites')
      .insert({
        profile_id: memberData.profile_id,
        created_by_user_id: userId,
        invite_code: code,
        expires_at: getInviteCodeExpiration().toISOString(),
        is_used: false
      });

    if (insertError) {
      throw insertError;
    }

    return code;
  } catch (error) {
    console.error('Error generating invite code:', error);
    throw error;
  }
};

// Redeem invite code and link partners
export const redeemInviteCode = async (
  code: string,
  requestingUserId: string
): Promise<PartnerLinkResponse> => {
  console.log('🔵 redeemInviteCode called with:', { code, requestingUserId });
  try {
    // Get the invite from database
    const { data: invite, error: inviteError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('invite_code', code)
      .maybeSingle();

    if (inviteError || !invite) {
      return {
        success: false,
        message: 'Invalid invite code. Please check and try again.'
      };
    }

    // Check if already used
    if (invite.is_used) {
      return {
        success: false,
        message: 'This invite code has already been used.'
      };
    }

    // Check if expired
    if (isInviteCodeExpired(invite.expires_at)) {
      return {
        success: false,
        message: 'This invite code has expired (codes expire after 48 hours). Please ask your partner for a new one.'
      };
    }

    // Check if trying to use own code
    if (invite.created_by_user_id === requestingUserId) {
      return {
        success: false,
        message: 'You cannot use your own invite code.'
      };
    }

    // Get requesting user's current profile_id
    const { data: requestingMember, error: memberError } = await supabase
      .from('profile_members')
      .select('profile_id, name')
      .eq('auth_user_id', requestingUserId)
      .single();

    if (memberError || !requestingMember) {
      return {
        success: false,
        message: 'User profile not found.'
      };
    }

    // Check if requesting user is already linked to this profile
    if (requestingMember.profile_id === invite.profile_id) {
      return {
        success: false,
        message: 'You are already linked to this partner.'
      };
    }

    // Check if there's already another member linked to this profile
    const { data: existingMembers } = await supabase
      .from('profile_members')
      .select('id')
      .eq('profile_id', invite.profile_id)
      .neq('auth_user_id', invite.created_by_user_id);

    if (existingMembers && existingMembers.length > 0) {
      return {
        success: false,
        message: 'This profile already has a partner linked.'
      };
    }



// Update requesting user's profile_id to link with partner
const { error: updateError } = await supabase
  .from('profile_members')
  .update({ profile_id: invite.profile_id })
  .eq('auth_user_id', requestingUserId);

if (updateError) {
  console.error('Error updating profile_id:', updateError);
  return {
    success: false,
    message: 'Failed to link accounts. Please try again.'
  };
}

        // Delete requesting user's orphaned profile (they'll use partner's profile)
if (requestingMember.profile_id !== invite.profile_id) {
  console.log('Delete profile #2')
  await supabase
    .from('profiles')
    .delete()
    .eq('id', requestingMember.profile_id);
}

// Mark invite as used
   
console.log('About to update invite:', {
  inviteId: invite.id,
  requestingUserId,
  currentAuthUser: (await supabase.auth.getUser()).data.user?.id
});
    
await supabase
  .from('partner_invites')
  .update({
    is_used: true,
    used_by_user_id: requestingUserId,
    used_at: new Date().toISOString()
  })
  .eq('id', invite.id);

// Mark profile as complete (couple is now linked)
await supabase
  .from('profiles')
  .update({ is_complete: true })
  .eq('id', invite.profile_id);

    // Get partner info
    const { data: partnerMember } = await supabase
      .from('profile_members')
      .select('name')
      .eq('auth_user_id', invite.created_by_user_id)
      .single();

    return {
      success: true,
      message: 'Successfully linked with your partner!',
      partnerInfo: {
        id: invite.created_by_user_id,
        name: partnerMember?.name || 'Your Partner',
        email: '' // Not exposing email for privacy
      }
    };
  } catch (error) {
    console.error('Error redeeming invite code:', error);
    return {
      success: false,
      message: 'An error occurred while linking accounts. Please try again.'
    };
  }
};

// Get user's partner
export const getUserPartner = async (userId: string): Promise<string | null> => {
  try {
    // Get user's profile_id
    console.log('getUserPartner called for:', userId);
    const { data: memberData, error: memberError } = await supabase
      .from('profile_members')
      .select('profile_id')
      .eq('auth_user_id', userId)
      .single();
    
    console.log('memberData:', memberData, 'error:', memberError);

    if (memberError || !memberData) {
      return null;
    }

    // Find other member with same profile_id
    const { data: partnerData, error: partnerError } = await supabase
      .from('profile_members')
      .select('auth_user_id')
      .eq('profile_id', memberData.profile_id)
      .neq('auth_user_id', userId)
      .maybeSingle();

    console.log('partnerData:', partnerData, 'error:', partnerError);

    if (partnerError || !partnerData) {
      return null;
    }

    return partnerData.auth_user_id;
  } catch (error) {
    console.error('Error getting partner:', error);
    return null;
  }
};

// Unlink partner
export const unlinkPartner = async (userId: string): Promise<boolean> => {
  try {
    // Get user's current profile_id
    const { data: memberData, error: memberError } = await supabase
      .from('profile_members')
      .select('profile_id')
      .eq('auth_user_id', userId)
      .single();

    if (memberError || !memberData) {
      return false;
    }

    const sharedProfileId = memberData.profile_id;

    // Create a new profile for the user (they're leaving the couple)
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_type: 'couple', // Default to couple after unlinking
        location: '',
        looking_for: '',
        interests: []
      })
      .select()
      .single();

    if (profileError || !newProfile) {
      return false;
    }



    // Set shared profile fields to defaults so other partner sees clean slate (after updating reference)


        const { error: clearError } = await supabase
      .from('profiles')
      .update({
        couple_bio: '',
        interests: [],
        is_complete: false
      })
      .eq('id', sharedProfileId);
    console.log('🔴 clearError:', clearError);

   if (clearError) {
      console.error('Error clearing shared profile:', clearError);
    }
    

        // Update unlinking user's profile_id to the new profile
    const { error: updateError } = await supabase
      .from('profile_members')
      .update({ profile_id: newProfile.id })
      .eq('auth_user_id', userId);

    if (updateError) {
      return false;
    }
    return true;
  } 
    
    
  catch (error) {
    console.error('Error unlinking partner:', error);
    return false;
  }
};