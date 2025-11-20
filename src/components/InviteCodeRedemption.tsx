import React, { useState } from 'react';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import { redeemInviteCode, isValidInviteCodeFormat } from '../utils/partnerUtils';
import { PartnerLinkResponse } from '../types/partnerTypes';

interface InviteCodeRedemptionProps {
  userId: string;
  onPartnerLinked?: (partnerInfo: any) => void;
}

export const InviteCodeRedemption: React.FC<InviteCodeRedemptionProps> = ({
  userId,
  onPartnerLinked
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [result, setResult] = useState<PartnerLinkResponse | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setInviteCode(value);
      setResult(null); // Clear previous results when typing
    }
  };

  const handleRedeem = async () => {
    if (!isValidInviteCodeFormat(inviteCode)) {
      setResult({
        success: false,
        message: 'Please enter a valid 6-character invite code.'
      });
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await redeemInviteCode(inviteCode, userId);
      console.log('🔴 Redemption response:', response);
      setResult(response);
      
      if (response.success && response.partnerInfo) {
        onPartnerLinked?.(response.partnerInfo);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while linking accounts. Please try again.'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inviteCode.length === 6) {
      handleRedeem();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-full">
          <Users className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          Link with Partner
        </h3>
      </div>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        Enter your partner's invite code to link your accounts together.
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="inviteCode" className="form-label">
            Partner's Invite Code
          </label>
          <input
            id="inviteCode"
            type="text"
            value={inviteCode}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="form-input font-mono text-center text-lg tracking-wider uppercase"
            placeholder="ABC123"
            maxLength={6}
          />
          <p className="text-sm text-gray-500 mt-2">
            Enter the 6-character code your partner shared with you
          </p>
        </div>
        
        {result && (
          <div className={`p-4 rounded-lg flex items-start space-x-3 ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Success!' : 'Error'}
              </p>
              <p className={`text-sm ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
              {result.success && result.partnerInfo && (
                <p className="text-sm text-green-700 mt-1">
                  You are now linked with {result.partnerInfo.name}
                </p>
              )}
            </div>
          </div>
        )}
        
        <button
          onClick={handleRedeem}
          disabled={inviteCode.length !== 6 || isRedeeming}
          className="btn-primary disabled:opacity-50"
        >
          {isRedeeming ? 'Linking Accounts...' : 'Link Accounts'}
        </button>
      </div>
    </div>
  );
};