import React, { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import PasswordInput from "../PasswordInput";
import { RegisterFormDataType } from "../../types/registerTypes";
import { authService } from "../../services/authService";

interface StepCredentialsProps {
  email: RegisterFormDataType["email"];
  password: RegisterFormDataType["password"];
  confirmPassword: RegisterFormDataType["confirmPassword"];
  onChange: (field: keyof RegisterFormDataType, value: string) => void;
  onSuccess: () => void;
  validationError: string | null;
}

const StepCredentials: React.FC<StepCredentialsProps> = ({
  email,
  password,
  confirmPassword,
  onChange,
  onSuccess,
  validationError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    // Create account with email/password only
    const result = await authService.signUpWithEmail(email, password);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    // Success! Move to verification step
    setLoading(false);
    onSuccess();
  };

  return (
    <>
      <div className="text-center mb-8">
        <p className="text-gray-600 leading-relaxed">
          Create your CORNR account to get started.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-6">
          {/* Error Display */}
          {(error || validationError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error || validationError}</p>
            </div>
          )}

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
                onChange={(e) => onChange("email", e.target.value)}
                className="form-input form-input--mandatory pl-10"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <PasswordInput
            id="password"
            value={password}
            onChange={(value) => onChange("password", value)}
            placeholder="Create a password (min 8 characters)"
            label="Password"
            required
            className={loading ? "opacity-50" : ""}
          />

          {/* Confirm Password Field */}
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(value) => onChange("confirmPassword", value)}
            placeholder="Confirm your password"
            label="Confirm Password"
            required
            className={loading ? "opacity-50" : ""}
          />

          {/* Create Account Button */}
          <button
            onClick={handleSubmit}
            disabled={!email || !password || !confirmPassword || loading}
            className="btn-primary disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
};

export default StepCredentials;