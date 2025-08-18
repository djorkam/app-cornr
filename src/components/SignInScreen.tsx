import React, { useState } from "react";
import { Mail, Info } from "lucide-react";
import PasswordInput from "./PasswordInput";

interface SignInScreenProps {
  onSignIn: () => void;
  onSwitchToRegister: () => void;
  onSkipForNow?: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSignIn,
  onSwitchToRegister,
  onSkipForNow,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 to-purple-50 flex flex-col">
      <header className="flex items-center justify-between page-container py-4">
        <div className="flex items-center space-x-3">
          <img
            src="/cornr_logo_orig_bg_removed_name_removed.png"
            alt="CORNR"
            className="h-8"
          />
          <span className="text-xl font-bold text-gray-700">CORNR</span>
        </div>
        <div className="flex-1" />
        <button
          className="p-2 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
          title="Help & Support"
          aria-label="Get help and support"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center page-container">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-semibold text-gray-800 mb-4">
                Welcome back to CORNR!
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Your safe space for meaningful connections
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
                  />
                </div>
              </div>

              <PasswordInput value={password} onChange={setPassword} required />

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full font-semibold py-3 px-4 rounded-xl text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 bg-[#9F8BC7] hover:bg-[#8A76B3]"
                >
                  Sign In
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm font-medium underline hover:no-underline text-purple-400"
                >
                  Forgot your password?
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="mb-4 font-normal text-base text-gray-600">
                New to CORNR?
              </p>
              <button
                onClick={onSwitchToRegister}
                className="w-full font-semibold py-3 px-4 rounded-xl transition-colors mb-3 bg-[#B19CD9] text-white hover:bg-[#9F8BC7]"
              >
                Create Account
              </button>

              {onSkipForNow && (
                <button
                  onClick={onSkipForNow}
                  className="text-sm font-medium underline hover:no-underline text-purple-400"
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
