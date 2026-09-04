"use client";

import { useState } from "react";

// Real logo images pulled directly from ambak.com's own bank-rate cards
// (static.ambak.com/Bank-fav-icon/*.png) — same source app/scrape_ambak_rates.py
// already scrapes for rates, referenced live rather than downloaded/hosted by
// us. Covers every one of our banks that's actually listed on Ambak's site.
const BANK_LOGO_URLS: Record<string, string> = {
  "Axis Bank": "https://static.ambak.com/Bank-fav-icon/Axis%20Bank.png",
  "Bajaj Finserv": "https://static.ambak.com/Bank-fav-icon/Bajaj.png", // same Bajaj group mark as Bajaj Housing Finance
  "Bajaj Housing Finance Ltd": "https://static.ambak.com/Bank-fav-icon/Bajaj.png",
  "Bank Of Baroda": "https://static.ambak.com/Bank-fav-icon/Bank%20of%20Baroda.png",
  "Bank Of India": "https://static.ambak.com/Bank-fav-icon/BankofIndia%20.png",
  "Canara Bank": "https://static.ambak.com/Bank-fav-icon/CanaraBank.png",
  "Central Bank of India": "https://static.ambak.com/Bank-fav-icon/CentralBankOfIndia.png",
  "HDFC Bank Ltd": "https://static.ambak.com/Bank-fav-icon/HDFC.png",
  "ICICI Bank Ltd": "https://static.ambak.com/Bank-fav-icon/ICICI%20Bank.png",
  "Kotak Mahindra Bank Ltd": "https://static.ambak.com/Bank-fav-icon/Kotak.png",
  "Piramal Finance Ltd": "https://static.ambak.com/Bank-fav-icon/Piramal.png",
  "Punjab National Bank": "https://static.ambak.com/Bank-fav-icon/PNB.png",
  "State Bank Of India": "https://static.ambak.com/Bank-fav-icon/SBI.png",
};

// Fallback for banks not listed on Ambak's site at all (see
// scrape_ambak_rates.py's UNMATCHABLE_BANKS) or not yet matched there —
// each bank's own real domain, shown via its public favicon. A wrong or
// missing guess here just falls through to the generic icon below, never
// a broken image.
const BANK_DOMAINS: Record<string, string> = {
  "Chola Mandelam Ltd": "cholamandalam.com",
  "DCB Bank": "dcbbank.com",
  "Fin Care Financial Services Ltd": "fincarebank.com",
  "Home First Finance Company India Ltd": "homefirstindia.com",
  "Incred Finance Ltd": "incred.com",
  "Indian Overseas Bank": "iob.in",
  "Karur Vysya Bank Ltd": "kvb.co.in",
  "Muthoot Housing Finance Ltd": "muthoothomeloans.com",
  "Repco Home Finance Limited": "repcohome.com",
  "Sundaram finance Ltd": "sundaramfinance.in",
  "Tata Capital Ltd": "tatacapital.com",
};

function GenericBankIcon() {
  return (
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="#0B1520" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 10 9-6 9 6" />
      <path d="M5 10v9M19 10v9M9 10v9M15 10v9" />
      <path d="M3 19h18" />
    </svg>
  );
}

export function BankLogo({ bankName, size = 20 }: { bankName: string; size?: number }) {
  const directUrl = BANK_LOGO_URLS[bankName];
  const domain = BANK_DOMAINS[bankName];
  const src = directUrl ?? (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null);
  const [failed, setFailed] = useState(false);

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm"
      style={{ width: size, height: size }}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny external icon, not worth next/image's config for a 40x40 chip
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-[12%]"
        />
      ) : (
        <GenericBankIcon />
      )}
    </span>
  );
}
