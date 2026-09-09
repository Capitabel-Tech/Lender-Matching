"use client";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 overflow-hidden rounded-[32px] border border-[#E2E8F0] bg-white px-8 py-20 text-center shadow-[0_20px_60px_rgba(22,38,77,0.06)] relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(#16264D 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F58220]/[0.08] via-white/50 to-white pointer-events-none"></div>

      <div className="relative flex h-28 w-28 items-center justify-center z-10">
        <span className="absolute inset-0 animate-pulse rounded-full bg-[#F58220]/30 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#F58220] to-[#E06F10] shadow-[0_0_40px_rgba(245,130,32,0.4)] border border-[#FF9B42]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </div>
      </div>

      <h2 className="max-w-2xl text-5xl font-black leading-[1.1] tracking-tighter text-[#16264D] sm:text-[64px] z-10">
        Choose your employment type.
        <br />
        Meet your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F58220] to-[#C2590A] italic pr-2">match.</span>
      </h2>

      <p className="max-w-md text-lg font-medium text-[#5F75A0] z-10">
        &ldquo;Every lender&apos;s rules start there — pick one to see who matches.&rdquo;
      </p>
    </div>
  );
}
