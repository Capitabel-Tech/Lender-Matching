// Sets up the connection to Firebase for logging in. Only handles login itself —
// once logged in, every actual admin action (adding a bank, editing a rate) still
// goes through our own backend, which separately checks the login is real before
// allowing anything (see backend/app/auth.py).

import { initializeApp, getApps, getApp } from "firebase/app";
import { browserLocalPersistence, getAuth, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase config is optional — if it's not set (e.g. admin login isn't set up
// yet for this deployment), skip initializing rather than crashing the build.
const isConfigured = Boolean(firebaseConfig.apiKey);

// Next.js can re-run this module during development (hot reload) — reuse the
// existing app instead of re-initializing, which Firebase otherwise rejects.
const app = isConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

// Explicitly browserLocalPersistence (localStorage) instead of Firebase's
// default indexedDBLocalPersistence. The default's IndexedDB connection
// doesn't survive Next.js dev-mode hot reloads cleanly — every Fast Refresh
// tears down and rebuilds the auth listener, and the old IndexedDB
// connection closing mid-flight is exactly the recurring "Uncaught Error:
// Database is closing/hidden" seen in dev. localStorage has no connection
// to close, so there's nothing to race — same persistence behavior (stays
// logged in across reloads/restarts until sign-out), just a different,
// simpler storage mechanism under the hood.
//
// initializeAuth (unlike getAuth) throws if called twice for the same app,
// which Fast Refresh re-running this module would do — fall back to
// getAuth, which returns the already-initialized instance instead.
export const auth = app
  ? (() => {
      try {
        return initializeAuth(app, { persistence: browserLocalPersistence });
      } catch {
        return getAuth(app);
      }
    })()
  : null;
