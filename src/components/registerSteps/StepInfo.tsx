import React from "react";
import { User } from "lucide-react";
import { RegisterFormDataType } from "../../types/registerTypes";
interface StepInfoProps {
  name: RegisterFormDataType["name"];
  birthdate: RegisterFormDataType["birthdate"];
  gender: RegisterFormDataType["gender"];
  customGender: RegisterFormDataType["customGender"];

  validationError: string;
  onChange: (field: keyof RegisterFormDataType, value: string) => void;
  onNext: () => void;
}

const StepInfo: React.FC<StepInfoProps> = ({
  name,
  gender,
  customGender,
  birthdate,
  validationError,
  onChange,
  onNext,
}) => {
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  return (
    <>
      <div className="text-center mb-8">
        <p className="text-gray-600 leading-relaxed">
          This will help others connect with your vibe.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-6">
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
            />
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              This won't be shown publicly — we just use it to calculate your
              age.
            </p>
          </div>

          {validationError && (
            <div className="text-red-500 text-sm">{validationError}</div>
          )}

          <button
            onClick={onNext}
            disabled={!name.trim() || !birthdate}
            className="btn-primary"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default StepInfo;
