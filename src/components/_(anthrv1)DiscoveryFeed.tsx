import React, { useState, useEffect, useRef } from "react";
import { Heart, X, MapPin, ChevronDown, SkipForward } from "lucide-react";
import { supabase } from "../lib/supabase";
import { authService } from "../services/authService";

interface Profile {
  id: string;
  name: string;
  age?: number;
  user_type: "unicorn" | "couple";
  images: string[];
  bio: string;
  location: string;
  interests: string[];
  additionalInfo?: string;
  photo_url?: string;
  profile_members?: Array<{ name: string; birthdate: string; bio: string }>;
  looking_for?: string;
}

interface DiscoveryPreferences {
  maxDistance: number;
  pauseDiscovery: boolean;
  preferredCoupleAgeRange: [number, number];
  coupleComposition: string[];
  preferredUnicornAgeRange: [number, number];
  preferredUnicornGender: string[];
}

interface TagPillProps {
  tag: string;
}

const TagPill: React.FC<TagPillProps> = ({ tag }) => (
  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
    {tag}
  </span>
);

interface DiscoveryFeedProps {
  currentUserId: string;
  currentUserType: "unicorn" | "couple";
  discoveryPreferences?: DiscoveryPreferences;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  currentUserId,
  currentUserType,
  discoveryPreferences = {
    maxDistance: 50,
    pauseDiscovery: false,
    preferredCoupleAgeRange: [22, 45],
    coupleComposition: ["any-couple"],
    preferredUnicornAgeRange: [22, 45],
    preferredUnicornGender: ["open-to-all"],
  },
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isEssentialSectionComplete, setIsEssentialSectionComplete] =
    useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const essentialSectionRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isNavigationGesture = useRef<boolean>(false);
  const scrollTimeout = useRef<number | null>(null);

  // Calculate age from birthdate
  const calculateAge = (birthdate: string): number | undefined => {
    if (!birthdate) return undefined;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Check if profile matches discovery preferences
  const matchesPreferences = (profile: Profile): boolean => {
    console.log("DEBUG matchesPreferences - checking profile:", profile.name);
    if (discoveryPreferences.pauseDiscovery) {
      console.log("  -> REJECTED: pauseDiscovery is true");
    return false;
    }
    if (currentUserType === "unicorn") {
      // Unicorn viewing couples - check couple preferences
      
      if (profile.user_type !== "couple") {
        console.log("  -> REJECTED: not a unicorn");
        return false;
      }

      const members = profile.profile_members || [];
      if (members.length < 2) return false;

      // Calculate average age of couple
      const ages = members
        .map((m) => calculateAge(m.birthdate))
        .filter((a): a is number => a !== undefined);

      if (ages.length === 2) {
        const avgAge = (ages[0] + ages[1]) / 2;
        const [minAge, maxAge] = discoveryPreferences.preferredCoupleAgeRange;
        if (avgAge < minAge || avgAge > maxAge) return false;
      }

      return true;
    } else {
      // Couple viewing unicorns - check unicorn preferences
      if (profile.user_type !== "unicorn") return false;

      const member = profile.profile_members?.[0];
      if (!member) {
        console.log("  -> REJECTED: no profile_members");
        return false;
      }

      const age = calculateAge(member.birthdate);
      console.log("  -> Unicorn age:", age);
      if (age !== undefined) {
               const [minAge, maxAge] = discoveryPreferences.preferredUnicornAgeRange;
        console.log("  -> Age range preference:", minAge, "-", maxAge);
        if (age < minAge || age > maxAge) {
          console.log("  -> REJECTED: age out of range");
          return false;
        }
      }
console.log("  -> ACCEPTED!");
      return true;
    }
  };

  // Fetch profiles from database
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user's profile_id
        const { data: currentUserData } = await supabase
          .from("profile_members")
          .select("profile_id")
          .eq("auth_user_id", currentUserId)
          .single();

        console.log("DEBUG: currentUserData:", currentUserData);

        if (!currentUserData?.profile_id) {
          setError("Could not find your profile");
          setLoading(false);
          return;
        }

        const currentUserProfileId = currentUserData.profile_id;
        console.log("DEBUG: currentUserProfileId:", currentUserProfileId);

        // Determine what to show based on user type
        const targetUserType = currentUserType === "unicorn" ? "couple" : "unicorn";
        console.log("DEBUG: Looking for profiles of type:", targetUserType);

        // Query profiles with their members
        const { data, error: queryError } = await supabase
          .from("profiles")
          .select(
            `
            id,
            user_type,
            couple_bio,
            location,
            interests,
            looking_for,
            is_complete,
            created_at,
            profile_members (
              name,
              birthdate,
              bio,
              photo_url
            )
          `
          )
          .eq("user_type", targetUserType)
          .eq("is_complete", true)
          .order("created_at", { ascending: false });

        console.log("DEBUG: Full data[0]:", JSON.stringify(data?.[0], null, 2));

             console.log("DEBUG: Query error:", queryError);
      console.log("DEBUG: Raw profiles data:", data);


        if (queryError) throw queryError;

        if (!data || data.length === 0) {
          console.log("DEBUG: No profiles found");
          setProfiles([]);
          setLoading(false);
          return;
        }

        // Fetch already-interacted profiles from matches table
        // Exclude rejected and liked profiles, but NOT passed profiles
        const { data: matches } = await supabase
          .from("matches")
          .select("profile_id, matched_profile_id, status, is_mutual")
          .neq("status", "passed")  // Don't exclude passed (can be seen again)
          .or(
            `profile_id.eq.${currentUserProfileId},matched_profile_id.eq.${currentUserProfileId}`
          );

        const seenProfileIds = new Set(
          matches?.map((m) =>
            m.profile_id === currentUserProfileId
              ? m.matched_profile_id
              : m.profile_id
          ) || []
        );

        // Transform and filter profiles
        const transformedProfiles: Profile[] = data
          .filter(
            (p) =>
              p.id !== currentUserProfileId && !seenProfileIds.has(p.id)
          )
          .map((p) => {
            const members = p.profile_members || [];
            const primaryMember = members[0];
            const secondaryMember = members[1];

            const age = primaryMember?.birthdate
              ? calculateAge(primaryMember.birthdate)
              : undefined;

            return {
              id: p.id,
              name:
                p.user_type === "couple"
                  ? `${primaryMember?.name || "User"} & ${
                      secondaryMember?.name || "Partner"
                    }`
                  : primaryMember?.name || "User",
              age,
              user_type: p.user_type,
              bio: p.couple_bio || primaryMember?.bio || "",
              photo_url: primaryMember?.photo_url || "",
              images: primaryMember?.photo_url ? [primaryMember.photo_url] : [],
              location: p.location || "Unknown",
              interests: p.interests || [],
              additionalInfo:
                members.length > 0 && p.user_type === "couple"
                  ? secondaryMember?.bio
                  : undefined,
              looking_for: p.looking_for,
              profile_members: p.profile_members,
            };
          })
          .filter(matchesPreferences); // Apply preference filtering

        console.log("DEBUG: currentUserProfileId:", currentUserProfileId);
console.log("DEBUG: seenProfileIds:", seenProfileIds);
console.log("DEBUG: Raw data (all fetched):", data);
console.log("DEBUG: After filter (excluding self):", data.filter(p => p.id !== currentUserProfileId));
console.log("DEBUG: transformedProfiles (after map):", transformedProfiles);

        setProfiles(transformedProfiles);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError("Failed to load profiles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [currentUserId, currentUserType, discoveryPreferences]);

  // Handle like action
  const handleLike = async () => {
    if (
      !isEssentialSectionComplete ||
      isTransitioning ||
      actionLoading
    )
      return;

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    setActionLoading(true);
    try {
      // Get current user's profile ID
      const { data: currentUserData } = await supabase
        .from("profile_members")
        .select("profile_id")
        .eq("auth_user_id", currentUserId)
        .single();

      const currentUserProfileId = currentUserData?.profile_id;

      if (!currentUserProfileId) {
        setError("Could not find your profile");
        setActionLoading(false);
        return;
      }

      // Check if target profile already liked current user back
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("is_mutual, status")
        .eq("profile_id", currentProfile.id)
        .eq("matched_profile_id", currentUserProfileId)
        .single();

      if (existingMatch && existingMatch.status === "liked") {
        // Update to mutual like
        await supabase
          .from("matches")
          .update({
            is_mutual: true,
            status: "matched",
          })
          .eq("profile_id", currentProfile.id)
          .eq("matched_profile_id", currentUserProfileId);

        console.log("Matched with:", currentProfile.id);
      } else {
        // Create new like record
        await supabase.from("matches").insert({
          profile_id: currentUserProfileId,
          matched_profile_id: currentProfile.id,
          liked_by_profile_id: currentUserProfileId,
          is_mutual: false,
          status: "liked",
        });

        console.log("Liked profile:", currentProfile.id);
      }

      nextProfile();
    } catch (err) {
      console.error("Error liking profile:", err);
      setError("Failed to like profile");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle pass action (skip for now, can see again)
  const handlePass = async () => {
    if (
      !isEssentialSectionComplete ||
      isTransitioning ||
      actionLoading
    )
      return;

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    setActionLoading(true);
    try {
      console.log("Passed profile (can see again):", currentProfile.id);
      nextProfile();
    } catch (err) {
      console.error("Error passing profile:", err);
      setError("Failed to pass profile");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject action (never show again)
  const handleReject = async () => {
    if (
      !isEssentialSectionComplete ||
      isTransitioning ||
      actionLoading
    )
      return;

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    setActionLoading(true);
    try {
      // Get current user's profile ID
      const { data: currentUserData } = await supabase
        .from("profile_members")
        .select("profile_id")
        .eq("auth_user_id", currentUserId)
        .single();

      const currentUserProfileId = currentUserData?.profile_id;

      if (!currentUserProfileId) {
        setError("Could not find your profile");
        setActionLoading(false);
        return;
      }

      // Create rejected match record
      await supabase.from("matches").insert({
        profile_id: currentUserProfileId,
        matched_profile_id: currentProfile.id,
        liked_by_profile_id: currentUserProfileId,
        is_mutual: false,
        status: "rejected",
      });

      console.log("Rejected profile (never show again):", currentProfile.id);
      nextProfile();
    } catch (err) {
      console.error("Error rejecting profile:", err);
      setError("Failed to reject profile");
    } finally {
      setActionLoading(false);
    }
  };

  const nextProfile = () => {
    if (isTransitioning || currentIndex >= profiles.length - 1) return;

    setIsTransitioning(true);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.style.scrollBehavior = "auto";
      container.scrollTop = 0;
    }

    setCurrentIndex((prev) => prev + 1);
    setScrollProgress(0);
    setIsEssentialSectionComplete(false);

    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.style.scrollBehavior = "smooth";
        container.scrollTop = 0;
      }
      setIsTransitioning(false);
    }, 150);
  };

  const prevProfile = () => {
    if (isTransitioning || currentIndex <= 0) return;

    setIsTransitioning(true);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.style.scrollBehavior = "auto";
      container.scrollTop = 0;
    }

    setCurrentIndex((prev) => prev - 1);
    setScrollProgress(0);
    setIsEssentialSectionComplete(false);

    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.style.scrollBehavior = "smooth";
        container.scrollTop = 0;
      }
      setIsTransitioning(false);
    }, 150);
  };

  const bounceBack = (direction: "up" | "down") => {
    if (isBouncing || isTransitioning) return;
    setIsBouncing(true);

    setTimeout(() => {
      setIsBouncing(false);
    }, 600);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    isNavigationGesture.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTransitioning || isNavigationGesture.current) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = touchStartY.current - currentY;
    const deltaX = touchStartX.current - currentX;
    const deltaTime = Date.now() - touchStartTime.current;
    const distanceY = Math.abs(deltaY);
    const distanceX = Math.abs(deltaX);
    const velocity = distanceY / deltaTime;

    const isHighVelocityGesture =
      distanceY > 80 &&
      velocity > 0.8 &&
      deltaTime < 250 &&
      distanceX < distanceY * 0.3;

    if (isHighVelocityGesture) {
      isNavigationGesture.current = true;
      e.preventDefault();
      e.stopPropagation();

      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.touchAction = "none";
        scrollContainerRef.current.style.overflowY = "hidden";
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isTransitioning) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - touchEndY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaTime = Date.now() - touchStartTime.current;
    const distanceY = Math.abs(deltaY);
    const distanceX = Math.abs(deltaX);
    const velocity = distanceY / deltaTime;

    const isNavigationFlick =
      distanceY > 100 &&
      deltaTime < 350 &&
      velocity > 0.6 &&
      distanceX < distanceY * 0.4;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.touchAction = "";
      scrollContainerRef.current.style.overflowY = "auto";
    }

    if (isNavigationFlick || isNavigationGesture.current) {
      e.preventDefault();
      e.stopPropagation();

      if (deltaY > 0) {
        if (currentIndex < profiles.length - 1) {
          nextProfile();
        } else {
          bounceBack("up");
        }
      } else {
        if (currentIndex > 0) {
          prevProfile();
        } else {
          bounceBack("down");
        }
      }
      return;
    }

    isNavigationGesture.current = false;
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current || !essentialSectionRef.current) return;

    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const essentialHeight = essentialSectionRef.current.offsetHeight;

    console.log("SCROLL DEBUG:", {
    scrollTop: Math.round(scrollTop),
    essentialHeight: Math.round(essentialHeight),
    threshold: Math.round(essentialHeight * 0.8),
    shouldUnlock: scrollTop >= essentialHeight * 0.8,
  });

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      // scroll end
    }, 100);

    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setScrollProgress(Math.min(progress, 100));

    const essentialComplete = scrollTop >= essentialHeight * 0.8;
    setIsEssentialSectionComplete(essentialComplete);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      };
    }
  }, [currentIndex, isTransitioning]);

  // Loading state
  if (loading) {
    return (
      <div
        className="relative h-screen overflow-hidden flex items-center justify-center pb-20"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="text-center px-6">
          <p className="text-gray-500 text-lg mb-2">Loading profiles...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="relative h-screen overflow-hidden flex items-center justify-center pb-20"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="text-center px-6">
          <p className="text-red-500 text-lg mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No profiles state
  if (profiles.length === 0) {
    return (
      <div
        className="relative h-screen overflow-hidden flex items-center justify-center pb-20"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="text-center px-6">
          <p className="text-gray-500 text-lg mb-2">No profiles available</p>
          <p className="text-gray-400 text-sm">
            Check back later for new{" "}
            {currentUserType === "unicorn" ? "couples" : "unicorns"}
          </p>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div
        className="relative h-screen overflow-hidden flex items-center justify-center pb-20"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="text-center px-6">
          <p className="text-gray-500 text-lg mb-2">You've seen all profiles!</p>
          <p className="text-gray-400 text-sm">New profiles will appear soon</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen overflow-hidden bg-purple-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Content */}
      <div
        ref={scrollContainerRef}
        className={`h-full overflow-y-auto scrollbar-hide transition-all duration-300 ${
          isTransitioning ? "opacity-50" : "opacity-100"
        } ${isBouncing ? "animate-bounce-subtle" : ""}`}
        style={{ scrollBehavior: "smooth", paddingBottom: "160px" }}
      >
        {/* Essential Section */}
        <div ref={essentialSectionRef} className="relative">
          {/* Primary Photo */}
          <div className="relative h-screen max-h-[70vh] overflow-hidden bg-gray-200">
            {currentProfile.images[0] ? (
              <img
                src={currentProfile.images[0]}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <span className="text-gray-500">No photo</span>
              </div>
            )}

            {/* Type Badge */}
            <div className="absolute top-6 right-6">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                  currentProfile.user_type === "unicorn"
                    ? "bg-purple-500 text-white"
                    : "bg-pink-500 text-white"
                }`}
              >
                {currentProfile.user_type === "unicorn" ? "🦄" : "👫"}
              </span>
            </div>

            {/* Profile Counter */}
            <div className="absolute top-6 left-6">
              <span className="px-3 py-1 bg-black/50 text-white rounded-full text-xs font-medium">
                {currentIndex + 1} of {profiles.length}
              </span>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Basic Info */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-3xl font-bold mb-2">
                {currentProfile.name}
                {currentProfile.age && `, ${currentProfile.age}`}
              </h2>
              <div className="flex items-center text-white/90 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{currentProfile.location}</span>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>

          {/* Bio Section */}
          <div className="px-6 py-8 bg-white">
            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              {currentProfile.bio || "No bio provided"}
            </p>

            {/* Interests */}
            {currentProfile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentProfile.interests.map((interest) => (
                  <TagPill key={interest} tag={interest} />
                ))}
              </div>
            )}

            {/* Looking For */}
            {currentProfile.looking_for && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Looking for:</span>{" "}
                  {currentProfile.looking_for}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {currentProfile.additionalInfo && (
          <div className="px-6 py-8 bg-white">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              More about {currentProfile.name.split(" ")[0]}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {currentProfile.additionalInfo}
            </p>
          </div>
        )}

        {/* End Indicator */}
        <div className="px-6 py-12 text-center bg-gray-50">
          <p className="text-gray-500 text-sm">
            {currentIndex < profiles.length - 1
              ? "Swipe vertically or use action buttons"
              : "You've reached the end of suggestions"}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg z-30">
        {/* Progress */}
        <div className="w-full h-1 bg-gray-200 rounded-full mb-4">
          <div
            className="h-full bg-purple-400 rounded-full transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Buttons - 3 Actions */}
        <div className="flex justify-center items-center space-x-4">
          {/* Reject Button (Left) - Red X */}
          <button
            onClick={handleReject}
            disabled={
              !isEssentialSectionComplete ||
              isTransitioning ||
              actionLoading
            }
            className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${
              isEssentialSectionComplete &&
              !isTransitioning &&
              !actionLoading
                ? "bg-red-500 border-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg"
                : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            title="Reject - Never show again"
            aria-label="Reject"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Pass Button (Center) - Skip Arrow */}
          <button
            onClick={handlePass}
            disabled={
              !isEssentialSectionComplete ||
              isTransitioning ||
              actionLoading
            }
            className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${
              isEssentialSectionComplete &&
              !isTransitioning &&
              !actionLoading
                ? "bg-gray-400 border-gray-400 text-white hover:bg-gray-500 shadow-md hover:shadow-lg"
                : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            title="Pass - See again later"
            aria-label="Pass"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          {/* Like Button (Right) - Purple Heart */}
          <button
            onClick={handleLike}
            disabled={
              !isEssentialSectionComplete ||
              isTransitioning ||
              actionLoading
            }
            className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${
              isEssentialSectionComplete &&
              !isTransitioning &&
              !actionLoading
                ? "bg-purple-500 border-purple-500 text-white hover:bg-purple-600 shadow-md hover:shadow-lg"
                : "bg-purple-200 border-purple-200 text-purple-300 cursor-not-allowed"
            }`}
            title="Like - Express interest"
            aria-label="Like"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>

        {/* Status */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-600">
            {actionLoading
              ? "Saving..."
              : isEssentialSectionComplete && !isTransitioning
              ? "Reject • Pass • Like"
              : "Keep scrolling to unlock actions"}
          </p>
        </div>
      </div>

      {/* Fix at line 853: Added closing brace for template literal */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes bounce-subtle {
          0% { transform: translateY(0); }
          15% { transform: translateY(-12px); }
          30% { transform: translateY(0); }
          45% { transform: translateY(-8px); }
          60% { transform: translateY(0); }
          75% { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};