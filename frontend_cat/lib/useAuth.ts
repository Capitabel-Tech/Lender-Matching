"use client";

// Tracks whether an admin is logged in (via Firebase) and, separately,
// whether they've actually been approved (a "role" custom claim on the
// Firebase account itself — see backend_cat/app/auth.py). Every admin page
// uses this to decide "show the page" vs "send to login" vs "send to the
// waiting-for-approval screen."

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import { auth } from "./firebase";

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

  async function login(email: string, password: string) {
    setError(null);
    if (!auth) {
      setError("Admin login isn't set up for this deployment yet.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Wrong email or password.");
    }
  }

  async function signup(email: string, password: string) {
    setError(null);
    if (!auth) {
      setError("Admin login isn't set up for this deployment yet.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(errorMessageFor(err));
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
    login,
    signup,
    logout,
    getToken,
    refreshStatus,
  };
}

function errorMessageFor(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === "auth/email-already-in-use") return "An account with that email already exists — try logging in instead.";
  if (code === "auth/weak-password") return "Password must be at least 6 characters.";
  if (code === "auth/invalid-email") return "That doesn't look like a valid email.";
  return "Couldn't create the account. Please try again.";
}
