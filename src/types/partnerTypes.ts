// Partner linking types
export interface InviteCode {
  code: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  usedBy?: string;
}

export interface PartnerLinkRequest {
  inviteCode: string;
  requestingUserId: string;
}

export interface PartnerLinkResponse {
  success: boolean;
  message: string;
  partnerInfo?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserWithPartner {
  id: string;
  name: string;
  email: string;
  partnerId?: string;
  partnerName?: string;
  inviteCode?: string;
  isLinked: boolean;
}