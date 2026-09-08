"use client";

// Tracks who's logged in and, separately, what role their account has (a
// custom claim on the Firebase account itself — see backend_cat/app/auth.py).
// Every gated page uses this to decide "show the page" vs "send to /login."
//
// One login method for everyone: plain email + password. Signing up (see
// signUp below) creates the Firebase account and immediately grants the
// "business" role server-side (backend_cat/app/business_api.py) — no
// approval step. A super admin can promote an account to admin/super_admin,
// or demote it back down, from Manage Admins whenever they choose. A
// business account can also ask for that promotion itself via
// requestAdminAccess — still the super admin's call whether to grant it.

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type IdTokenResult,
  type User,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import { completeSignup, requestAdminAccess as requestAdminAccessApi } from "./api/business";
import { errorMessage } from "./api/client";
import { auth } from "./firebase";

export type Role = "business" | "admin" | "super_admin";

// How often a logged-in session quietly re-checks its own role — catches a
// super admin promoting/demoting this account while they're already using
// the site, without needing a live push connection (see ManageAdminsSection
// and the bell icon in the header for the other half of this).
const ROLE_POLL_INTERVAL_MS = 30_000;

interface Profile {
  displayName: string | null;
  orgRole: string | null;
  adminRequested: boolean;
}

function readProfile(result: IdTokenResult): Profile {
  return {
    displayName: (result.claims.display_name as string | undefined) ?? null,
    orgRole: (result.claims.org_role as string | undefined) ?? null,
    adminRequested: (result.claims.admin_requested as boolean | undefined) ?? false,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still checking
  // undefined = still checking, null = logged in but no role assigned (shouldn't normally happen post-signup)
  const [role, setRole] = useState<Role | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile>({ displayName: null, orgRole: null, adminRequested: false });
  const [error, setError] = useState<string | null>(null);
  // Set the moment the 30s poll notices this account's role changed since
  // the last check — the bell icon reads this and clears it via
  // dismissRoleChangeNotice.
  const [roleChangeNotice, setRoleChangeNotice] = useState<{ from: Role | null; to: Role | null } | null>(null);

  const readRole = useCallback(async (u: User, forceRefresh = false) => {
    const result = await u.getIdTokenResult(forceRefresh);
    setRole((result.claims.role as Role | undefined) ?? null);
    setProfile(readProfile(result));
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
        setProfile({ displayName: null, orgRole: null, adminRequested: false });
      }
    });
  }, [readRole]);

  // Quietly re-checks this account's role every 30s while logged in — see
  // ROLE_POLL_INTERVAL_MS above for why polling instead of a live push.
  // Keyed on uid (not `role`) so promoting/demoting doesn't restart the
  // timer; the functional setRole below compares against the previous
  // value atomically without needing `role` in this effect's closure.
  const uid = user?.uid;
  useEffect(() => {
    if (!auth || !uid) return;
    const authInstance = auth;
    const interval = window.setInterval(async () => {
      const current = authInstance.currentUser;
      if (!current) return;
      try {
        const result = await current.getIdTokenResult(true);
        const nextRole = (result.claims.role as Role | undefined) ?? null;
        setProfile(readProfile(result));
        setRole((prevRole) => {
          if (prevRole !== undefined && nextRole !== prevRole) {
            setRoleChangeNotice({ from: prevRole, to: nextRole });
          }
          return nextRole;
        });
      } catch {
        // The session itself is no longer valid (token expired, account
        // deleted/revoked, etc.) — not a "role changed" case, just a dead
        // session. Sign out so onAuthStateChanged resets user/role to null
        // and RequireAuth sends them back to /login, instead of leaving
        // this an unhandled rejection every 30s forever.
        if (auth) void signOut(auth);
      }
    }, ROLE_POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [uid]);

  function dismissRoleChangeNotice() {
    setRoleChangeNotice(null);
  }

  // Plain email + password signup — self-service, immediate access (no
  // approval step). Firebase creates the account first; the role only
  // exists once completeSignup grants it server-side. displayName/orgRole
  // are collected on the signup form and stored as claims alongside role.
  async function signUp(email: string, password: string, displayName: string, orgRole: string) {
    setError(null);
    if (!auth) {
      setError("Login isn't set up for this deployment yet.");
      return false;
    }
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const token = await credential.user.getIdToken();
      await completeSignup(token, displayName, orgRole);
      return true;
    } catch (err) {
      setError(authErrorMessage(err));
      return false;
    }
  }

  async function login(email: string, password: string) {
    setError(null);
    if (!auth) {
      setError("Login isn't set up for this deployment yet.");
      return false;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (err) {
      setError(authErrorMessage(err));
      return false;
    }
  }

  async function logout() {
    if (!auth) return;
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    setError(null);
    if (!auth) {
      setError("Login isn't set up for this deployment yet.");
      return false;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err) {
      setError(authErrorMessage(err));
      return false;
    }
  }

  async function getToken(): Promise<string | null> {
    if (!auth?.currentUser) return null;
    return auth.currentUser.getIdToken();
  }

  // Forces a fresh token so a just-promoted account picks up its new role
  // without needing to log out and back in.
  async function refreshStatus() {
    if (!auth?.currentUser) return;
    await readRole(auth.currentUser, true);
  }

  // Flags this business account as wanting admin access — a super admin
  // sees it on Manage Admins and can approve (promote) or dismiss it.
  async function requestAdminAccess() {
    setError(null);
    if (!auth?.currentUser) return false;
    try {
      const token = await auth.currentUser.getIdToken();
      await requestAdminAccessApi(token);
      await refreshStatus();
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    }
  }

  return {
    user,
    role,
    displayName: profile.displayName,
    orgRole: profile.orgRole,
    adminRequested: profile.adminRequested,
    loading: user === undefined,
    error,
    roleChangeNotice,
    dismissRoleChangeNotice,
    signUp,
    login,
    logout,
    getToken,
    refreshStatus,
    resetPassword,
    requestAdminAccess,
  };
}

function authErrorMessage(err: unknown): string {
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
