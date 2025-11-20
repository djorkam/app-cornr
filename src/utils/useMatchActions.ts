import { useState } from "react";
import {
  recordAction,
  checkResurrection,
  approveMatch,
  MatchStatus,
} from "../services/matchService";

interface UseMatchActionsProps {
  currentUserId: string;
  currentMemberId: string;
  profileId: string;
}

export const useMatchActions = ({
  currentUserId,
  currentMemberId,
  profileId,
}: UseMatchActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: actionError } = await recordAction({
        currentUserId,
        currentMemberId,
        profileId,
        action: "like",
      });

      if (actionError) {
        setError("Failed to like profile");
        throw actionError;
      }

      console.log("Profile liked successfully");
    } catch (err) {
      console.error("Error in handleLike:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: actionError } = await recordAction({
        currentUserId,
        currentMemberId,
        profileId,
        action: "reject",
      });

      if (actionError) {
        setError("Failed to reject profile");
        throw actionError;
      }

      console.log("Profile rejected successfully");
    } catch (err) {
      console.error("Error in handleReject:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const checkCanResurrect = async (
    coupleProfileId: string
  ): Promise<boolean> => {
    try {
      const { canResurrect, error: resurrectionError } =
        await checkResurrection({
          profileId: coupleProfileId,
          matchedProfileId: profileId,
          currentMemberId,
        });

      if (resurrectionError) throw resurrectionError;
      return canResurrect || false;
    } catch (err) {
      console.error("Error checking resurrection:", err);
      return false;
    }
  };

  return {
    handleLike,
    handleReject,
    checkCanResurrect,
    loading,
    error,
  };
};