import { supabase } from "../lib/supabase";

export type MatchStatus = "pending_one" | "both_liked" | "both_rejected" | "mixed";
export type MemberAction = "liked" | "rejected";

interface RecordActionParams {
  currentUserId: string; // auth_user_id
  currentMemberId: string; // profile_member id
  profileId: string; // the profile being liked/rejected
  action: "like" | "reject"; // UI passes these
}

interface MatchRecord {
  id: string;
  status: MatchStatus;
  member_1_id: string | null;
  member_1_action: MemberAction | null;
  member_2_id: string | null;
  member_2_action: MemberAction | null;
}

/**
 * Helper: Compute the overall status based on both partners' actions
 */
const computeStatus = (
  member1Action: MemberAction | null,
  member2Action: MemberAction | null
): MatchStatus => {
  if (!member1Action && !member2Action) return "pending_one";
  if (!member1Action || !member2Action) return "pending_one";
  
  if (member1Action === "liked" && member2Action === "liked") {
    return "both_liked";
  }
  if (member1Action === "rejected" && member2Action === "rejected") {
    return "both_rejected";
  }
  return "mixed"; // One liked, one rejected
};

/**
 * Record a like or reject action from current user
 * CORE RULE: Can only change mind from reject→like if partner liked it (resurrection)
 */
export const recordAction = async ({
  currentUserId,
  currentMemberId,
  profileId,
  action,
}: RecordActionParams) => {
  try {
    // Convert UI action to DB action
    const dbAction: MemberAction = action === "like" ? "liked" : "rejected";
    
    // Get current user's couple profile
    const { data: memberData, error: memberError } = await supabase
      .from("profile_members")
      .select("profile_id")
      .eq("auth_user_id", currentUserId)
      .single();

    if (memberError) throw memberError;
    if (!memberData?.profile_id) throw new Error("Profile not found");

    const coupleProfileId = memberData.profile_id;

    // Check if match record already exists
    const { data: existingMatch, error: checkError } = await supabase
      .from("matches")
      .select("id, status, member_1_id, member_1_action, member_1_timestamp, member_2_id, member_2_action, member_2_timestamp")
      .eq("profile_id", coupleProfileId)
      .eq("matched_profile_id", profileId)
      .maybeSingle();

    if (checkError) throw checkError;

    const now = new Date().toISOString();

    if (existingMatch) {
      // Match record exists - update it
      const isPartner1 = existingMatch.member_1_id === currentMemberId;
      const isPartner2 = existingMatch.member_2_id === currentMemberId;
      
      let member1Id = existingMatch.member_1_id;
      let member1Action = existingMatch.member_1_action;
      let member2Id = existingMatch.member_2_id;
      let member2Action = existingMatch.member_2_action;

      // Determine which slot this member occupies
      if (isPartner1) {
        // Current user is member_1
        const currentAction = member1Action;
        
        // RESURRECTION RULE: Can only change reject→like if partner liked it
        if (currentAction === "rejected" && dbAction === "liked") {
          // Check if partner liked it
          const partnerLiked = member2Action === "liked";
          if (!partnerLiked) {
            throw new Error("Cannot change mind unless your partner liked this profile");
          }
        }
        
        // PREVENT like→reject if already liked (actions are final unless resurrection)
        if (currentAction === "liked" && dbAction === "rejected") {
          throw new Error("Cannot change from like to reject");
        }
        
        member1Action = dbAction;
      } else if (isPartner2) {
        // Current user is member_2
        const currentAction = member2Action;
        
        // RESURRECTION RULE
        if (currentAction === "rejected" && dbAction === "liked") {
          const partnerLiked = member1Action === "liked";
          if (!partnerLiked) {
            throw new Error("Cannot change mind unless your partner liked this profile");
          }
        }
        
        // PREVENT like→reject
        if (currentAction === "liked" && dbAction === "rejected") {
          throw new Error("Cannot change from like to reject");
        }
        
        member2Action = dbAction;
      } else {
        // Current user hasn't acted yet - assign to empty slot
        if (!member1Id) {
          member1Id = currentMemberId;
          member1Action = dbAction;
        } else {
          member2Id = currentMemberId;
          member2Action = dbAction;
        }
      }

      // Compute new status
      const newStatus = computeStatus(member1Action, member2Action);

      // Determine timestamps - set to now if this member just acted
      const member1Timestamp = (isPartner1 || (!existingMatch.member_1_id && member1Id === currentMemberId)) 
        ? now 
        : existingMatch.member_1_timestamp;
      
      const member2Timestamp = (isPartner2 || (!existingMatch.member_2_id && member2Id === currentMemberId)) 
        ? now 
        : existingMatch.member_2_timestamp;

      // Update the match record
      const { error: updateError } = await supabase
        .from("matches")
        .update({
          member_1_id: member1Id,
          member_1_action: member1Action,
          member_1_timestamp: member1Timestamp,
          member_2_id: member2Id,
          member_2_action: member2Action,
          member_2_timestamp: member2Timestamp,
          status: newStatus,
          is_mutual: newStatus === "both_liked",
          updated_at: now,
        })
        .eq("id", existingMatch.id);

      if (updateError) throw updateError;

      console.log(`Action recorded: ${action} on profile ${profileId}, new status: ${newStatus}`);
      return { 
        data: { status: newStatus, isMatch: newStatus === "both_liked" }, 
        error: null 
      };
    } else {
      // No match record exists - create new one
      const newStatus = "pending_one";

      const { error: insertError } = await supabase
        .from("matches")
        .insert({
          profile_id: coupleProfileId,
          matched_profile_id: profileId,
          member_1_id: currentMemberId,
          member_1_action: dbAction,
          member_1_timestamp: now,
          status: newStatus,
          is_mutual: false,
        });

      if (insertError) throw insertError;

      console.log(`New match created: ${action} on profile ${profileId}`);
      return { 
        data: { status: newStatus, isMatch: false }, 
        error: null 
      };
    }
  } catch (error) {
    console.error("Error recording action:", error);
    return { data: null, error };
  }
};

