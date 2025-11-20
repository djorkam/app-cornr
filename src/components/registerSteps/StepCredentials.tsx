// src/components/registerSteps/StepCredentials.tsx

import React from "react";
import { Mail } from "lucide-react";
import PasswordInput from "../PasswordInput";
import { RegisterFormDataType } from "../../types/registerTypes";

interface StepCredentialsProps {
  email: RegisterFormDataType["email"];
  password: RegisterFormDataType["password"];
  confirmPassword: RegisterFormDataType["confirmPassword"];
  onChange: (field: keyof RegisterFormDataType, value: string) => void;
  handleNext: () => void;
  validationError: string | null;
}

const StepCredentials: React.FC<StepCredentialsProps> = ({
  email,
  password,
  confirmPassword,
  onChange,
  handleNext,
  validationError,
}) => {
  const handleInput =
    (field: keyof RegisterFormDataType) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(field, e.target.value);
  return (
    <>
      {/* Account Creation Step */}
      <div className="text-center mb-8">
        <p className="text-gray-600 leading-relaxed">
          Create your CORNR account to get started.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-6">
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
                onChange={handleInput("email")}
                className="form-input form-input--mandatory pl-10"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <PasswordInput
            id="password"
            value={password}
            onChange={(value) => onChange("password", value)}
            placeholder="Create a password"
            label="Password"
            required
            className="mb-4"
          />

          {/* Confirm Password Field */}
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(value) => onChange("confirmPassword", value)}
            placeholder="Confirm your password"
            label="Confirm Password"
            required
            className="mb-4"
          />

          {/* Validation Error */}
          {validationError && (
            <div className="text-red-500 text-sm">{validationError}</div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleNext}
            disabled={!email || !password || !confirmPassword}
            className="btn-primary"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default StepCredentials;
