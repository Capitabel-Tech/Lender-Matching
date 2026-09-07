"use client";

// Tracks who's logged in and, separately, what role their account has (a
// custom claim on the Firebase account itself — see backend_cat/app/auth.py).
// Every gated page uses this to decide "show the page" vs "send to login"
// vs "send to the waiting-for-approval screen."
//
// Two deliberately different login methods share this one hook, since they
// share the same Firebase project and the same user/role state:
//   - Admin (business staff): passwordless email-link sign-in (see
//     sendLoginLink/confirmEmailAndCompleteLink below) — no password of
//     ours for anyone to hand off to a coworker, works for any email inbox
//     regardless of who hosts it.
//   - Business (external partner) accounts: plain email + password
//     (signUpBusiness/loginBusiness below) — self-service, immediate
//     access to browse Explore Lenders, no approval step. Only a super
//     admin promoting them (see features/admin/ManageAdminsSection.tsx)
//     grants anything beyond that.

import {
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signOut,
  type ActionCodeSettings,
  type User,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import { completeBusinessSignup } from "./api/business";
import { errorMessage } from "./api/client";
import { auth } from "./firebase";

export type Role = "business" | "admin" | "super_admin";

// Firebase remembers which email a link was requested for so a click on the
// same device/browser can complete sign-in without asking again — but a
// link opened on a different device (e.g. requested on a laptop, clicked
// from a phone's mail app) has nothing to read here, so useAuth falls back
// to asking for the email again (see needsEmailConfirmation below).
const PENDING_EMAIL_KEY = "adminLoginEmail";

// How often a logged-in session quietly re-checks its own role — catches a
// super admin promoting/demoting this account while they're already using
// the site, without needing a live push connection (see ManageAdminsSection
// and the bell icon in the header for the other half of this).
const ROLE_POLL_INTERVAL_MS = 30_000;

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still checking
  // undefined = still checking, null = logged in but not approved/assigned yet
  const [role, setRole] = useState<Role | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  // True while a clicked sign-in link is being exchanged for a real login —
  // the login page shows a "Signing you in…" state instead of the form.
  const [completingLink, setCompletingLink] = useState(false);
  // True when a sign-in link was opened on a device/browser that doesn't
  // have the requesting email stored — the login page asks for it again.
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  // Set the moment the 30s poll notices this account's role changed since
  // the last check — the bell icon reads this and clears it via
  // dismissRoleChangeNotice.
  const [roleChangeNotice, setRoleChangeNotice] = useState<{ from: Role | null; to: Role | null } | null>(null);

  const readRole = useCallback(async (u: User, forceRefresh = false) => {
    const result = await u.getIdTokenResult(forceRefresh);
    setRole((result.claims.role as Role | undefined) ?? null);
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

  // Quietly re-checks this account's role every 30s while logged in — see
  // ROLE_POLL_INTERVAL_MS above for why polling instead of a live push.
  // Keyed on uid (not `role`) so promoting/demoting doesn't restart the
  // timer; the functional setRole below compares against the previous
  // value atomically without needing `role` in this effect's closure.
  const uid = user?.uid;
  useEffect(() => {
    if (!auth || !uid) return;
    const interval = window.setInterval(async () => {
      const current = auth.currentUser;
      if (!current) return;
      const result = await current.getIdTokenResult(true);
      const nextRole = (result.claims.role as Role | undefined) ?? null;
      setRole((prevRole) => {
        if (prevRole !== undefined && nextRole !== prevRole) {
          setRoleChangeNotice({ from: prevRole, to: nextRole });
        }
        return nextRole;
      });
    }, ROLE_POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [uid]);

  function dismissRoleChangeNotice() {
    setRoleChangeNotice(null);
  }

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

  // Business signup — plain email + password, self-service, immediate
  // access (no approval step). Firebase creates the account first; the
  // role only exists once completeBusinessSignup grants it server-side.
  async function signUpBusiness(email: string, password: string) {
    setError(null);
    if (!auth) {
      setError("Login isn't set up for this deployment yet.");
      return false;
    }
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const token = await credential.user.getIdToken();
      await completeBusinessSignup(token);
      await readRole(credential.user, true);
      return true;
    } catch (err) {
      setError(businessAuthErrorMessage(err));
      return false;
    }
  }

  async function loginBusiness(email: string, password: string) {
    setError(null);
    if (!auth) {
      setError("Login isn't set up for this deployment yet.");
      return false;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (err) {
      setError(businessAuthErrorMessage(err));
      return false;
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

  // Forces a fresh token so a just-approved/promoted account picks up its
  // new role without needing to log out and back in — used by the "Check
  // again" button on the waiting-for-approval screen, and by the mount
  // effect that fires right after signUpBusiness.
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
    roleChangeNotice,
    dismissRoleChangeNotice,
    sendLoginLink,
    confirmEmailAndCompleteLink,
    signUpBusiness,
    loginBusiness,
    logout,
    getToken,
    refreshStatus,
  };
}

function businessAuthErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with that email already exists — try logging in instead.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/user-not-found":
      return "No account found with that email — sign up instead.";
    case "auth/too-many-requests":
      return "Too many attempts — wait a bit and try again.";
    default:
      return errorMessage(err) === "Something went wrong. Check the backend is running and try again."
        ? "Something went wrong. Please try again."
        : errorMessage(err);
  }
}