/**
 * Get profiles to HIDE from current member's discovery feed
 * 
 * VISIBILITY RULES (NO SECOND GUESSING):
 * - Hide if both_liked (moved to matches)
 * - Hide if both_rejected (definite no)
 * - Hide if THIS member acted on it (liked OR rejected) UNLESS resurrection applies
 * - RESURRECTION: Only show if THIS member was FIRST to reject, then partner liked it
 *   (If you rejected AFTER your partner already liked it, no second chance)
 */
export const getProfileIdsToHide = async (
  coupleProfileId: string,
  currentMemberId: string
): Promise<{ hideIds: string[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("matched_profile_id, status, member_1_id, member_1_action, member_1_timestamp, member_2_id, member_2_action, member_2_timestamp")
      .eq("profile_id", coupleProfileId);

    if (error) throw error;

    const hideIds: string[] = [];

    data?.forEach((match: any) => {
      const isMember1 = match.member_1_id === currentMemberId;
      const isMember2 = match.member_2_id === currentMemberId;
      
      const currentMemberAction = isMember1 ? match.member_1_action : 
                                   isMember2 ? match.member_2_action : null;
      const currentMemberTimestamp = isMember1 ? match.member_1_timestamp : 
                                      isMember2 ? match.member_2_timestamp : null;
      
      const partnerAction = isMember1 ? match.member_2_action : 
                           isMember2 ? match.member_1_action : null;
      const partnerTimestamp = isMember1 ? match.member_2_timestamp : 
                              isMember2 ? match.member_1_timestamp : null;
      
      // Rule 1: Hide if both liked (it's a match - moved to matches screen)
      if (match.status === "both_liked") {
        hideIds.push(match.matched_profile_id);
        return;
      }
      
      // Rule 2: Hide if both rejected (definite no)
      if (match.status === "both_rejected") {
        hideIds.push(match.matched_profile_id);
        return;
      }
      
      // Rule 3: If current member hasn't acted yet, don't hide (show in feed)
      if (!currentMemberAction) {
        return; // Don't hide - member needs to see it
      }
      
      // Rule 4: RESURRECTION CHECK (No Second Guessing Rule)
      // Only allow resurrection if:
      // 1. Current member rejected it
      // 2. Partner liked it
      // 3. Current member rejected BEFORE partner liked (current member acted FIRST)
      if (currentMemberAction === "rejected" && partnerAction === "liked") {
        // Check who acted first using timestamps
        const currentActedFirst = currentMemberTimestamp && partnerTimestamp && 
                                  new Date(currentMemberTimestamp) < new Date(partnerTimestamp);
        
        if (currentActedFirst) {
          // RESURRECTION! Current member rejected first, partner liked later
          // Don't hide - show with "second chance" badge
          console.log(`Resurrection for profile ${match.matched_profile_id}: member acted first`);
          return;
        } else {
          // Current member rejected AFTER partner liked - no second chance
          console.log(`No resurrection for profile ${match.matched_profile_id}: member acted second`);
          hideIds.push(match.matched_profile_id);
          return;
        }
      }
      
      // Rule 5: All other cases where current member acted - HIDE IT
      // This includes:
      // - Current member liked (they made their choice, profile disappears)
      // - Current member rejected and partner hasn't acted yet
      // - Current member liked and partner rejected (no second guessing for likes either)
      hideIds.push(match.matched_profile_id);
    });

    console.log(`Member ${currentMemberId} - hiding ${hideIds.length} profiles:`, hideIds);
    return { hideIds, error: null };
  } catch (error) {
    console.error("Error getting profiles to hide:", error);
    return { hideIds: [], error };
  }
};

