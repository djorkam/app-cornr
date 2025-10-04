import React, { useState, useEffect, useRef } from "react";
import { Heart, X, MapPin, ChevronDown } from "lucide-react";

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
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Emma",
    age: 26,
    type: "unicorn",
    images: [
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    bio: "Artist and yoga instructor who loves exploring new places and meeting interesting people. Always up for spontaneous adventures.",
    location: "Downtown, Seattle",
    interests: ["Art", "Yoga", "Travel", "Photography"],
    distance: 2.5,
    additionalInfo:
      "I spend my weekends painting in local parks and teaching yoga classes. Looking for someone who appreciates creativity and mindfulness.",
  },
  {
    id: "2",
    name: "Sarah & Mike",
    age: 28,
    type: "couple",
    images: [
      "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    bio: "Adventure-loving couple seeking new connections and experiences together. We love hiking, cooking, and discovering new places.",
    location: "Capitol Hill, Seattle",
    interests: ["Hiking", "Cooking", "Music", "Wine"],
    distance: 1.8,
    additionalInfo:
      "We've been together for 5 years and love exploring new experiences together. We enjoy hosting dinner parties and weekend getaways.",
  },
  {
    id: "3",
    name: "Luna",
    age: 24,
    type: "unicorn",
    images: [
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    bio: "Free spirit who loves dancing, good conversations, and spontaneous adventures. Life is too short for boring moments.",
    location: "Fremont, Seattle",
    interests: ["Dancing", "Books", "Coffee", "Music"],
    distance: 3.2,
    additionalInfo:
      "I work as a librarian by day and dance instructor by night. I believe in living authentically and connecting deeply with others.",
  },
  {
    id: "4",
    name: "Alex & Jordan",
    age: 30,
    type: "couple",
    images: [
      "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    bio: "Married couple exploring new dimensions of connection and friendship. We value honesty, communication, and shared experiences.",
    location: "Ballard, Seattle",
    interests: ["Fitness", "Movies", "Food", "Travel"],
    distance: 4.1,
    additionalInfo:
      "We love staying active together and trying new restaurants. We're looking for genuine connections and meaningful conversations.",
  },
  {
    id: "5",
    name: "Maya",
    age: 29,
    type: "unicorn",
    images: [
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    bio: "Tech professional by day, creative soul by night. Always up for new experiences and meaningful connections.",
    location: "South Lake Union, Seattle",
    interests: ["Tech", "Art", "Hiking", "Gaming"],
    distance: 1.5,
    additionalInfo:
      "I work in software development but my passion is digital art. I love combining technology with creativity in everything I do.",
  },
  {
    id: "6",
    name: "Chris & Taylor",
    age: 32,
    type: "couple",
    images: [
      "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    bio: "Long-term partners looking to expand our social circle with like-minded people who value authenticity and fun.",
    location: "Queen Anne, Seattle",
    interests: ["Travel", "Yoga", "Cooking", "Wine"],
    distance: 2.8,
    additionalInfo:
      "We love hosting game nights and exploring new neighborhoods. We're looking for friends who share our love of good food and great conversations.",
  },
];

interface TagPillProps {
  tag: string;
}

const TagPill: React.FC<TagPillProps> = ({ tag }) => (
  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
    {tag}
  </span>
);

export const DiscoveryFeed: React.FC = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isEssentialSectionComplete, setIsEssentialSectionComplete] =
    useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const essentialSectionRef = useRef<HTMLDivElement>(null);

  // Touch/Swipe handling
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);
  const lastScrollTop = useRef<number>(0);
  const scrollTimeout = useRef<number | null>(null);
  const isNavigationGesture = useRef<boolean>(false);

  const currentUser = mockUsers[currentUserIndex];

  // Safety check - if no current user, show fallback
  if (!currentUser) {
    return (
      <div className="relative h-screen overflow-hidden flex items-center justify-center pb-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="text-center px-6">
          <p className="text-gray-500 text-lg mb-2">No users to display</p>
          <p className="text-gray-400 text-sm">
            Check back later for new profiles
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !essentialSectionRef.current) return;

      const container = scrollContainerRef.current;
      const essentialSection = essentialSectionRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const essentialHeight = essentialSection.offsetHeight;

      // ADD THIS DEBUG CODE:
  console.log("Scroll metrics:", {
    scrollTop: scrollTop,
    scrollHeight: container.scrollHeight,
    clientHeight: container.clientHeight,
    maxScroll: container.scrollHeight - container.clientHeight,
    canScrollMore: scrollTop < (container.scrollHeight - container.clientHeight),
    isAtBottom: scrollTop >= (container.scrollHeight - container.clientHeight - 10)
  });

      // Track if user is actively scrolling
      isScrolling.current = true;
      lastScrollTop.current = scrollTop;

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set scrolling to false after a shorter delay
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 100);

      // Calculate overall scroll progress
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));

      // Check if essential section is complete
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

  // Touch event handlers for flick gestures
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

    // Early detection of high-velocity navigation gestures
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

      // Immediately prevent default scrolling
      e.preventDefault();
      e.stopPropagation();

      // Lock scroll container immediately
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

    // Navigation gesture thresholds
    const minNavigationDistance = 100;
    const maxNavigationTime = 350;
    const minNavigationVelocity = 0.6;
    const maxHorizontalRatio = 0.4;

    const isNavigationFlick =
      distanceY > minNavigationDistance &&
      deltaTime < maxNavigationTime &&
      velocity > minNavigationVelocity &&
      distanceX < distanceY * maxHorizontalRatio;

    // Always restore scroll container properties
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.style.touchAction = "";
      container.style.overflowY = "auto";
    }

    console.log("Touch analysis:", {
      deltaY,
      distanceY,
      deltaTime,
      velocity: velocity.toFixed(3),
      isNavigationFlick,
      isNavigationGesture: isNavigationGesture.current,
      gestureType: isNavigationFlick ? "NAVIGATION" : "SCROLL",
    });

    // Handle navigation flicks
    if (isNavigationFlick || isNavigationGesture.current) {
      // Prevent any scroll effects from this gesture
      e.preventDefault();
      e.stopPropagation();

      if (deltaY > 0) {
        // Flick up = next profile
        if (currentUserIndex < mockUsers.length - 1) {
          console.log("Navigation UP flick → Next profile");
          nextProfile();
        } else {
          console.log("Navigation UP flick → Bounce at end");
          bounceBack("up");
        }
      } else {
        // Flick down = previous profile
        if (currentUserIndex > 0) {
          console.log("Navigation DOWN flick → Previous profile");
          prevProfile();
        } else {
          console.log("Navigation DOWN flick → Bounce at start");
          bounceBack("down");
        }
      }
      return;
    }

    // Reset navigation gesture flag
    isNavigationGesture.current = false;
    console.log("Normal touch gesture → Allow natural behavior");
  };

  const nextProfile = () => {
    if (isTransitioning || currentUserIndex >= mockUsers.length - 1) return;

    setIsTransitioning(true);
    console.log("Moving to next profile, immediate scroll reset...");

    // Immediate scroll momentum cancellation
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      // Stop all scroll behavior immediately
      container.style.scrollBehavior = "auto";
      container.style.overscrollBehavior = "none";
      container.style.touchAction = "none";

      // Force scroll to top immediately
      container.scrollTop = 0;

      // Force a reflow to ensure scroll reset takes effect
      container.offsetHeight;
    }

    // Update profile and states
    setCurrentUserIndex((prev) => prev + 1);
    setScrollProgress(0);
    setIsEssentialSectionComplete(false);

    // Re-enable scroll after transition
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.style.scrollBehavior = "smooth";
        container.style.overscrollBehavior = "";
        container.style.touchAction = "";

        // Ensure we're still at the top
        container.scrollTop = 0;
      }
      setIsTransitioning(false);
      console.log("Next profile transition completed");
    }, 150);
  };

  const prevProfile = () => {
    if (isTransitioning || currentUserIndex <= 0) return;

    setIsTransitioning(true);
    console.log("Moving to previous profile, immediate scroll reset...");

    // Immediate scroll momentum cancellation
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      // Stop all scroll behavior immediately
      container.style.scrollBehavior = "auto";
      container.style.overscrollBehavior = "none";
      container.style.touchAction = "none";

      // Force scroll to top immediately
      container.scrollTop = 0;

      // Force a reflow
      container.offsetHeight;
    }

    // Update profile and states
    setCurrentUserIndex((prev) => prev - 1);
    setScrollProgress(0);
    setIsEssentialSectionComplete(false);

    // Re-enable scroll after transition
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.style.scrollBehavior = "smooth";
        container.style.overscrollBehavior = "";
        container.style.touchAction = "";

        // Ensure we're still at the top
        container.scrollTop = 0;
      }
      setIsTransitioning(false);
      console.log("Previous profile transition completed");
    }, 150);
  };

  const bounceBack = (direction: "up" | "down") => {
    if (isBouncing || isTransitioning) return;

    console.log(
      `🏀 Bounce back - ${direction} at boundary (${currentUserIndex}/${
        mockUsers.length - 1
      })`
    );
    setIsBouncing(true);

    // Reset bounce state after animation completes
    setTimeout(() => {
      setIsBouncing(false);
      console.log("Bounce animation completed");
    }, 600);
  };

  const handleLike = () => {
    if (!isEssentialSectionComplete || isTransitioning) return;
    console.log("Liked user:", currentUser.id);
    nextProfile();
  };

  const handlePass = () => {
    if (!isEssentialSectionComplete || isTransitioning) return;
    console.log("Passed user:", currentUser.id);
    nextProfile();
  };

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
      style={{ scrollBehavior: "smooth",
             paddingBottom: "160px" }}
        
      >
        {/* Essential Section */}
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
                {currentUserIndex + 1} of {mockUsers.length}
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

        {/* End of Profile Indicator */}
        <div className="px-6 py-12 text-center bg-gray-50">
          <p className="text-gray-500 text-sm">
            {currentUserIndex < mockUsers.length - 1
              ? "Swipe vertically or use like/pass buttons"
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
            onClick={handlePass}
            disabled={!isEssentialSectionComplete || isTransitioning}
            className={`flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-200 ${
              isEssentialSectionComplete && !isTransitioning
                ? "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            style={{ zIndex: 31 }}
            aria-label="Pass"
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
