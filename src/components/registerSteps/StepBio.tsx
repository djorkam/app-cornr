import React from "react";
import { RegisterFormDataType } from "../../types/registerTypes";

interface StepBioProps {
  bio: RegisterFormDataType["bio"];
  onChange: (value: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const StepBio: React.FC<StepBioProps> = ({
  bio,
  onChange,
  onContinue,
  onSkip,
}) => {
  return (
    <>
      {/* Bio Step */}
      <div className="text-center mb-8">
        <p className="text-gray-600 leading-relaxed">
          Tell others what makes you unique.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-6">
          {/* Bio Field */}
          <div>
            <label htmlFor="bio" className="form-label">
              About you
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              className="form-input form-input-optional resize-none"
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          {/* Continue Button */}
          <button onClick={onContinue} className="btn-primary">
            Continue
          </button>

          {/* Skip Option */}
          <button onClick={onSkip} className="btn-skip">
            Skip for now
          </button>
        </div>
      </div>
    </>
  );
};

export default StepBio;
