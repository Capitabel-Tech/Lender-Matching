"use client";

import { useState } from "react";

// Best-effort mapping from our real bank names to each bank's real public
// domain, used only to show their own small site icon next to their name —
// not hosted or redistributed by us, just referenced live from Google's
// favicon service. A handful of these domains are a best guess (some NBFCs
// don't have an obvious single domain) — if one's wrong or a bank's site
// has no favicon, BankLogo below falls back to a generic icon rather than
// a broken image, so a wrong guess here is cosmetic, never a broken UI.
const BANK_DOMAINS: Record<string, string> = {
  "Axis Bank": "axisbank.com",
  "Bajaj Finserv": "bajajfinserv.in",
  "Bajaj Housing Finance Ltd": "bajajhousingfinance.in",
  "Bank Of Baroda": "bankofbaroda.in",
  "Bank Of India": "bankofindia.co.in",
  "Canara Bank": "canarabank.com",
  "Central Bank of India": "centralbankofindia.co.in",
  "Chola Mandelam Ltd": "cholamandalam.com",
  "DCB Bank": "dcbbank.com",
  "Fin Care Financial Services Ltd": "fincarebank.com",
  "HDFC Bank Ltd": "hdfcbank.com",
  "Home First Finance Company India Ltd": "homefirstindia.com",
  "ICICI Bank Ltd": "icicibank.com",
  "Incred Finance Ltd": "incred.com",
  "Indian Overseas Bank": "iob.in",
  "Karur Vysya Bank Ltd": "kvb.co.in",
  "Kotak Mahindra Bank Ltd": "kotak.com",
  "Muthoot Housing Finance Ltd": "muthoothomeloans.com",
  "Piramal Finance Ltd": "piramalfinance.com",
  "Punjab National Bank": "pnbindia.in",
  "Repco Home Finance Limited": "repcohome.com",
  "State Bank Of India": "sbi.co.in",
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
  const domain = BANK_DOMAINS[bankName];
  const [failed, setFailed] = useState(false);

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm"
      style={{ width: size, height: size }}
    >
      {domain && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny external favicon, not worth next/image's config for a 40x40 icon
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-[15%]"
        />
      ) : (
        <GenericBankIcon />
      )}
    </span>
  );
}
