import React, { useState, useEffect } from "react";
import { ArrowLeft, Info, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { calculateAge, formatGender } from "../utils/utils";
import { RegisterFormDataType } from "../types/registerTypes";
import StepInfo from "./registerSteps/StepInfo";
import StepPhoto from "./registerSteps/StepPhoto";
import StepBio from "./registerSteps/StepBio";
import StepType from "./registerSteps/StepType";
import StepCredentials from "./registerSteps/StepCredentials";
import StepVerification from "./registerSteps/StepVerification";
import StepPreview from "./registerSteps/StepPreview";
// import { InviteCodeDisplay } from "./InviteCodeDisplay";
// import { InviteCodeRedemption } from "./InviteCodeRedemption";
import { EnterCodeScreen } from "./EnterCodeScreen";
import { photoService } from "../services/photoService";
import { extractInviteCodeFromUrl, storePendingInviteCode } from "../utils/partnerUtils";

interface RegisterScreenProps {
  onRegister: (
    userType: "unicorn" | "couple",
    formData: RegisterFormDataType
  ) => void;
  onSwitchToSignIn: () => void;
}

const steps = [
  "type",
  "credentials",
  "verification",
  "info",
  "photo",
  "bio",
  "preview",
] as const;

type StepType = (typeof steps)[number];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onSwitchToSignIn,
}) => {
  const { user } = useAuth();
  const [showEnterCodeScreen, setShowEnterCodeScreen] = useState(false);
  const [deepLinkCode, setDeepLinkCode] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const [userType, setUserType] = useState<"unicorn" | "couple" | null>(null);
  const [formData, setFormData] = useState<RegisterFormDataType>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    partnerName: "",
    birthdate: "",
    gender: "prefer-not",
    customGender: "",
    bio: "",
    photo: null as File | null,
    
  });

  const [validationError, setValidationError] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  // Check for deep link invite code on component mount
  useEffect(() => {
    const codeFromUrl = extractInviteCodeFromUrl();
    if (codeFromUrl) {
      setDeepLinkCode(codeFromUrl);
      storePendingInviteCode(codeFromUrl);
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const goToStep = (targetStep: StepType) => {
    const index = steps.indexOf(targetStep);
    if (index !== -1) setStepIndex(index);
  };
  const totalSteps = steps.length;
  const currentStepNumber = stepIndex + 1;

  const handleTypeSelect = (type: "unicorn" | "couple") => {
    setUserType(type);
    goToStep("credentials");
  };

  const handleNext = () => {
    setValidationError("");

    /* COMMENTED: The validation is now handled in StepCredentials itself.
    if (step === "credentials") {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setValidationError("Please fill in all fields to continue.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setValidationError("Passwords do not match.");
        return;
      }
    }
    */

    if (step === "verification") {
      // Simulate email verification
      setIsEmailVerified(true);
    }

    /* COMMENTED: Also remove the info step validation (lines ~125-140) since StepInfo handles it now.
    if (step === "info") {
      if (
        !formData.name.trim() ||
        !formData.birthdate ||
        !formData.gender ||
        (formData.gender === "other" && !formData.customGender.trim())
      ) {
        setValidationError(
          "Please fill in your name, birthdate and gender to continue."
        );
        return;
      }

      //Age Validation
      const age = calculateAge(formData.birthdate);
      if (age < 18) {
        setValidationError("You must be at least 18 to join CORNR.");
        return;
      }
    }
    */

    if (step === "preview") {
      if (userType) {
        onRegister(userType, formData);
        return;
      }
    }

    nextStep();
  };

  const handleSkipBio = () => {
    if (step === "bio") {
      goToStep("preview");
    }
  };

  const handleBack = () => {
    prevStep();
  };

  const handleInputChange = (
    field: keyof RegisterFormDataType,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
    }
  };

  const onSendVerification = () => {
    alert(`Sending initial verification email to ${formData.email}`);
  };

  const onResendVerification = () => {
    // Your resend email logic here, or a placeholder alert
    alert(`Resending verification email to ${formData.email}`);
  };

  const handleEnterCodeClick = () => {
    setShowEnterCodeScreen(true);
  };

  const handleBackFromEnterCode = () => {
    setShowEnterCodeScreen(false);
  };

  const handlePartnerLinkedFromEnterCode = (partnerInfo: any) => {
    console.log('Partner linked during registration:', partnerInfo);
    setShowEnterCodeScreen(false);
    // Continue with registration completion
    if (userType) {
      onRegister(userType, formData);
    }
  };

  const handleGenerateCodeFromEnterCode = () => {
    setShowEnterCodeScreen(false);
    // Stay on the preview step which shows the generate code option
  };

  // Show Enter Code Screen if requested
  if (showEnterCodeScreen) {
    return (
      <EnterCodeScreen
        userId="demo-user-id"
        onBack={handleBackFromEnterCode}
        onPartnerLinked={handlePartnerLinkedFromEnterCode}
        onGenerateCode={handleGenerateCodeFromEnterCode}
        prefilledCode={deepLinkCode || undefined}
      />
    );
  }

  const userProfile = {
    name: formData.name,
    birthdate: formData.birthdate,
    gender: formData.gender,
    customGender: formData.customGender,
    bio: formData.bio,
    photo: formData.photo,
    interests: [],
    location: '',
    lookingFor: ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {step !== "type" && (
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <img
            src="/cornr_logo_orig_bg_removed_name_removed.png"
            alt="CORNR"
            className="h-8"
          />
        </div>

        <div className="text-center flex-1">
          {step !== "type" && (
            <motion.p
              key={currentStepNumber}
              className="text-xs text-gray-500 mb-1"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Step {currentStepNumber} of {totalSteps}
            </motion.p>
          )}
          <h1 className="text-lg font-semibold text-gray-800">
            {step === "type" && "Who's joining CORNR?"}
            {step === "credentials" && "Create your account"}
            {step === "verification" && "Verify your email"}
            {step === "info" && "Let's get to know you"}
            {step === "photo" && "Add a photo"}
            {step === "bio" && "Tell us about yourself"}
            {step === "preview" && "Here's how your profile looks"}
          </h1>
        </div>

        <button
          className="p-2 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
          title="Help & Support"
          aria-label="Get help and support"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {step === "type" ? (
            <>
              <StepType
                onSelect={handleTypeSelect}
                onSwitchToSignIn={onSwitchToSignIn}
              />
            </>
          ) : step === "credentials" ? (
            <>
              <StepCredentials
                email={formData.email}
                password={formData.password}
                confirmPassword={formData.confirmPassword}
                onChange={handleInputChange}
                onSuccess={nextStep} 
                //handleNext={handleNext}
                validationError={validationError}
              />{" "}
            </>
          ) : step === "verification" ? (
            <>
              {/* Email Verification Step */}
              <StepVerification
                email={formData.email}
                onNext={handleNext}
                onResendVerification={onResendVerification}
              />
            </>
          ) : step === "info" ? (
            <>
              {/* User Info Step */}
              <StepInfo
                name={formData.name}
                gender={formData.gender}
                customGender={formData.customGender}
                birthdate={formData.birthdate}
                userType={userType}
                validationError={validationError}
                onChange={handleInputChange}
                onNext={handleNext}
              />
            </>
          ) : step === "photo" ? (
            <>
              {/* Photo Upload Step */}
              <StepPhoto
                photo={formData.photo}
                handlePhotoUpload={handlePhotoUpload}
                handleNext={handleNext}
                userId={user?.id || "demo-user-id"}
              />
            </>
          ) : step === "bio" ? (
            <>
              {/* Bio Step */}
              <StepBio
                bio={formData.bio}
                onChange={(value) => handleInputChange("bio", value)}
                onContinue={handleNext}
                onSkip={handleSkipBio}
              />
            </>
          ) : (
            <>
              {/* Profile Preview */}
      <StepPreview
      userType={userType || 'unicorn'}
      userProfile={userProfile}
      onConfirm={handleNext}
      onEdit={() => goToStep("info")}
      loading={false}
    />

                                 
                {/* Show invite code for couples */}
                {/* {userType === "couple" && (
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800 mb-3">
                      🎉 Almost there! Connect with your partner:
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Generate code to share */}
                      {/* <div>
                        <InviteCodeDisplay
                          userId={user?.id || ""}
                          onCodeGenerated={(code) => console.log('Generated code for new couple:', code)}
                        />
                      </div>
                      
                      {/* Secondary option to enter code */}
                      {/* <div className="text-center pt-2">
                        <button
                          onClick={handleEnterCodeClick}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm underline"
                        >
                          Already have a code? Enter it here
                        </button>
                      </div>
                    </div>
                  </div>
                )} */}
             
              
            </>
          )}
        </div>
      </div>
    </div>
  );
};