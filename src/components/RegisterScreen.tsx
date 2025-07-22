import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Heart, Users, Info, Upload, Camera } from 'lucide-react';

interface RegisterScreenProps {
  onRegister: (userType: 'unicorn' | 'couple') => void;
  onSwitchToSignIn: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onSwitchToSignIn }) => {
  const [step, setStep] = useState<'type' | 'credentials' | 'verification' | 'info' | 'photo' | 'bio' | 'preview'>('type');
  const [userType, setUserType] = useState<'unicorn' | 'couple' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    partnerName: '',
    birthdate: '',
    bio: '',
    photo: null as File | null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const totalSteps = 7;
  const currentStepNumber = {
    'type': 1,
    'credentials': 2,
    'verification': 3,
    'info': 4,
    'photo': 5,
    'bio': 6,
    'preview': 7
  }[step];

  const handleTypeSelect = (type: 'unicorn' | 'couple') => {
    setUserType(type);
    setStep('credentials');
  };

  const handleNext = () => {
    setValidationError('');
    
    if (step === 'credentials') {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setValidationError('Please fill in all fields to continue.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }
      setStep('verification');
    } else if (step === 'verification') {
      // Simulate email verification
      setIsEmailVerified(true);
      setStep('info');
    } else if (step === 'info') {
      if (!formData.name.trim() || !formData.birthdate) {
        setValidationError('Please fill in your name and birthdate to continue.');
        return;
      }
      
      // Validate age (must be 18+)
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        setValidationError('You must be at least 18 to join CORNR.');
        return;
      }
      
      setStep('photo');
    } else if (step === 'photo') {
      setStep('bio');
    } else if (step === 'bio') {
      setStep('preview');
    } else if (step === 'preview') {
      // Complete registration
      if (userType) {
        onRegister(userType, formData);
      }
    }
  };

  const handleSkipBio = () => {
    if (step === 'bio') {
      setStep('preview');
    }
  };

  const handleNext_old = () => {
    setValidationError('');
    
    if (step === 'info') {
      if (!formData.name.trim()) {
        setValidationError('Please fill in your name to continue.');
        return;
      }
      setStep('birthdate');
    } else if (step === 'birthdate') {
      if (!formData.birthdate) {
        setValidationError('Please enter your birthdate to continue.');
        return;
      }
      
      // Validate age (must be 18+)
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        setValidationError('You must be at least 18 to join CORNR.');
        return;
      }
      
      setStep('photo');
    } else if (step === 'photo') {
      setStep('preview');
    } else if (step === 'preview') {
      setStep('bio');
    }
  };

  const handleBack = () => {
    if (step === 'credentials') setStep('type');
    else if (step === 'verification') setStep('credentials');
    else if (step === 'info') setStep('verification');
    else if (step === 'photo') setStep('info');
    else if (step === 'bio') setStep('photo');
    else if (step === 'preview') setStep('bio');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType && formData.password === formData.confirmPassword) {
      onRegister(userType);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {step !== 'type' && (
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
          {step !== 'type' && (
            <p className="text-xs text-gray-500 mb-1">Step {currentStepNumber} of {totalSteps}</p>
          )}
          <h1 className="text-lg font-semibold text-gray-800">
            {step === 'type' && 'Who\'s joining CORNR?'}
            {step === 'credentials' && 'Create your account'}
            {step === 'verification' && 'Verify your email'}
            {step === 'info' && 'Let\'s get to know you'}
            {step === 'photo' && 'Add a photo'}
            {step === 'bio' && 'Tell us about yourself'}
            {step === 'preview' && 'Here\'s how your profile looks'}
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
          {step === 'type' ? (
            <>
              {/* CORNR Title */}
              <div className="text-center mb-12">
                <h1 className="text-6xl font-semibold text-gray-800 mb-4">CORNR</h1>
                <p className="text-gray-600 text-lg leading-relaxed">Who's joining CORNR?</p>
              </div>

              {/* User Type Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="space-y-4">
                  <button
                    onClick={() => handleTypeSelect('unicorn')}
                    className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-25 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Heart className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">I'm a unicorn 🦄</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Flying solo and open to connection.</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTypeSelect('couple')}
                    className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-25 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">We're a couple 👥</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Exploring together and curious.</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Helper Text */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">Not sure? You can update this later in Settings.</p>
                  <button
                    onClick={onSwitchToSignIn}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </div>
            </>
          ) : step === 'credentials' ? (
            <>
              {/* Account Creation Step */}
              <div className="text-center mb-8">
                <p className="text-gray-600 leading-relaxed">Create your CORNR account to get started.</p>
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
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="form-input pl-10 bg-gray-50"
                        placeholder="Enter your email"
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
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="form-input pl-10 pr-12 bg-gray-50"
                        placeholder="Create a password"
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

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="form-input pl-10 pr-12 bg-gray-50"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div className="text-red-500 text-sm">
                      {validationError}
                    </div>
                  )}

                  {/* Continue Button */}
                  <button
                    onClick={handleNext}
                    disabled={!formData.email || !formData.password || !formData.confirmPassword}
                    className="btn-primary"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </>
          ) : step === 'verification' ? (
            <>
              {/* Email Verification Step */}
              <div className="text-center mb-8">
                <p className="text-gray-600 leading-relaxed">We've sent a verification link to {formData.email}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-purple-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Check your email</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Click the verification link in your email to continue setting up your profile.
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Didn't receive it? Check your spam folder or resend the email.
                    </p>
                  </div>

                  {/* For demo purposes, we'll simulate verification */}
                  <button
                    onClick={handleNext}
                    className="btn-primary"
                  >
                    I've verified my email
                  </button>
                  
                  <button className="btn-secondary">
                    Resend verification email
                  </button>
                </div>
              </div>
            </>
          ) : step === 'info' ? (
            <>
              {/* User Info Step */}
              <div className="text-center mb-8">
                <p className="text-gray-600 leading-relaxed">This will help others connect with your vibe.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="form-label">
                      Your name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="form-input pl-10 bg-gray-50"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  {/* Birthdate Field */}
                  <div>
                    <label htmlFor="birthdate" className="form-label">
                      Your birthdate
                    </label>
                    <input
                      id="birthdate"
                      type="date"
                      value={formData.birthdate}
                      onChange={(e) => handleInputChange('birthdate', e.target.value)}
                      className="form-input bg-gray-50"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    />
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      This won't be shown publicly — we just use it to calculate your age.
                    </p>
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div className="text-red-500 text-sm">
                      {validationError}
                    </div>
                  )}

                  {/* Continue Button */}
                  <button
                    onClick={handleNext}
                    disabled={!formData.name.trim() || !formData.birthdate}
                    className="btn-primary"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </>
          ) : step === 'photo' ? (
            <>
              {/* Photo Upload Step */}
              <div className="text-center mb-8">
                <p className="text-gray-600 leading-relaxed">Profiles with photos get way more love.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="space-y-6">
                  {/* Photo Upload Area */}
                  <div className="text-center">
                    {formData.photo ? (
                      <div className="mb-4">
                        <div className="w-32 h-32 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                          <Camera className="w-12 h-12 text-purple-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Photo uploaded successfully!</p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Camera className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 font-medium mb-2">No photo yet</p>
                          <p className="text-sm text-gray-500 leading-relaxed">Add one to make your profile stand out.</p>
                        </div>
                      </div>
                    )}

                    <label className="inline-flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-3 px-6 rounded-xl cursor-pointer transition-colors">
                      <Upload className="w-5 h-5" />
                      <span>{formData.photo ? 'Change photo' : 'Upload photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                      We recommend using a clear face photo, alone or with your partner.
                    </p>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={handleNext}
                    className="btn-primary"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </>
          ) : step === 'bio' ? (
            <>
              {/* Bio Step */}
              <div className="text-center mb-8">
                <p className="text-gray-600 leading-relaxed">Tell others what makes you unique.</p>
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
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="form-input resize-none"
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={handleNext}
                    className="btn-primary"
                  >
                    Continue
                  </button>

                  {/* Skip Option */}
                  <button
                    onClick={handleSkipBio}
                    className="btn-skip"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Profile Preview */}
              <div className="text-center mb-8">
                <p className="text-gray-600 leading-relaxed">This is what others will see when they discover you on CORNR.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                {/* Profile Preview Card */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    {formData.photo ? (
                      <Camera className="w-8 h-8 text-purple-600" />
                    ) : (
                      <span className="text-purple-600 text-2xl">
                        {userType === 'unicorn' ? '🦄' : '👫'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{formData.name}</h3>
                  <p className="text-gray-600 mb-4">{formData.bio || 'No bio added yet'}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    userType === 'unicorn' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-pink-100 text-pink-700'
                  }`}>
                    {userType === 'unicorn' ? '🦄 Unicorn' : '👫 Couple'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Let's go live ✨
                </button>
                <button
                  onClick={() => setStep('info')}
                  className="btn-secondary"
                >
                  Edit info
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};