"use client";

// Tracks whether an admin is logged in (via Google, through Firebase) and,
// separately, whether they've actually been approved (a "role" custom claim
// on the Firebase account itself — see backend_cat/app/auth.py). Every admin
// page uses this to decide "show the page" vs "send to login" vs "send to
// the waiting-for-approval screen."
//
// Google Sign-In is the only login method on purpose — there's no password
// of ours for anyone to hand off to a coworker; whoever owns that Google
// account (including its own 2FA, if they have it) is who gets in.

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import { auth, googleProvider } from "./firebase";

export type AdminRole = "admin" | "super_admin";

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still checking
  // undefined = still checking, null = logged in but not approved yet
  const [role, setRole] = useState<AdminRole | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const readRole = useCallback(async (u: User, forceRefresh = false) => {
    const result = await u.getIdTokenResult(forceRefresh);
    setRole((result.claims.role as AdminRole | undefined) ?? null);
  }, []);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setRole(null);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        void readRole(u);
      } else {
        setRole(undefined);
      }
    });
  }, [readRole]);

  async function loginWithGoogle() {
    setError(null);
    if (!auth) {
      setError("Admin login isn't set up for this deployment yet.");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      // Not a real error — they just closed the Google popup themselves.
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      if (code === "auth/popup-blocked") {
        setError("Your browser blocked the sign-in popup — allow popups for this site and try again.");
        return;
      }
      setError("Couldn't sign in with Google. Please try again.");
    }
  }

  async function logout() {
    if (!auth) return;
    await signOut(auth);
  }

  async function getToken(): Promise<string | null> {
    if (!auth?.currentUser) return null;
    return auth.currentUser.getIdToken();
  }

  // Forces a fresh token so a just-approved account picks up its new role
  // without needing to log out and back in — used by the "Check again"
  // button on the waiting-for-approval screen.
  async function refreshStatus() {
    if (!auth?.currentUser) return;
    await readRole(auth.currentUser, true);
  }

  return {
    user,
    role,
    loading: user === undefined,
    error,
    loginWithGoogle,
    logout,
    getToken,
    refreshStatus,
  };
}
