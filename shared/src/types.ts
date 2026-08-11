// Shared domain types — imported by web (Next.js) and mobile (React Native).

export type Role =
  | "Vidyarthi"      // Student
  | "Acharya"        // Teacher
  | "Palaka"         // Parent
  | "Pradhana Acharya" // Principal
  | "Nyasa"          // Trust / Network
  | "School Admin";

// Login token payload (from the backend JWT).
export interface AuthUser {
  user_id: string | number;
  branch: string;      // which branch DB (BVK1, BVK2, ...)
  school_id?: string;  // which school (absent for Nyasa/trust-level)
  role: Role;
  email?: string;
  name?: string;
}

export interface LoginResult {
  authenticated: boolean;
  access_token?: string;
  token_type?: string;
  role?: Role;
  email?: string;
  user?: AuthUser;
  requiresGoogleAuth?: boolean;
}

// The role → dashboard route map, shared so web and mobile stay consistent.
export const ROLE_HOME: Record<string, string> = {
  "Vidyarthi": "/vidyarthi",
  "Acharya": "/acharya",
  "Palaka": "/palaka",
  "Pradhana Acharya": "/pradhana",
  "Nyasa": "/nyasa",
  "School Admin": "/admin",
};
