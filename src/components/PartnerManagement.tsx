import React, { useState, useEffect } from 'react';
import { Users, Unlink, AlertTriangle } from 'lucide-react';
import { getUserPartner, unlinkPartner } from '../utils/partnerUtils';
import { InviteCodeDisplay } from './InviteCodeDisplay';
import { InviteCodeRedemption } from './InviteCodeRedemption';

interface PartnerManagementProps {
  userId: string;
  userType: 'unicorn' | 'couple';
  onPartnerLinked?: () => void;
  onPartnerUnlinked?: () => void;
}

export const PartnerManagement: React.FC<PartnerManagementProps> = ({
  userId,
  userType,
  onPartnerLinked,
  onPartnerUnlinked
}) => {
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    loadPartnerInfo();
  }, [userId]);

  const loadPartnerInfo = async () => {
    try {
      const partner = await getUserPartner(userId);
      setPartnerId(partner);
    } catch (error) {
      console.error('Failed to load partner info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const success = await unlinkPartner(userId);
      console.log('🔴 unlinkPartner success:', success);
      if (success) {
        setPartnerId(null);
        setShowUnlinkConfirm(false);
        console.log('🔴 onPartnerUnlinked callback:', onPartnerUnlinked);
        // Notify parent component to refresh partner data
        if (onPartnerUnlinked) {
          console.log('🔴 Calling onPartnerUnlinked');
          onPartnerUnlinked();
        }   else {
          console.log('🔴 onPartnerUnlinked is undefined!');
          }
      }
    } catch (error) {
      console.error('Failed to unlink partner:', error);
    } finally {
      setIsUnlinking(false);
    }
  };

  const handlePartnerLinked = (partnerInfo: any) => {
    console.log('🟢 PartnerManagement.handlePartnerLinked called with:', partnerInfo);
    setPartnerId(partnerInfo.id);
        // Notify parent component to refresh partner data
    if (onPartnerLinked) {
      console.log('🟢 Calling onPartnerLinked callback');
      onPartnerLinked();
      }
    else {
      console.log('🔴 onPartnerLinked is undefined!');      
    }

  };

  if (userType !== 'couple') {
    return null; // Only show for couples
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {partnerId ? (
        // Partner is linked
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Partner Linked
              </h3>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Connected
            </span>
          </div>
          
          <p className="text-gray-600 mb-4 leading-relaxed">
            Your account is successfully linked with your partner. You can now share profile information and interact as a couple.
          </p>
          
          <button
            onClick={() => setShowUnlinkConfirm(true)}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
          >
            <Unlink className="w-4 h-4" />
            <span>Unlink Partner</span>
          </button>
          
          {showUnlinkConfirm && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 mb-2">
                    Unlink Partner Account?
                  </p>
                  <p className="text-sm text-red-700 mb-4">
                    This will disconnect your accounts. You'll need a new invite code to link again.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUnlink}
                      disabled={isUnlinking}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isUnlinking ? 'Unlinking...' : 'Yes, Unlink'}
                    </button>
                    <button
                      onClick={() => setShowUnlinkConfirm(false)}
                      className="px-4 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // No partner linked - show options
        <div className="space-y-6">
          <InviteCodeDisplay 
            userId={userId}
            onCodeGenerated={(code) => console.log('Generated code:', code)}
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">OR</span>
            </div>
          </div>
          
          <InviteCodeRedemption 
            userId={userId}
            onPartnerLinked={handlePartnerLinked}
          />
        </div>
      )}
    </div>
  );
};