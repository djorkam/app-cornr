import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { UserProfile, calculateAge, formatGender } from "../../utils/utils";

interface StepPreviewProps {
  userType: "unicorn" | "couple";
  userProfile: any;
  onConfirm: () => void;
  onEdit: () => void;
  loading?: boolean;
}

const StepPreview: React.FC<StepPreviewProps> = ({
  userType,
  userProfile,
  onConfirm,
  onEdit,
  loading = false,
}) => {
  return (
    <>
      {/* Validation Checkpoint */}
      <div className="text-center mb-8">
        <p className="text-gray-600 leading-relaxed">
          Here's how your profile looks. Everything correct?
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        {/* Profile Preview */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-4 border-purple-200 bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 text-3xl">
              {userType === "unicorn" ? "🦄" : "👫"}
            </span>
          </div>

          <h3 className="text-xl mb-1">
            <span className="text-2xl font-semibold text-gray-800">
              {userProfile.name || 'Name'}
            </span>
            <span className="text-2xl font-normal text-gray-600">
              , {userProfile.birthdate ? calculateAge(userProfile.birthdate) : 'Age'}
            </span>
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {userProfile.gender ? formatGender(userProfile.gender, userProfile.customGender) : 'Gender'}
          </p>

          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            userType === "unicorn"
              ? "bg-purple-100 text-purple-700"
              : "bg-pink-100 text-pink-700"
          }`}>
            {userType === "unicorn" ? "🦄 Unicorn" : "👫 Couple"}
          </span>

          {userProfile.bio && (
            <p className="text-base text-gray-700 mt-4 px-2 leading-relaxed">
              "{userProfile.bio}"
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="btn-primary disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating profile...
            </>
          ) : (
            <>
              Yes, looks good
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>

        <button
          onClick={onEdit}
          disabled={loading}
          className="btn-secondary disabled:opacity-50"
        >
          Let me edit
        </button>
      </div>
    </>
  );
};

export default StepPreview;