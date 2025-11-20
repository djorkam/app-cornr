import React, { useState } from "react";
import { User, Loader2 } from "lucide-react";
import { RegisterFormDataType } from "../../types/registerTypes";
import { authService } from "../../services/authService";
import { supabase } from "../../lib/supabase";
import { calculateAge } from "../../utils/utils";

interface StepInfoProps {
  name: RegisterFormDataType["name"];
  birthdate: RegisterFormDataType["birthdate"];
  gender: RegisterFormDataType["gender"];
  customGender: RegisterFormDataType["customGender"];
  userType: 'unicorn' | 'couple' | null;
  validationError: string;
  onChange: (field: keyof RegisterFormDataType, value: string) => void;
  onNext: () => void;
}

const StepInfo: React.FC<StepInfoProps> = ({
  name,
  gender,
  customGender,
  birthdate,
  userType,
  validationError,
  onChange,
  onNext,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!name.trim() || !birthdate || !gender) {
      setError("Please fill in all required fields");
      return;
    }

    if (gender === "other" && !customGender?.trim()) {
      setError("Please specify your gender");
      return;
    }

    // Age validation
    const age = calculateAge(birthdate);
    if (age < 18) {
      setError("You must be at least 18 to join CORNR");
      return;
    }

    if (!userType) {
      setError("User type not set. Please start over.");
      return;
    }

    setLoading(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("Not authenticated. Please start over.");
      setLoading(false);
      return;
    }

    // Complete profile with user type and personal data
    const result = await authService.completeProfile(user.id, userType, {
      name,
      birthdate,
      gender,
      customGender
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    // Success! Move to next step
    setLoading(false);
    onNext();
  };

  return (
    <>
      <div className="text-center mb-8">
        <p className="text-gray-600 leading-relaxed">
          This will help others connect with your vibe.
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

          {/* Name */}
          <div>
            <label htmlFor="name" className="form-label">
              Your name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => onChange("name", e.target.value)}
                className="form-input form-input-mandatory pl-10"
                placeholder="Your name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="form-label">
              Your gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => onChange("gender", e.target.value)}
              className="form-input form-input-mandatory"
              disabled={loading}
            >
              <option value="" disabled>
                Select your gender
              </option>
              <option value="woman">Woman</option>
              <option value="man">Man</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not">Prefer not to say</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Custom Gender */}
          {gender === "other" && (
            <div>
              <label htmlFor="customGender" className="form-label mt-4">
                Enter your gender
              </label>
              <input
                id="customGender"
                type="text"
                value={customGender}
                onChange={(e) => onChange("customGender", e.target.value)}
                className="form-input form-input-mandatory"
                placeholder="e.g. Genderfluid, Agender"
                disabled={loading}
              />
            </div>
          )}

          {/* Birthdate */}
          <div>
            <label htmlFor="birthdate" className="form-label">
              Your birthdate
            </label>
            <input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => onChange("birthdate", e.target.value)}
              className="form-input form-input-mandatory"
              max={eighteenYearsAgo.toISOString().split("T")[0]}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              This won't be shown publicly — we just use it to calculate your age.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !birthdate || loading}
            className="btn-primary disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default StepInfo;