import { LandingContent } from "@/features/landing/LandingContent";

// Deliberately public — no login wall. A landing page's job is to sell the
// idea to someone who doesn't have an account yet; the actual tool
// (/explore) still requires login. LandingContent's own data fetches
// (real bank count, live rates) already degrade gracefully to defaults for
// a logged-out visitor, since the backend endpoints they call still
// require a token — see features/landing/LandingContent.tsx.
export default function Landing() {
  return <LandingContent />;
}
