import React, { useState } from "react";
import { ArrowLeft, LogOut, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AccountSettingsScreenProps {
  onBack: () => void;
  onLogOut: () => void;
  userId: string;
}

export const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({
  onBack,
  onLogOut,
  userId,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

const handleDeleteAccount = async () => {
  if (deleteConfirmText !== "DELETE") {
    setDeleteError("Please type DELETE to confirm");
    return;
  }

  setIsDeleting(true);
  setDeleteError("");

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      setDeleteError("Authentication required");
      setIsDeleting(false);
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/functions/v1/delete-account`;
    
    console.log("Calling delete-account function at:", url);
    console.log("Token:", token.substring(0, 20) + "...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      const error = await response.json();
      console.log("Error response:", error);
      setDeleteError(error.error || "Error deleting account");
      setIsDeleting(false);
      return;
    }

    const result = await response.json();
    console.log("Success:", result);

    // Success - log out and redirect
    try {
  await supabase.auth.signOut();
} catch (error) {
  console.log("Logout error (expected - user already deleted):", error);
}
    onLogOut();
  } catch (error) {
    console.error("Full error object:", error);
    setDeleteError("An error occurred while deleting your account");
    setIsDeleting(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 to-purple-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-purple-100">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Account Settings</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Account section */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Account Management
          </h2>

          {/* Delete Account */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-700 flex items-center">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Delete Account?
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              This will permanently delete your account and all associated data including:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
              <li>Your profile information</li>
              <li>Your bio and photos</li>
              <li>Partner connections</li>
              <li>All account data</li>
            </ul>
            <p className="text-red-600 font-semibold text-sm mb-4">
              This action cannot be undone.
            </p>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="form-label">
                Type <span className="font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError("");
                }}
                placeholder="Type DELETE"
                className="form-input mt-2"
              />
              {deleteError && (
                <p className="text-red-600 text-sm mt-2">{deleteError}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== "DELETE"}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};