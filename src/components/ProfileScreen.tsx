import React, { useState } from "react";
import { UserProfile, calculateAge, formatGender } from "../utils/utils";
import { PartnerManagement } from "./PartnerManagement";
import { photoService } from "../services/photoService";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { authService } from "../services/authService";
import { getUserPartner } from "../utils/partnerUtils";

interface ProfileScreenProps {
  userType: "unicorn" | "couple";
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  saveMessage: string;
  handleSaveProfile: () => void;
  userId: string;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userType,
  userProfile,
  setUserProfile,
  saveMessage,
  handleSaveProfile,
  userId
}) => {
  const [newInterest, setNewInterest] = useState("");
  const { user } = useAuth();
const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
const [photoUploadError, setPhotoUploadError] = useState("");
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [isLoadingPartner, setIsLoadingPartner] = useState(false);

  // Load partner profile for couples
  React.useEffect(() => {
    if (userType === 'couple' && user) {
      loadPartnerProfile();
    }
  }, [userType, user]);

  const loadPartnerProfile = async () => {
    if (!user) return;
    
    setIsLoadingPartner(true);
    try {
      const partnerId = await getUserPartner(user.id);
      if (partnerId) {
        const { data: partnerData } = await authService.getProfileMember(partnerId);
        setPartnerProfile(partnerData);
      }
    } catch (error) {
      console.error('Error loading partner profile:', error);
    } finally {
      setIsLoadingPartner(false);
    }
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !userProfile.interests.includes(interest.trim())) {
      setUserProfile((prev) => ({
        ...prev,
        interests: [...prev.interests, interest.trim()],
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setUserProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleInterestKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newInterest.trim()) {
      addInterest(newInterest);
      setNewInterest("");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  setIsUploadingPhoto(true);
  setPhotoUploadError("");

  try {
    // Delete old photo if exists
    if (userProfile.photoUrl) {
      await photoService.deleteProfilePhoto(userProfile.photoUrl);
    }

    // Upload new photo
    const photoUrl = await photoService.uploadProfilePhoto(user.id, file);

    if (!photoUrl) {
      setPhotoUploadError("Failed to upload photo");
      setIsUploadingPhoto(false);
      return;
    }

    // Update local state
    setUserProfile(prev => ({
      ...prev,
      photoUrl
    }));

    // Save to database
    const { data: memberData } = await authService.getProfileMember(user.id);
    
    if (memberData?.profile_id) {
      await supabase
        .from('profile_members')
        .update({ photo_url: photoUrl })
        .eq('auth_user_id', user.id);
    }

    setIsUploadingPhoto(false);
  } catch (error) {
    console.error("Error uploading photo:", error);
    setPhotoUploadError("Error uploading photo");
    setIsUploadingPhoto(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto page-container pb-20">
      <h2 className="text-2xl font-semibold mb-6 section-spacing">
        Your Profile
      </h2>

      {/* Profile Type Badge */}
      <div className="mb-6 section-spacing">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            userType === "unicorn"
              ? "bg-purple-100 text-purple-700"
              : "bg-pink-100 text-pink-700"
          }`}
        >
          {userType === "unicorn" ? "🦄 Unicorn Profile" : "👫 Couple Profile"}
        </span>
      </div>

{/* Profile Photo Section */}
<div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
  <h3 className="text-lg font-semibold mb-4 text-gray-800">
    Profile Photo{userType === 'couple' ? 's' : ''}
  </h3>
  
  {userType === 'couple' ? (
    // Couple photos side-by-side
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4">
        {/* Current user photo */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-purple-200">
            {userProfile.photoUrl ? (
              <img 
                src={userProfile.photoUrl} 
                alt="Your photo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-purple-600 text-xl">👤</span>
            )}
          </div>
          <span className="text-xs text-gray-600 mt-1">You</span>
        </div>
        
        {/* Partner photo */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-purple-200">
            {partnerProfile?.photo_url ? (
              <img 
                src={partnerProfile.photo_url} 
                alt="Partner photo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-purple-600 text-xl">👤</span>
            )}
          </div>
          <span className="text-xs text-gray-600 mt-1">
            {isLoadingPartner ? 'Loading...' : (partnerProfile?.name || 'Partner')}
          </span>
        </div>
      </div>
      
      <div className="text-center">
        <label className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer inline-block"
          style={{ backgroundColor: isUploadingPhoto ? "#9CA3AF" : "#B19CD9", color: "#FFFFFF" }}
        >
          {isUploadingPhoto ? "Uploading..." : "Upload Your Photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={isUploadingPhoto}
            className="hidden"
          />
        </label>
        <p className="text-xs mt-1" style={{ color: "#B0B0B0" }}>
          Upload your individual photo
        </p>
      </div>
    </div>
  ) : (
    // Single photo for unicorns
    <div className="flex items-center space-x-4">
      <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
        {userProfile.photoUrl ? (
          <img 
            src={userProfile.photoUrl} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-purple-600 text-2xl">🦄</span>
        )}
      </div>
      <div>
        <label className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer inline-block"
          style={{ backgroundColor: isUploadingPhoto ? "#9CA3AF" : "#B19CD9", color: "#FFFFFF" }}
        >
          {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={isUploadingPhoto}
            className="hidden"
          />
        </label>
        <p className="text-xs mt-1" style={{ color: "#B0B0B0" }}>
          Your best photo
        </p>
      </div>
    </div>
  )}
  
  {photoUploadError && (
    <p className="text-xs mt-1 text-red-600">{photoUploadError}</p>
  )}
</div>
      
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Basic Information
        </h3>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="form-label">
              {userType === "couple" ? 'Your Name' : "Name"}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Your name"
              value={userProfile.name}
              onChange={(e) =>
                setUserProfile((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            {userType === "couple" && (
              <p className="text-sm text-gray-500 mt-2">
                Combined display: {userProfile.name && partnerProfile?.name 
                  ? `${userProfile.name} & ${partnerProfile.name}` 
                  : 'Will show as "You & Partner" when both names are set'}
              </p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="form-label">
              {userType === "couple" ? "Ages" : "Age"}
            </label>
            {userType === "couple" ? (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Your age"
                    value={userProfile.birthdate ? calculateAge(userProfile.birthdate) : ""}
                    min="18"
                    max="99"
                    readOnly
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Partner's age"
                    value={partnerProfile?.birthdate ? calculateAge(partnerProfile.birthdate) : ""}
                    min="18"
                    max="99"
                    readOnly
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Display: {userProfile.birthdate && partnerProfile?.birthdate 
                    ? `${calculateAge(userProfile.birthdate)} & ${calculateAge(partnerProfile.birthdate)}` 
                    : 'Ages will show when both partners are linked'}
                </p>
              </div>
            ) : (
              <input
                type="number"
                className="form-input"
                placeholder="Your age"
                min="18"
                max="99"
                value={
                  userProfile.birthdate
                    ? calculateAge(userProfile.birthdate)
                    : ""
                }
                readOnly
              />
            )}
          </div>

          {/* Gender */}
<div>
  <label className="form-label">
    {userType === "couple" ? "Your Gender" : "Gender"}
  </label>
  <select
    value={userProfile.gender}
    onChange={(e) =>
      setUserProfile(prev => ({
        ...prev,
        gender: e.target.value as any
      }))
    }
    className="form-input"
  >
    <option value="woman">Woman</option>
    <option value="man">Man</option>
    <option value="non-binary">Non-binary</option>
    <option value="prefer-not">Prefer not to say</option>
    <option value="other">Other</option>
  </select>
  {userType === "couple" && (
    <p className="text-sm text-gray-500 mt-2">
      Combined display: {userProfile.gender && partnerProfile?.gender 
        ? `${formatGender(userProfile.gender, userProfile.customGender)} & ${formatGender(partnerProfile.gender, partnerProfile.custom_gender)}` 
        : 'Will show both genders when partner is linked'}
    </p>
  )}
</div>

{/* Custom Gender - Show only if "other" selected */}
{userProfile.gender === "other" && (
  <div>
    <label className="form-label">Please specify</label>
    <input
      type="text"
      value={userProfile.customGender || ''}
      onChange={(e) =>
        setUserProfile(prev => ({
          ...prev,
          customGender: e.target.value
        }))
      }
      className="form-input"
      placeholder="e.g. Genderfluid, Agender"
    />
  </div>
)}
          {/* Location */}
          <div>
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="To be completed - will use your actual location"
              value={userProfile.location}
              onChange={(e) =>
                setUserProfile((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              disabled
            />
            <p className="text-sm text-gray-500 mt-2">
              Location will be automatically detected in a future update
            </p>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {userType === "couple" ? "About Us" : "About Me"}
        </h3>
        
        {userType === "couple" ? (
          <div className="space-y-6">
            {/* Shared couple bio */}
            <div>
              <label className="form-label">
                About Us (Shared Bio)
              </label>
              <textarea
                rows={3}
                className="form-input resize-none"
                placeholder="Tell others about yourselves as a couple. What are you looking for together?"
                value={userProfile.lookingFor || ""}
                onChange={(e) =>
                  setUserProfile((prev) => ({ ...prev, lookingFor: e.target.value }))
                }
              />
              <p className="text-sm mt-1 text-gray-500 leading-relaxed">
                This shared description will appear first on your profile
              </p>
            </div>
            
            {/* Individual bios */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Individual Bios</h4>
              
              {/* Your bio */}
              <div>
                <label className="form-label">
                  Your Bio
                </label>
                <textarea
                  rows={3}
                  className="form-input resize-none"
                  placeholder="Tell others about yourself individually..."
                  value={userProfile.bio}
                  onChange={(e) =>
                    setUserProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                />
              </div>
              
              {/* Partner bio display */}
              {partnerProfile && (
                <div>
                  <label className="form-label">
                    {partnerProfile.name || "Partner"}'s Bio
                  </label>
                  <div className="form-input bg-gray-50 text-gray-600 min-h-[80px] flex items-center">
                    {partnerProfile.bio || "No bio added yet"}
                  </div>
                  <p className="text-sm mt-1 text-gray-500">
                    Your partner can edit their bio from their own profile
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="form-label">
              Bio / About me
            </label>
            <textarea
              rows={4}
              className="form-input resize-none"
              placeholder="Tell others about yourself, your interests, and what makes you unique."
              value={userProfile.bio}
              onChange={(e) =>
                setUserProfile((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
            <p className="text-sm mt-1 text-gray-500 leading-relaxed">
              Share what makes you unique
            </p>
          </div>
        )}
      </div>

      {/* Looking For Section - Only for unicorns now */}
      {userType === "unicorn" && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Looking For
          </h3>
          <div>
            <label className="form-label">What are you looking for?</label>
            <select
              className="form-input"
              value={userProfile.lookingFor}
              onChange={(e) =>
                setUserProfile((prev) => ({
                  ...prev,
                  lookingFor: e.target.value,
                }))
              }
            >
              <option value="">Select what you're looking for</option>
              <option value="couples">Interested in couples</option>
              <option value="curious-connections">Curious connections</option>
              <option value="friendship">Friendship first</option>
              <option value="casual-meetup">
                Grab a beer or a glass of wine
              </option>
              <option value="exploring">Just exploring</option>
            </select>
          </div>
        </div>
      )}

      {/* Interests/Tags Section */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6 section-spacing">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Interests & Tags
        </h3>
        <div className="mb-4">
          <label className="form-label">
            Add your interests
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Type an interest and press Enter"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={handleInterestKeyPress}
          />
        </div>

        {/* Current Interests */}
        {userProfile.interests.length > 0 && (
          <div className="mb-4">
            <p className="form-label">Your interests:</p>
            <div className="flex flex-wrap gap-2">
              {userProfile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm flex items-center"
                >
                  {interest}
                  <button
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sample Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            "Travel",
            "Yoga",
            "Cooking",
            "Music",
            "Art",
            "Hiking",
            "Photography",
            "Dancing",
          ].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors cursor-pointer"
              onClick={() => addInterest(tag)}
            >
              {tag} +
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 leading-relaxed">
          Click on interests above to add them to your profile
        </p>
      </div>

      {/* Partner Management Section - Only for couples */}
      {userType === "couple" && (
        <div className="section-spacing">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Partner Connection
          </h3>
          <PartnerManagement userId={userId} userType={userType} />
        </div>
      )}

      {/* Save Button */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 section-spacing">
        {saveMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {saveMessage}
          </div>
        )}
        <button className="btn-primary" onClick={handleSaveProfile}>
          Save Profile Changes
        </button>
      </div>
    </div>
  );
};
