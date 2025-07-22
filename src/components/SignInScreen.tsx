import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Info } from 'lucide-react';

interface SignInScreenProps {
  onSignIn: () => void;
  onSwitchToRegister: () => void;
  onSkipForNow?: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ onSignIn, onSwitchToRegister, onSkipForNow }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo authentication - any credentials work
    onSignIn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between page-container py-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/cornr_logo_orig_bg_removed_name_removed.png" 
            alt="CORNR" 
            className="h-8"
          />
          <span className="text-xl font-bold" style={{ color: '#4A4A5C' }}>CORNR</span>
        </div>
        <div className="flex-1"></div>
        <button 
          className="p-2 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
          title="Help & Support"
          aria-label="Get help and support"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center page-container">
        <div className="w-full max-w-md">
          {/* Sign In Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 section-spacing">
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-semibold text-gray-800 mb-4">Welcome back to CORNR!</h1>
              <p className="text-lg text-gray-600 leading-relaxed">Your safe space for meaningful connections</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10 bg-gray-50 border border-gray-300"
                    placeholder="Enter your email"
                    style={{ '::placeholder': { color: '#555555' } }}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10 pr-12 bg-gray-50 border border-gray-300"
                    placeholder="Enter your password"
                    style={{ '::placeholder': { color: '#555555' } }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Extra spacing before Sign In button */}
              <div className="pt-2">
              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 text-white"
                style={{ 
                  backgroundColor: '#9F8BC7',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8A76B3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9F8BC7'}
              >
                Sign In
              </button>
              </div>

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm font-medium underline hover:no-underline transition-all"
                  style={{ color: '#B19CD9' }}
                >
                  Forgot your password?
                </button>
              </div>
            </form>

            {/* Switch to Register */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center" style={{ paddingTop: '24px', paddingBottom: '16px' }}>
              <p className="mb-4 font-normal text-base text-gray-600">New to CORNR?</p>
              <button
                onClick={onSwitchToRegister}
                className="w-full font-semibold py-3 px-4 rounded-xl transition-colors mb-3"
                style={{ 
                  backgroundColor: '#B19CD9', 
                  color: '#FFFFFF',
                  border: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9F8BC7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B19CD9'}
              >
                Create Account
              </button>
              
              {/* Skip for now option */}
              {onSkipForNow && (
                <button
                  onClick={onSkipForNow}
                  className="text-sm font-medium underline hover:no-underline transition-all"
                  style={{ color: '#B19CD9' }}
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};