/**
 * Get partner's rating for a specific profile (for badge display)
 */
export const getPartnerRatings = async (
  coupleProfileId: string,
  targetProfileId: string,
  currentMemberId: string
) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("id, status, member_1_id, member_1_action, member_1_timestamp, member_2_id, member_2_action, member_2_timestamp")
      .eq("profile_id", coupleProfileId)
      .eq("matched_profile_id", targetProfileId)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      return {
        hasRating: false,
        partnerLikedIt: false,
        currentUserLikedIt: false,
        currentUserRejectedIt: false,
        canResurrect: false,
        error: null,
      };
    }

    const isMember1 = data.member_1_id === currentMemberId;
    const isMember2 = data.member_2_id === currentMemberId;
    
    let currentUserAction: MemberAction | null = null;
    let currentUserTimestamp: string | null = null;
    let partnerAction: MemberAction | null = null;
    let partnerTimestamp: string | null = null;
    
    if (isMember1) {
      currentUserAction = data.member_1_action;
      currentUserTimestamp = data.member_1_timestamp;
      partnerAction = data.member_2_action;
      partnerTimestamp = data.member_2_timestamp;
    } else if (isMember2) {
      currentUserAction = data.member_2_action;
      currentUserTimestamp = data.member_2_timestamp;
      partnerAction = data.member_1_action;
      partnerTimestamp = data.member_1_timestamp;
    }

    const partnerLikedIt = partnerAction === "liked";
    const currentUserLikedIt = currentUserAction === "liked";
    const currentUserRejectedIt = currentUserAction === "rejected";
    
    // Can resurrect if: current user rejected it AND partner liked it AND current user acted first
    const currentActedFirst = currentUserTimestamp && partnerTimestamp && 
                              new Date(currentUserTimestamp) < new Date(partnerTimestamp);
    const canResurrect = currentUserRejectedIt && partnerLikedIt && currentActedFirst;

    return {
      hasRating: true,
      status: data.status,
      matchId: data.id,
      partnerLikedIt,
      currentUserLikedIt,
      currentUserRejectedIt,
      partnerRejectedIt: partnerAction === "rejected",
      canResurrect,
      error: null,
    };
  } catch (error) {
    console.error("Error getting partner ratings:", error);
    return {
      hasRating: false,
      partnerLikedIt: false,
      currentUserLikedIt: false,
      currentUserRejectedIt: false,
      canResurrect: false,
      error,
    };
  }
};

/**
 * Get all approved matches (both partners liked)
 */
export const getApprovedMatches = async (coupleProfileId: string) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        matched_profile_id,
        status,
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
      .eq("profile_id", coupleProfileId)
      .eq("status", "both_liked")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching approved matches:", error);
    return { data: [], error };
  }
};

// Keep backward compatibility with old function name
export const getRatedProfileIds = getProfileIdsToHide;