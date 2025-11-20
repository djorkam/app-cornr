// Registration form types
import { GenderOption } from "../utils/utils";

export type RegisterFormDataType = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  partnerName: string;
  birthdate: string;
  gender: GenderOption;
  customGender: string;
  bio: string;
  photo: File | null;
};