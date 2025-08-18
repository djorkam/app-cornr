// utils.ts

export interface UserProfile {
  name: string;
  birthdate: string;
  gender: GenderOption;
  customGender?: string;
  bio: string;
  photo: File | null;
  location: string;
  lookingFor: string;
  interests: string[];
}

export const calculateAge = (birthdate: string): number => {
  if (!birthdate) return 0;
  const birthDate = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// Step 1: Define the accepted gender options
export type GenderOption =
  | "woman"
  | "man"
  | "non-binary"
  | "prefer-not"
  | "other";

// Step 2: Friendly label map
export const genderLabelMap: Record<GenderOption, string> = {
  woman: "Woman",
  man: "Man",
  "non-binary": "Non-binary",
  "prefer-not": "Prefer not to say",
  other: "Other",
};

// Step 3: Gender formatting logic
export const formatGender = (gender: GenderOption, custom?: string): string => {
  return gender === "other" ? custom || "Other" : genderLabelMap[gender] || "—";
};
