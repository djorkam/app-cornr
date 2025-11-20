import React, { useState, useEffect, useRef } from "react";
import { Heart, X, MapPin, ChevronDown } from "lucide-react";
import { supabase } from "../lib/supabase";
// import { recordAction, getRatedProfileIds, getPartnerRatings } from "../services/matchService";
import { recordAction, getProfileIdsToHide, getPartnerRatings } from "../services/matchService";

interface User {
  id: string;
  name: string;
  age: number;
  type: "unicorn" | "couple";
  images: string[];
  bio: string;
  location: string;
  interests: string[];
  distance: number;
  additionalInfo?: string;
  profileId: string;
}

interface DiscoveryFeedProps {
  currentUserId: string;
  currentUserType: "unicorn" | "couple";
  discoveryPreferences: {
    maxDistance: number;
    pauseDiscovery: boolean;
    preferredCoupleAgeRange: [number, number];
    coupleComposition: string[];
    preferredUnicornAgeRange: [number, number];
    preferredUnicornGender: string[];
  };
}

interface TagPillProps {
  tag: string;
}

const TagPill: React.FC<TagPillProps> = ({ tag }) => (
  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
    {tag}
  </span>
);

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  currentUserId,
  currentUserType,
  discoveryPreferences,
}) => {
  console.log("=== COMPONENT RENDERED ===");
  // ===== STATE DECLARATIONS =====
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isEssentialSectionComplete, setIsEssentialSectionComplete] =
    useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMemberId, setCurrentMemberId] = useState<string>("");
  const [partnerRatings, setPartnerRatings] = useState<any>(null);

  // ===== REFS =====
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const essentialSectionRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);
  const lastScrollTop = useRef<number>(0);
  const scrollTimeout = useRef<number | null>(null);
  const isNavigationGesture = useRef<boolean>(false);

  // =====  EFFECTS (UNCONDITIONAL - ALL HOOKS BEFORE ANY LOGIC) =====

  // Effect 1: Get current member ID on component mount
  useEffect(() => {
    const getMemberInfo = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("profile_members")
          .select("id")
          .eq("auth_user_id", currentUserId)
          .single();

        if (fetchError) throw fetchError;
        if (data?.id) {
          setCurrentMemberId(data.id);
        }
      } catch (err) {
        console.error("Error fetching member info:", err);
      }
    };

    getMemberInfo();
  }, [currentUserId]);

  // Effect 2: Fetch profiles from Supabase
  useEffect(() => {
    if (discoveryPreferences.pauseDiscovery) {
      return;
    }

    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("profiles")
          .select(
            `
            id,
            user_type,
            location,
            looking_for,
            interests,
            couple_bio,
            profile_members (
              name,
              birthdate,
              gender,
              photo_url,
              bio
            )
          `
          )
          .eq("is_complete", true);

        if (currentUserType === "unicorn") {
          query = query.eq("user_type", "couple");
        } else {
          query = query.eq("user_type", "unicorn");
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const transformedUsers: User[] = (data || [])
          .map((profile: any) => {
            const members = profile.profile_members || [];

            if (profile.user_type === "couple") {
              const names = members.map((m: any) => m.name).join(" & ");
              const primaryMember = members[0];

              return {
                id: profile.id,
                name: names || "Couple",
                age: calculateAge(primaryMember?.birthdate),
                type: "couple",
                images: members
                  .map((m: any) => m.photo_url)
                  .filter(Boolean),
                bio: profile.couple_bio || "Adventure-loving couple",
                location: profile.location || "Seattle",
                interests: profile.interests || [],
                distance: calculateDistance(),
                additionalInfo: primaryMember?.bio,
                profileId: profile.id,
              };
            } else {
              const member = members[0];
              return {
                id: profile.id,
                name: member?.name || "User",
                age: calculateAge(member?.birthdate),
                type: "unicorn",
                images: member?.photo_url ? [member.photo_url] : [],
                bio: member?.bio || "Looking for meaningful connections",
                location: profile.location || "Seattle",
                interests: profile.interests || [],
                distance: calculateDistance(),
                profileId: profile.id,
              };
            }
          })
          .filter((user) => user.images.length > 0);

        // Get already-rated profiles and filter them out
        const { data: memberData } = await supabase
          .from("profile_members")
          .select("profile_id")
          .eq("auth_user_id", currentUserId)
          .single();

 // NEW CODE
if (memberData?.profile_id && currentMemberId) {
  const { hideIds } = await getProfileIdsToHide(
    memberData.profile_id,
    currentMemberId
  );
  
  const filteredUsers = transformedUsers.filter(
    (user) => !hideIds.includes(user.profileId)
  );
  
  console.log("Filtered users:", filteredUsers.length, "from", transformedUsers.length);
  setUsers(filteredUsers);
} else {
          setUsers(transformedUsers);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError("Failed to load profiles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [currentUserType, discoveryPreferences, currentUserId, currentMemberId]);

  console.log("=== ABOUT TO DEFINE EFFECT 3 === ");

  // Effect 3: Scroll handler effect 
  useEffect(() => {
    //debugger; // This will pause execution
    console.log("=== EFFECT 3 STARTED ===");
    
    const handleScroll = () => {
      console.log("handleScroll fired!");
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

      const essentialComplete = scrollTop >= essentialHeight * 0.15;
      setIsEssentialSectionComplete(essentialComplete);
    };

    const container = scrollContainerRef.current;
    console.log("Container ref value:", container);
    console.log("Container exists?", !!container);
    
    if (container) {
      console.log("Attaching scroll listener...");
      container.addEventListener("scroll", handleScroll);
      console.log("Scroll listener attached!");
      
      return () => {
        console.log("Cleaning up scroll listener");
        container.removeEventListener("scroll", handleScroll);
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    } else {
      console.log("ERROR: Container is null!");
    }
  }, []); 

  
  // Effect 4: Fetch partner ratings for current profile
  useEffect(() => {
    const fetchRatings = async () => {
      if (!users[currentUserIndex] || !currentMemberId) return;
      
      try {
        const { data: memberData } = await supabase
          .from("profile_members")
          .select("profile_id")
          .eq("auth_user_id", currentUserId)
          .single();

        if (memberData?.profile_id) {
          const ratings = await getPartnerRatings(
            memberData.profile_id,
            users[currentUserIndex].profileId,
            currentMemberId
          );
          setPartnerRatings(ratings);
        }
      } catch (err) {
        console.error("Error fetching ratings:", err);
      }
    };

    fetchRatings();
  }, [currentUserIndex, currentMemberId, currentUserId, users]);

  // ===== HELPER FUNCTIONS =====

  const calculateAge = (birthdate: string | null): number => {
    if (!birthdate) return 0;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const calculateDistance = (): number => {
    return Math.floor(Math.random() * 20) + 1;
  };

  // ===== TOUCH HANDLERS =====

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
      console.log(
        "High-velocity navigation gesture detected - preventing scroll"
      );
      isNavigationGesture.current = true;

      e.preventDefault();
      e.stopPropagation();

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

    const minNavigationDistance = 100;
    const maxNavigationTime = 350;
    const minNavigationVelocity = 0.6;
    const maxHorizontalRatio = 0.4;

    const isNavigationFlick =
      distanceY > minNavigationDistance &&
      deltaTime < maxNavigationTime &&
      velocity > minNavigationVelocity &&
      distanceX < distanceY * maxHorizontalRatio;

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.style.touchAction = "";
      container.style.overflowY = "auto";
    }

    if (isNavigationFlick || isNavigationGesture.current) {
      e.preventDefault();
      e.stopPropagation();

      if (deltaY > 0) {
        if (currentUserIndex < users.length - 1) {
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

  // ===== PROFILE NAVIGATION =====

  const nextProfile = () => {
    console.log("nextProfile called", {
      isTransitioning,
      currentUserIndex,
      usersLength: users.length,
    });
    
    if (isTransitioning) return;

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

  // ===== ACTION HANDLERS =====

  const handleLike = async () => {
  if (!isEssentialSectionComplete || isTransitioning) return;
  try {
    const currentUser = users[currentUserIndex];
    if (!currentUser) return;

    const result = await recordAction({
      currentUserId,
      currentMemberId,
      profileId: currentUser.profileId,
      action: "like",
    });

    // Check if it's a match!
    if (result.data?.isMatch) {
      // TODO: Show "It's a Match!" modal/notification
      console.log("🎉 IT'S A MATCH!");
      alert("🎉 It's a Match!");
    }

    // Remove from current list
    setUsers((prev) => prev.filter((u) => u.profileId !== currentUser.profileId));
    console.log("Liked user:", currentUser.id);
    
    // Reset scroll
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
    setIsEssentialSectionComplete(false);
  } catch (err: any) {
    console.error("Error in handleLike:", err);
    if (err.message) {
      alert(err.message);
    }
  }
};

  const handleReject = async () => {
  if (!isEssentialSectionComplete || isTransitioning) return;
  try {
    const currentUser = users[currentUserIndex];
    if (!currentUser) return;

    await recordAction({
      currentUserId,
      currentMemberId,
      profileId: currentUser.profileId,
      action: "reject",
    });

    // Remove from current list
    setUsers((prev) => prev.filter((u) => u.profileId !== currentUser.profileId));
    console.log("Rejected user:", currentUser.id);
    
    // Reset scroll
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
    setIsEssentialSectionComplete(false);
  } catch (err: any) {
    console.error("Error in handleReject:", err);
    if (err.message) {
      alert(err.message);
    }
  }
};

  // ===== EARLY RETURNS (AFTER ALL HOOKS & FUNCTIONS) =====

  const currentUser = users[currentUserIndex];
  console.log("Current user:", currentUser?.name, "index:", currentUserIndex);
  
  if (loading) {
    return (
      <div className="relative h-screen overflow-hidden flex items-center justify-center pb-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="text-center px-6">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-gray-600 mt-4">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (error || users.length === 0) {
    return (
      <div className="relative h-screen overflow-hidden flex items-center justify-center pb-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="text-center px-6">
          <p className="text-gray-600 text-lg mb-2">{error || "No profiles available"}</p>
          <p className="text-gray-400 text-sm">Check back later for new matches</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="relative h-screen overflow-hidden bg-purple-50">
        <div className="h-full overflow-y-auto scrollbar-hide flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-gray-600 text-lg mb-2">No profiles available</p>
            <p className="text-gray-400 text-sm">Check back later for new matches</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN JSX RETURN =====

  return (
    <div
      className="relative h-screen overflow-hidden bg-purple-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={scrollContainerRef}
        className={`h-full overflow-y-auto scrollbar-hide transition-all duration-300 ${
          isTransitioning ? "opacity-50" : "opacity-100"
        } ${isBouncing ? "animate-bounce-subtle" : ""}`}
        style={{ scrollBehavior: "smooth", paddingBottom: "160px" }}
      >
        <div ref={essentialSectionRef} className="relative">
          {/* Primary Photo with Type Badge */}
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
                  currentUser.type === "unicorn"
                    ? "bg-purple-500 text-white"
                    : "bg-pink-500 text-white"
                }`}
              >
                {currentUser.type === "unicorn" ? "🦄" : "👫"}
              </span>
            </div>

            {/* Profile Counter */}
            <div className="absolute top-6 left-6">
              <span className="px-3 py-1 bg-black/50 text-white rounded-full text-xs font-medium">
                {currentUserIndex + 1} of {users.length}
              </span>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Basic Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-3xl font-bold mb-2">
                {currentUser.name}, {currentUser.age}
              </h2>
              <div className="flex items-center text-white/90 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {currentUser.location} • {currentUser.distance} km away
                </span>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>

          {/* Bio Section */}
          <div className="px-6 py-8 bg-white">
            {/* Badge: Partner liked this */}
            {/*
            {partnerRatings?.partnerLikedIt && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-700 text-sm">💜 Your partner liked this!</p>
              </div>
            )}
            */}
            {partnerRatings?.canResurrect && (
  <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl shadow-md">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-1">
        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl">
          🔄
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-purple-800 font-semibold text-base mb-1">
          💜 Second Chance!
        </h4>
        <p className="text-purple-700 text-sm leading-relaxed">
          Your partner liked this profile. You previously passed, but you can change your mind!
        </p>
      </div>
    </div>
  </div>
)}
{partnerRatings?.partnerLikedIt && !partnerRatings?.canResurrect && (
  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
    <p className="text-purple-700 text-sm">💜 Your partner liked this!</p>
  </div>
)}
            
            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              {currentUser.bio}
            </p>

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

        {/* End of Profile Indicator */}
        <div className="px-6 py-12 text-center bg-gray-50">
          <p className="text-gray-500 text-sm">
            {currentUserIndex < users.length - 1
              ? "Swipe vertically or use like/reject buttons"
              : "You've reached the end of suggestions"}
          </p>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg z-30">
        {/* Progress Indicator */}
        <div className="w-full h-1 bg-gray-200 rounded-full mb-4">
          <div
            className="h-full bg-purple-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-8">
          <button
            onClick={handleReject}
            disabled={!isEssentialSectionComplete || isTransitioning}
            className={`flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-200 ${
              isEssentialSectionComplete && !isTransitioning
                ? "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            style={{ zIndex: 31 }}
            aria-label="Reject"
          >
            <X className="w-7 h-7" />
          </button>

          <button
            onClick={handleLike}
            disabled={!isEssentialSectionComplete || isTransitioning}
            className={`flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-200 ${
              isEssentialSectionComplete && !isTransitioning
                ? "bg-purple-500 border-purple-500 text-white hover:bg-purple-600 hover:border-purple-600 shadow-md hover:shadow-lg"
                : "bg-purple-200 border-purple-200 text-purple-300 cursor-not-allowed"
            }`}
            style={{ zIndex: 31 }}
            aria-label="Like"
          >
            <Heart className="w-7 h-7" />
          </button>
        </div>

        {/* Status Text */}
        <div className="text-center mt-3">
          <p
            className={`text-xs transition-colors duration-200 ${
              isEssentialSectionComplete && !isTransitioning
                ? "text-gray-600"
                : "text-gray-400"
            }`}
          >
            {isTransitioning
              ? "Loading..."
              : isEssentialSectionComplete
              ? "Ready to decide • Swipe to skip"
              : "Keep scrolling to unlock actions"}
          </p>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes bounce-subtle {
          0% {
            transform: translateY(0);
          }
          15% {
            transform: translateY(-12px);
          }
          30% {
            transform: translateY(0);
          }
          45% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(0);
          }
          75% {
            transform: translateY(-4px);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};