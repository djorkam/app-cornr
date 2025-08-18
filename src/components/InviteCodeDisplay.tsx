import React, { useState, useEffect } from 'react';
import { Copy, Share2, RefreshCw, Check } from 'lucide-react';
import { generateUserInviteCode, createInviteLink } from '../utils/partnerUtils';

interface InviteCodeDisplayProps {
  userId: string;
  onCodeGenerated?: (code: string) => void;
}

export const InviteCodeDisplay: React.FC<InviteCodeDisplayProps> = ({
  userId,
  onCodeGenerated
}) => {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExistingCode();
  }, [userId]);

  const loadExistingCode = () => {
    const existingCode = localStorage.getItem(`user_invite_${userId}`);
    if (existingCode) {
      setInviteCode(existingCode);
    }
    setIsLoading(false);
  };

  const generateNewCode = async () => {
    setIsGenerating(true);
    try {
      const newCode = await generateUserInviteCode(userId);
      setInviteCode(newCode);
      onCodeGenerated?.(newCode);
    } catch (error) {
      console.error('Failed to generate invite code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareCode = () => {
    const inviteLink = createInviteLink(inviteCode);
    const shareText = `Join me on CORNR! Use this link to connect our accounts: ${inviteLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'CORNR Invite Code',
        text: shareText,
        url: inviteLink,
      }).catch(() => {
        // User cancelled share or permission denied - fallback to clipboard
        copyToClipboard();
      });
    } else {
      // Fallback: copy to clipboard
      copyToClipboard();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Partner Invite Code
      </h3>
      
      {inviteCode ? (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="font-mono text-2xl font-bold text-purple-700 tracking-wider">
                {inviteCode}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            Share this code with your partner so they can link their account to yours. 
            The code expires in 48 hours.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={shareCode}
              className="flex-1 flex items-center justify-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Code</span>
            </button>
            
            <button
              onClick={generateNewCode}
              disabled={isGenerating}
              className="flex items-center justify-center space-x-2 border border-purple-200 hover:bg-purple-50 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>New Code</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Generate an invite code to link with your partner
          </p>
          <button
            onClick={generateNewCode}
            disabled={isGenerating}
            className="btn-primary disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Invite Code'}
          </button>
        </div>
      )}
    </div>
  );
};