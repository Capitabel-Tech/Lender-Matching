import { RequireAuth } from "@/features/auth/RequireAuth";
import { LandingContent } from "@/features/landing/LandingContent";

export default function Landing() {
  return (
    <RequireAuth>
      <LandingContent />
    </RequireAuth>
  );
}
