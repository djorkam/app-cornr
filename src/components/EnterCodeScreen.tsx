import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { redeemInviteCode, isValidInviteCodeFormat, getPendingInviteCode, clearPendingInviteCode } from '../utils/partnerUtils';
import { PartnerLinkResponse } from '../types/partnerTypes';

interface EnterCodeScreenProps {
  userId: string;
  onBack: () => void;
  onPartnerLinked: (partnerInfo: any) => void;
  onGenerateCode: () => void;
  prefilledCode?: string;
}

export const EnterCodeScreen: React.FC<EnterCodeScreenProps> = ({
  userId,
  onBack,
  onPartnerLinked,
  onGenerateCode,
  prefilledCode
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PartnerLinkResponse | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    // Check for pending invite code from deep link
    const pendingCode = getPendingInviteCode();
    if (pendingCode && !autoSubmitted) {
      setInviteCode(pendingCode);
      // Auto-submit for magic link flow
      handleSubmit(pendingCode);
      setAutoSubmitted(true);
      clearPendingInviteCode();
    } else if (prefilledCode && !autoSubmitted) {
      setInviteCode(prefilledCode);
      // Auto-submit for magic link flow
      handleSubmit(prefilledCode);
      setAutoSubmitted(true);
    }
  }, [prefilledCode, autoSubmitted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setInviteCode(value);
      setResult(null);
    }
  };

  const handleSubmit = async (codeToSubmit?: string) => {
    const code = codeToSubmit || inviteCode;
    
    if (!isValidInviteCodeFormat(code)) {
      setResult({
        success: false,
        message: 'Please enter a valid 6-character invite code.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await redeemInviteCode(code, userId);
      setResult(response);
      
      if (response.success && response.partnerInfo) {
        // Wait a moment to show success message, then notify parent
        setTimeout(() => {
          onPartnerLinked(response.partnerInfo);
        }, 1500);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while linking accounts. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inviteCode.length === 6 && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center flex-1">
          <h1 className="text-lg font-semibold text-gray-800">
            Enter Partner Code
          </h1>
        </div>
        
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Link with Your Partner
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Enter the 6-character code your partner shared with you to connect your accounts.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-6">
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
                  className="form-input font-mono text-center text-2xl tracking-wider uppercase"
                  placeholder="ABC123"
                  maxLength={6}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Enter the 6-character code
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
                onClick={() => handleSubmit()}
                disabled={inviteCode.length !== 6 || isSubmitting}
                className="btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Linking Accounts...</span>
                  </>
                ) : (
                  <span>Link Accounts</span>
                )}
              </button>

              {/* Option to go back to generate code */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">
                  Don't have a code yet?
                </p>
                <button
                  onClick={onGenerateCode}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Generate a code to share with your partner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};