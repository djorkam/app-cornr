import React, { useState, useEffect, useRef } from "react";
import { Heart, X, MapPin, ChevronDown, SkipForward } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  name: string;
  age: number;
  user_type: "unicorn" | "couple";
  images: string[];
  bio: string;
  location: string;
  interests: string[];
  distance: number;
  additionalInfo?: string;
  profile_members?: Array<{ name: string; birthdate: string; bio: string }>;
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
  discoveryPreferences?: any;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  currentUserId,
  currentUserType,
  discoveryPreferences = {},
}) => {
  // ============ ALL STATE DECLARATIONS FIRST ============
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isEssentialSectionComplete, setIsEssentialSectionComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ============ ALL REF DECLARATIONS SECOND ============
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const essentialSectionRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);
  const lastScrollTop = useRef<number>(0);
  const scrollTimeout = useRef<number | null>(null);
  const isNavigationGesture = useRef<boolean>(false);

  // ============ ALL USEEFFECT HOOKS THIRD ============

  // EFFECT 1: Fetch profiles
  useEffect(() => {
    const calculateAge = (birthdate: string): number => {
      if (!birthdate) return 0;
      const today = new Date();
      const birth = new Date(birthdate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: currentUserData } = await supabase
          .from("profile_members")
          .select("profile_id")
          .eq("auth_user_id", currentUserId)
          .single();

        if (!currentUserData?.profile_id) {
          setError("Could not find your profile");
          setLoading(false);
          return;
        }

        const currentUserProfileId = currentUserData.profile_id;
        const targetUserType = currentUserType === "unicorn" ? "couple" : "unicorn";

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

        if (queryError) throw queryError;

        if (!data || data.length === 0) {
          setProfiles([]);
          setLoading(false);
          return;
        }

        const { data: matches } = await supabase
          .from("matches")
          .select("profile_id, matched_profile_id, status")
          .neq("status", "passed")
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
              : 0;

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
              location: p.location || "Unknown",
              interests: p.interests || [],
              distance: 0,
              additionalInfo:
                members.length > 0 && p.user_type === "couple"
                  ? secondaryMember?.bio
                  : undefined,
              profile_members: p.profile_members,
              images: primaryMember?.photo_url
                ? [primaryMember.photo_url]
                : [],
            };
          });

        setProfiles(transformedProfiles);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError("Failed to load profiles");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [currentUserId, currentUserType]);

  // EFFECT 2: Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !essentialSectionRef.current) return;

      const container = scrollContainerRef.current;
      const essentialSection = essentialSectionRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const essentialHeight = essentialSection.offsetHeight;

      isScrolling.current = true;
      lastScrollTop.current = scrollTop;

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 100);

      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));

      const essentialComplete = scrollTop >= essentialHeight * 0.8;
      setIsEssentialSectionComplete(essentialComplete);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }
  }, [currentUserIndex, isTransitioning]);

  // ============ HELPER FUNCTIONS ============
  const nextProfile = () => {
    if (isTransitioning || currentUserIndex >= profiles.length - 1) return;

    setIsTransitioning(true);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.style.scrollBehavior = "auto";
      container.style.overscrollBehavior = "none";
      container.style.touchAction = "none";
      container.scrollTop = 0;
      container.offsetHeight;
    }

    setCurrentUserIndex((prev) => prev + 1);
    setScrollProgress(0);
    setIsEssentialSectionComplete(false);

    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.style.scrollBehavior = "smooth";
        container.style.overscrollBehavior = "";
        container.style.touchAction = "";
        container.scrollTop = 0;
      }
      setIsTransitioning(false);
    }, 150);
  };

  const prevProfile = () => {
    if (isTransitioning || currentUserIndex <= 0) return;

    setIsTransitioning(true);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.style.scrollBehavior = "auto";
      container.style.overscrollBehavior = "none";
      container.style.touchAction = "none";
      container.scrollTop = 0;
      container.offsetHeight;
    }

    setCurrentUserIndex((prev) => prev - 1);
    setScrollProgress(0);
    setIsEssentialSectionComplete(false);

    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.style.scrollBehavior = "smooth";
        container.style.overscrollBehavior = "";
        container.style.touchAction = "";
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

  // Touch handlers
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
    const currentTime = Date.now();

    const deltaY = touchStartY.current - currentY;
    const deltaX = touchStartX.current - currentX;
    const deltaTime = currentTime - touchStartTime.current;

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

      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.style.touchAction = "none";
        container.style.overflowY = "hidden";
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isTransitioning) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndTime = Date.now();

    const deltaY = touchStartY.current - touchEndY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaTime = touchEndTime - touchStartTime.current;

    const distanceY = Math.abs(deltaY);
    const distanceX = Math.abs(deltaX);
    const velocity = distanceY / deltaTime;

    const isNavigationFlick =
      distanceY > 100 &&
      deltaTime < 350 &&
      velocity > 0.6 &&
      distanceX < distanceY * 0.4;

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.style.touchAction = "";
      container.style.overflowY = "auto";
    }

    if (isNavigationFlick || isNavigationGesture.current) {
      if (deltaY > 0) {
        if (currentUserIndex < profiles.length - 1) {
          nextProfile();
        } else {
          bounceBack("up");
        }
      } else {
        if (currentUserIndex > 0) {
          prevProfile();
        } else {
          bounceBack("down");
        }
      }
      return;
    }

    isNavigationGesture.current = false;
  };

  // Database actions
  const handleLike = async () => {
    if (!isEssentialSectionComplete || isTransitioning || actionLoading) return;

    setActionLoading(true);
    try {
      const { data: currentUserData } = await supabase
        .from("profile_members")
        .select("profile_id")
        .eq("auth_user_id", currentUserId)
        .single();

      const currentUserProfileId = currentUserData?.profile_id;
      if (!currentUserProfileId) throw new Error("Profile not found");

      const { data: existingMatch } = await supabase
        .from("matches")
        .select("status")
        .eq("profile_id", currentUser.id)
        .eq("matched_profile_id", currentUserProfileId)
        .single();

      if (existingMatch?.status === "liked") {
        await supabase
          .from("matches")
          .update({ status: "matched", is_mutual: true })
          .eq("profile_id", currentUser.id)
          .eq("matched_profile_id", currentUserProfileId);
      } else {
        await supabase.from("matches").insert({
          profile_id: currentUserProfileId,
          matched_profile_id: currentUser.id,
          liked_by_profile_id: currentUserProfileId,
          status: "liked",
          is_mutual: false,
        });
      }

      nextProfile();
    } catch (err) {
      console.error("Error liking profile:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePass = async () => {
    if (!isEssentialSectionComplete || isTransitioning || actionLoading) return;

    setActionLoading(true);
    try {
      nextProfile();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!isEssentialSectionComplete || isTransitioning || actionLoading) return;

    setActionLoading(true);
    try {
      const { data: currentUserData } = await supabase
        .from("profile_members")
        .select("profile_id")
        .eq("auth_user_id", currentUserId)
        .single();

      const currentUserProfileId = currentUserData?.profile_id;
      if (!currentUserProfileId) throw new Error("Profile not found");

      await supabase.from("matches").insert({
        profile_id: currentUserProfileId,
        matched_profile_id: currentUser.id,
        liked_by_profile_id: currentUserProfileId,
        status: "rejected",
        is_mutual: false,
      });

      nextProfile();
    } catch (err) {
      console.error("Error rejecting profile:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ============ RENDER LOGIC ============

  const currentUser = profiles[currentUserIndex];

  // Loading state
  if (loading) {
    return (
      <div
        className="relative h-screen overflow-hidden flex items-center justify-center pb-20"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="text-center px-6">
          <p className="text-gray-500 text-lg">Loading profiles...</p>
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
            Check back later for new {currentUserType === "unicorn" ? "couples" : "unicorns"}
          </p>
        </div>
      </div>
    );
  }

  // All profiles seen state
  if (!currentUser) {
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

  // Main content
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
          <div className="relative h-screen max-h-[70vh] overflow-hidden">
            <img
              src={currentUser.images[0]}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />

            {/* Type Badge */}
            <div className="absolute top-6 right-6">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                  currentUser.user_type === "unicorn"
                    ? "bg-purple-500 text-white"
                    : "bg-pink-500 text-white"
                }`}
              >
                {currentUser.user_type === "unicorn" ? "🦄" : "👫"}
              </span>
            </div>

            {/* Profile Counter */}
            <div className="absolute top-6 left-6">
              <span className="px-3 py-1 bg-black/50 text-white rounded-full text-xs font-medium">
                {currentUserIndex + 1} of {profiles.length}
              </span>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Basic Info */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-3xl font-bold mb-2">
                {currentUser.name}, {currentUser.age}
              </h2>
              <div className="flex items-center text-white/90 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{currentUser.location}</span>
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
              {currentUser.bio}
            </p>

            {/* Interests */}
            {currentUser.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentUser.interests.map((interest) => (
                  <TagPill key={interest} tag={interest} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Photo */}
        {currentUser.images[1] && (
          <div className="h-96 overflow-hidden">
            <img
              src={currentUser.images[1]}
              alt={`${currentUser.name} photo 2`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Additional Info */}
        {currentUser.additionalInfo && (
          <div className="px-6 py-8 bg-white">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              More about {currentUser.name.split(" ")[0]}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {currentUser.additionalInfo}
            </p>
          </div>
        )}

        {/* End Indicator */}
        <div className="px-6 py-12 text-center bg-gray-50">
          <p className="text-gray-500 text-sm">
            {currentUserIndex < profiles.length - 1
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
            className="h-full bg-purple-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Buttons - 3 Actions */}
        <div className="flex justify-center items-center space-x-4">
          {/* Reject - Red */}
          <button
            onClick={handleReject}
            disabled={!isEssentialSectionComplete || isTransitioning || actionLoading}
            className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${
              isEssentialSectionComplete && !isTransitioning && !actionLoading
                ? "bg-red-500 border-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg"
                : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Reject"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Pass - Gray */}
          <button
            onClick={handlePass}
            disabled={!isEssentialSectionComplete || isTransitioning || actionLoading}
            className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${
              isEssentialSectionComplete && !isTransitioning && !actionLoading
                ? "bg-gray-400 border-gray-400 text-white hover:bg-gray-500 shadow-md hover:shadow-lg"
                : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Pass"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          {/* Like - Purple */}
          <button
            onClick={handleLike}
            disabled={!isEssentialSectionComplete || isTransitioning || actionLoading}
            className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${
              isEssentialSectionComplete && !isTransitioning && !actionLoading
                ? "bg-purple-500 border-purple-500 text-white hover:bg-purple-600 shadow-md hover:shadow-lg"
                : "bg-purple-200 border-purple-200 text-purple-300 cursor-not-allowed"
            }`}
            aria-label="Like"
          >
            <Heart className="w-7 h-7" />
          </button>
        </div>

        {/* Status */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-600">
            {actionLoading
              ? "Saving..."
              : isEssentialSectionComplete
              ? "Reject • Pass • Like"
              : "Keep scrolling to unlock actions"}
          </p>
        </div>
      </div>

      {/* Styles */}
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