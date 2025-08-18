import React from "react";
import { Mail } from "lucide-react";
import { RegisterFormDataType } from "../../types/registerTypes";

interface StepVerificationProps {
  email: RegisterFormDataType["email"];
  onNext: () => void;
  onResendVerification: () => void;
}

const StepVerification: React.FC<StepVerificationProps> = ({
  email,
  onNext,
  onResendVerification,
}) => {
  return (
    <>
      <div className="text-center mb-8">
        <p className="text-gray-600 leading-relaxed">
          We've sent a verification link to {email}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Check your email
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Click the verification link in your email to continue setting up
              your profile.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Didn’t receive it? Check your spam folder or resend the email.
            </p>
          </div>

          <button onClick={onNext} className="btn-primary">
            I've verified my email
          </button>

          <button onClick={onResendVerification} className="btn-secondary">
            Resend verification email
          </button>
        </div>
      </div>
    </>
  );
};

export default StepVerification;
