import React, { useEffect } from 'react';
import { 
  X, 
  Settings, 
  MapPin, 
  Bell, 
  Shield, 
  User, 
  HelpCircle, 
  MessageSquare, 
  Info, 
  FileText, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDiscoveryPreferences?: () => void;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ isOpen, onClose, onNavigateToDiscoveryPreferences }) => {
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const MenuItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    onClick?: () => void;
    isDestructive?: boolean;
  }> = ({ icon, title, onClick, isDestructive = false }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors text-left ${
        isDestructive 
          ? 'hover:bg-red-50 text-red-600' 
          : 'hover:bg-purple-50 text-gray-700'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          isDestructive ? 'bg-red-100' : 'bg-purple-100'
        }`}>
          {icon}
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );

  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
      {title}
    </h3>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Menu Panel */}
      <div className="relative ml-auto w-80 max-w-[85vw] h-full bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <img 
                src="/cornr_logo_orig_bg_removed_name_removed.png" 
                alt="CORNR" 
                className="h-6"
              />
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Settings Section */}
            <div>
              <SectionHeader title="Settings" />
              <div className="space-y-2">
                <MenuItem
                  icon={<MapPin className="w-4 h-4 text-purple-600" />}
                  title="Discovery Preferences"
                  onClick={() => {
                    onNavigateToDiscoveryPreferences?.();
                    onClose();
                  }}
                />
                <MenuItem
                  icon={<Bell className="w-4 h-4 text-purple-600" />}
                  title="Notifications"
                  onClick={() => {
                    console.log('Navigate to Notifications');
                    onClose();
                  }}
                />
                <MenuItem
                  icon={<Shield className="w-4 h-4 text-purple-600" />}
                  title="Privacy & Safety"
                  onClick={() => {
                    console.log('Navigate to Privacy & Safety');
                    onClose();
                  }}
                />
                <MenuItem
                  icon={<User className="w-4 h-4 text-purple-600" />}
                  title="Account"
                  onClick={() => {
                    console.log('Navigate to Account');
                    onClose();
                  }}
                />
              </div>
            </div>

            {/* Support & Info Section */}
            <div>
              <SectionHeader title="Support & Info" />
              <div className="space-y-2">
                <MenuItem
                  icon={<HelpCircle className="w-4 h-4 text-purple-600" />}
                  title="Help & Support"
                  onClick={() => {
                    console.log('Navigate to Help & Support');
                    onClose();
                  }}
                />
                <MenuItem
                  icon={<Shield className="w-4 h-4 text-purple-600" />}
                  title="Safety & Guidelines"
                  onClick={() => {
                    console.log('Navigate to Safety & Guidelines');
                    onClose();
                  }}
                />
                <MenuItem
                  icon={<MessageSquare className="w-4 h-4 text-purple-600" />}
                  title="Feedback"
                  onClick={() => {
                    console.log('Navigate to Feedback');
                    onClose();
                  }}
                />
                <MenuItem
                  icon={<Info className="w-4 h-4 text-purple-600" />}
                  title="About CORNR"
                  onClick={() => {
                    console.log('Navigate to About CORNR');
                    onClose();
                  }}
                />
                <MenuItem
                  icon={<FileText className="w-4 h-4 text-purple-600" />}
                  title="Legal"
                  onClick={() => {
                    console.log('Navigate to Legal');
                    onClose();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Log Out Button */}
          <div className="p-6 border-t border-gray-100">
            <MenuItem
              icon={<LogOut className="w-4 h-4 text-red-600" />}
              title="Log Out"
              onClick={() => {
                console.log('Log out user');
                onClose();
              }}
              isDestructive
            />
          </div>
        </div>
      </div>
    </div>
  );
};