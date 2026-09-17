"use client";

/**
 * AuthContext — Authentication Provider for VidhyaBharathi
 *
 * Manages login/logout state with localStorage persistence.
 * Enforces multi-tenant isolation by capturing and storing the `school_id`.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginTeacher, logoutTeacher } from "@/lib/api";

const AuthContext = createContext(undefined);

const STORAGE_KEY = "vb_acharya_auth";
const TOKEN_KEY = "vb_acharya_token";
const SCHOOL_KEY = "vb_school_id";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function restoreSession() {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        if (urlToken) {
          localStorage.setItem(TOKEN_KEY, urlToken);
          const clean = window.location.pathname;
          window.history.replaceState({}, "", clean);
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedUser = JSON.parse(stored);
          setUser(parsedUser);
          if (parsedUser.school_id) {
            localStorage.setItem(SCHOOL_KEY, parsedUser.school_id);
          }
          return;
        }

        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const { fetchMe } = await import("@/lib/api");
          const profile = await fetchMe();
          if (profile) {
            setUser(profile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
            if (profile.school_id) {
              localStorage.setItem(SCHOOL_KEY, profile.school_id);
            }
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(SCHOOL_KEY);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginTeacher(email, password);

      if (result.success) {
        setUser(result.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        if (result.user.school_id) {
          localStorage.setItem(SCHOOL_KEY, result.user.school_id);
        }
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = "An unexpected error occurred. Please try again.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutTeacher();
    setUser(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SCHOOL_KEY);
    // Note: logoutTeacher() should internally remove TOKEN_KEY
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}