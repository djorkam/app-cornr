// Partner linking utilities
import { InviteCode, PartnerLinkResponse } from '../types/partnerTypes';

// Deep link handling
export const extractInviteCodeFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
};

export const createInviteLink = (code: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/invite?code=${code}`;
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

// Calculate expiration date (48 hours from now as per requirements)
export const getInviteCodeExpiration = (): Date => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 48);
  return expiration;
};

// Check if invite code is expired
export const isInviteCodeExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

// Mock API functions (replace with actual API calls)
export const generateUserInviteCode = async (userId: string): Promise<string> => {
  // Simulate API call
  const code = generateInviteCode();
  
  // Store in localStorage for demo (replace with actual API)
  const inviteData: InviteCode = {
    code,
    userId,
    createdAt: new Date(),
    expiresAt: getInviteCodeExpiration(),
    isUsed: false
  };
  
  localStorage.setItem(`invite_${code}`, JSON.stringify(inviteData));
  localStorage.setItem(`user_invite_${userId}`, code);
  
  return code;
};

export const redeemInviteCode = async (code: string, requestingUserId: string): Promise<PartnerLinkResponse> => {
  // Simulate API call
  const inviteDataStr = localStorage.getItem(`invite_${code}`);
  
  if (!inviteDataStr) {
    return {
      success: false,
      message: 'Invalid invite code. Please check and try again.'
    };
  }
  
  const inviteData: InviteCode = JSON.parse(inviteDataStr);
  
  if (inviteData.isUsed) {
    return {
      success: false,
      message: 'This invite code has already been used.'
    };
  }
  
  if (isInviteCodeExpired(inviteData.expiresAt)) {
    return {
      success: false,
      message: 'This invite code has expired (codes expire after 48 hours). Please ask your partner for a new one.'
    };
  }
  
  if (inviteData.userId === requestingUserId) {
    return {
      success: false,
      message: 'You cannot use your own invite code.'
    };
  }
  
  // Check if requesting user is already linked
  const existingPartner = localStorage.getItem(`user_partner_${requestingUserId}`);
  if (existingPartner) {
    return {
      success: false,
      message: 'You are already linked to a partner. Please unlink first if you want to change partners.'
    };
  }
  
  // Mark invite as used
  inviteData.isUsed = true;
  inviteData.usedBy = requestingUserId;
  localStorage.setItem(`invite_${code}`, JSON.stringify(inviteData));
  
  // Create bidirectional link
  localStorage.setItem(`user_partner_${requestingUserId}`, inviteData.userId);
  localStorage.setItem(`user_partner_${inviteData.userId}`, requestingUserId);
  
  // Get partner info (mock data)
  return {
    success: true,
    message: 'Successfully linked with your partner!',
    partnerInfo: {
      id: inviteData.userId,
      name: 'Partner Name', // Replace with actual user data
      email: 'partner@example.com' // Replace with actual user data
    }
  };
};

export const getUserPartner = async (userId: string): Promise<string | null> => {
  return localStorage.getItem(`user_partner_${userId}`);
};

export const unlinkPartner = async (userId: string): Promise<boolean> => {
  const partnerId = localStorage.getItem(`user_partner_${userId}`);
  
  if (partnerId) {
    // Remove bidirectional link
    localStorage.removeItem(`user_partner_${userId}`);
    localStorage.removeItem(`user_partner_${partnerId}`);
    return true;
  }
  
  return false;
};