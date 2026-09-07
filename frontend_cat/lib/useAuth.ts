"use client";

// Tracks whether an admin is logged in (via a passwordless email link,
// through Firebase) and, separately, whether they've actually been approved
// (a "role" custom claim on the Firebase account itself — see
// backend_cat/app/auth.py). Every admin page uses this to decide "show the
// page" vs "send to login" vs "send to the waiting-for-approval screen."
//
// Email-link sign-in is the only login method on purpose — there's no
// password of ours for anyone to hand off to a coworker, and unlike Google
// Sign-In it works for any email inbox regardless of who hosts it (Google
// Workspace, Microsoft 365, anything) — company email doesn't require a
// Google account behind it. Firebase sends the link itself; clicking it is
// the proof that someone controls that inbox.

import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  type ActionCodeSettings,
  type User,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import { auth } from "./firebase";

export type AdminRole = "admin" | "super_admin";

// Firebase remembers which email a link was requested for so a click on the
// same device/browser can complete sign-in without asking again — but a
// link opened on a different device (e.g. requested on a laptop, clicked
// from a phone's mail app) has nothing to read here, so useAuth falls back
// to asking for the email again (see needsEmailConfirmation below).
const PENDING_EMAIL_KEY = "adminLoginEmail";

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still checking
  // undefined = still checking, null = logged in but not approved yet
  const [role, setRole] = useState<AdminRole | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  // True while a clicked sign-in link is being exchanged for a real login —
  // the login page shows a "Signing you in…" state instead of the form.
  const [completingLink, setCompletingLink] = useState(false);
  // True when a sign-in link was opened on a device/browser that doesn't
  // have the requesting email stored — the login page asks for it again.
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

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

  // Runs once on mount — if the current URL is a sign-in link Firebase just
  // sent (the person clicked it from their email), finish logging them in.
  useEffect(() => {
    if (!auth) return;
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const storedEmail = window.localStorage.getItem(PENDING_EMAIL_KEY);
    if (!storedEmail) {
      setNeedsEmailConfirmation(true);
      return;
    }

    setCompletingLink(true);
    signInWithEmailLink(auth, storedEmail, window.location.href)
      .catch(() => {
        setError("That sign-in link is invalid or has expired — request a new one.");
      })
      .finally(() => {
        window.localStorage.removeItem(PENDING_EMAIL_KEY);
        // Drop the link's one-time-use query params from the URL so a
        // refresh doesn't try (and fail) to redeem it a second time.
        window.history.replaceState(null, "", window.location.pathname);
        setCompletingLink(false);
      });
  }, []);

  function buildActionCodeSettings(): ActionCodeSettings {
    // Points back at this same login page — that's what makes the
    // "clicked the link" check above fire once they land back here.
    return { url: `${window.location.origin}/admin/login`, handleCodeInApp: true };
  }

  async function sendLoginLink(email: string) {
    setError(null);
    if (!auth) {
      setError("Admin login isn't set up for this deployment yet.");
      return false;
    }
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return false;
    }
    try {
      await sendSignInLinkToEmail(auth, trimmed, buildActionCodeSettings());
      window.localStorage.setItem(PENDING_EMAIL_KEY, trimmed);
      return true;
    } catch {
      setError("Couldn't send a sign-in link. Check the email address and try again.");
      return false;
    }
  }

  // The "different device" fallback — completes the same link the mount
  // effect above found, using an email the person re-typed instead of one
  // read from localStorage.
  async function confirmEmailAndCompleteLink(email: string) {
    setError(null);
    if (!auth) return;
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }
    setCompletingLink(true);
    try {
      await signInWithEmailLink(auth, trimmed, window.location.href);
      setNeedsEmailConfirmation(false);
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      setError("That email doesn't match this sign-in link — check it and try again.");
    } finally {
      setCompletingLink(false);
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
    completingLink,
    needsEmailConfirmation,
    sendLoginLink,
    confirmEmailAndCompleteLink,
    logout,
    getToken,
    refreshStatus,
  };
}
