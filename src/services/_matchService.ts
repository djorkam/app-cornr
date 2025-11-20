import { supabase } from "../lib/supabase";

export type MatchStatus = "liked" | "rejected" | "approved";

interface RecordActionParams {
  currentUserId: string; // auth_user_id
  currentMemberId: string; // profile_member id
  profileId: string; // the profile being liked/rejected
  action: "like" | "reject";
}

interface CheckResurrectionParams {
  profileId: string;
  matchedProfileId: string;
  currentMemberId: string;
}

/**
 * Record a like or reject action from current user
 */
export const recordAction = async ({
  currentUserId,
  currentMemberId,
  profileId,
  action,
}: RecordActionParams) => {
  try {
    // Get current user's couple profile
    const { data: memberData, error: memberError } = await supabase
      .from("profile_members")
      .select("profile_id")
      .eq("auth_user_id", currentUserId)
      .single();

    if (memberError) throw memberError;
    if (!memberData?.profile_id) throw new Error("Profile not found");

    const coupleProfileId = memberData.profile_id;
    const status: MatchStatus = action === "like" ? "liked" : "rejected";

    // Check if match record already exists
    const { data: existingMatch, error: checkError } = await supabase
      .from("matches")
      .select("id, status")
      .eq("profile_id", coupleProfileId)
      .eq("matched_profile_id", profileId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned (expected)
      throw checkError;
    }

    if (existingMatch) {
      // Update existing match
      const { error } = await supabase
        .from("matches")
        .update({
          status,
          liked_by_member_id: action === "like" ? currentMemberId : null,
          rejected_by_member_id: action === "reject" ? currentMemberId : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMatch.id);

      if (error) throw error;
      console.log(`Action recorded: ${action} on profile ${profileId}`);
      return { data: null, error: null };
    } else {
      // Create new match
      const { error } = await supabase
        .from("matches")
        .insert({
          profile_id: coupleProfileId,
          matched_profile_id: profileId,
          liked_by_profile_id: coupleProfileId,
          liked_by_member_id: action === "like" ? currentMemberId : null,
          rejected_by_member_id: action === "reject" ? currentMemberId : null,
          status,
          is_mutual: false,
        });

      if (error) throw error;
      console.log(`Action recorded: ${action} on profile ${profileId}`);
      return { data: null, error: null };
    }
  } catch (error) {
    console.error("Error recording action:", error);
    throw error;
  }
};

/**
 * Check if current partner can resurrect a rejected profile
 * Returns true if the other partner has liked it
 */
export const checkResurrection = async ({
  profileId,
  matchedProfileId,
  currentMemberId,
}: CheckResurrectionParams) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("status, liked_by_member_id, rejected_by_member_id")
      .eq("profile_id", profileId)
      .eq("matched_profile_id", matchedProfileId)
      .single();

    if (error && error.code === "PGRST116") {
      // No match record exists
      return { canResurrect: false, error: null };
    }

    if (error) throw error;

    // Can resurrect if:
    // - Status is "rejected"
    // - The OTHER partner (not current user) has liked it
    const canResurrect =
      data.status === "rejected" &&
      data.liked_by_member_id &&
      data.liked_by_member_id !== currentMemberId;

    return { canResurrect, matchRecord: data, error: null };
  } catch (error) {
    console.error("Error checking resurrection:", error);
    throw error;
  }
};

/**
 * Approve a match (when both partners like)
 */
export const approveMatch = async (matchId: string) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .update({
        status: "approved",
        is_mutual: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId)
      .select()
      .single();

    if (error) throw error;
    console.log("Match approved:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Error approving match:", error);
    throw error;
  }
};

/**
 * Get all matches for a profile (liked, rejected, approved)
 */
export const getMatches = async (profileId: string, status?: MatchStatus) => {
  try {
    let query = supabase
      .from("matches")
      .select(
        `
        id,
        matched_profile_id,
        status,
        liked_by_member_id,
        rejected_by_member_id,
        is_mutual,
        created_at,
        updated_at,
        profiles:matched_profile_id (
          id,
          user_type,
          location,
          interests,
          couple_bio,
          profile_members (
            name,
            birthdate,
            photo_url,
            bio
          )
        )
      `
      )
      .eq("profile_id", profileId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

/**
 * Get all profile IDs that the user has already rated (liked or rejected)
 */
export const getRatedProfileIds = async (coupleProfileId: string) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("matched_profile_id")
      .eq("profile_id", coupleProfileId)
      .in("status", "rejected");

    if (error) throw error;

    const ratedIds = data?.map((match: any) => match.matched_profile_id) || [];
    console.log("Rated profile IDs:", ratedIds);
    return { ratedIds, error: null };
  } catch (error) {
    console.error("Error fetching rated profiles:", error);
    throw error;
  }
};

/**
 * Get partner ratings for a specific profile
 * Returns the match record if it exists, showing which partner liked/rejected
 */
export const getPartnerRatings = async (
  coupleProfileId: string,
  targetProfileId: string,
  currentMemberId: string
) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("id, status, liked_by_member_id, rejected_by_member_id")
      .eq("profile_id", coupleProfileId)
      .eq("matched_profile_id", targetProfileId)
      .single();

    if (error && error.code === "PGRST116") {
      // No match record exists - profile hasn't been rated
      return {
        hasRating: false,
        status: null,
        partnerLikedIt: false,
        currentUserLikedIt: false,
        error: null,
      };
    }

    if (error) throw error;

    // Determine if partner (not current user) liked this
    const partnerLikedIt =
      data.status === "liked" &&
      data.liked_by_member_id &&
      data.liked_by_member_id !== currentMemberId;

    // Determine if current user already liked/rejected this
    const currentUserLikedIt =
      data.status === "liked" && data.liked_by_member_id === currentMemberId;

    const currentUserRejectedIt =
      data.status === "rejected" && data.rejected_by_member_id === currentMemberId;

    return {
      hasRating: true,
      status: data.status,
      matchId: data.id,
      partnerLikedIt,
      currentUserLikedIt,
      currentUserRejectedIt,
      liked_by_member_id: data.liked_by_member_id,
      rejected_by_member_id: data.rejected_by_member_id,
      error: null,
    };
  } catch (error) {
    console.error("Error getting partner ratings:", error);
    throw error;
  }
};