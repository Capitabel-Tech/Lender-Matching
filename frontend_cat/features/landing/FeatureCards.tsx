import { JetBrains_Mono } from "next/font/google";

const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"] });

function TaxonomyIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v4M12 10H6m0 0v3m0-3h0M12 10h6m0 0v3" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
    </svg>
  );
}

function IntersectionIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="7" />
      <circle cx="15" cy="12" r="7" />
    </svg>
  );
}

function FacetIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16l-6 8v5l-4 2v-7L4 5Z" />
      <path d="M20 3v4M22 5h-4" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

// Small hierarchical tree — category_options branching into real groups,
// loaded live rather than hardcoded. See explore.py's load_category_values
// and load_property_type_groups.
function TaxonomyDiagram() {
  return (
    <svg viewBox="0 0 260 100" className="h-24 w-full">
      <rect x="4" y="6" width="112" height="22" rx="5" className="fill-[#F58220]/10 stroke-[#F58220]/40" strokeWidth="1" />
      <text x="60" y="21" textAnchor="middle" className={`${mono.className} fill-[#C2590A] text-[9px] font-bold`}>
        category_options
      </text>
      <path d="M60 28 V42 M60 42 H30 M60 42 H90 M60 42 H150" stroke="rgba(245,130,32,0.3)" strokeWidth="1" fill="none" />
      {[
        { x: 30, label: "employment_type" },
        { x: 90, label: "property_type" },
        { x: 150, label: "…" },
      ].map((n) => (
        <g key={n.label}>
          <rect x={n.x - 26} y="42" width="52" height="18" rx="4" className="fill-brand-50 stroke-brand-200" strokeWidth="1" />
          <text x={n.x} y="54" textAnchor="middle" className={`${mono.className} fill-brand-500 text-[7px]`}>
            {n.label}
          </text>
        </g>
      ))}
      <path d="M90 60 V70 M90 70 H60 M90 70 H120 M90 70 H160 M90 70 H200" stroke="rgba(245,130,32,0.2)" strokeWidth="1" fill="none" />
      {["Residential", "Commercial", "Industrial", "Res. cum Comm."].map((label, i) => (
        <g key={label}>
          <rect x={40 + i * 40} y="72" width="36" height="16" rx="8" className="fill-[#101D3D] stroke-[#F58220]/30" strokeWidth="1" />
          <text x={58 + i * 40} y="83" textAnchor="middle" className="fill-[#FFFFFF] text-[6px] font-semibold">
            {label.split(" ")[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}

// Venn diagram — OR within a category (union inside one circle), AND across
// categories (only the overlap survives). See explore.py's matches(): each
// category's accepted-set is intersected with the borrower's picks.
function IntersectionDiagram() {
  return (
    <svg viewBox="0 0 260 100" className="h-24 w-full">
      <circle cx="100" cy="50" r="38" className="fill-[#F7A755]/10 stroke-[#F7A755]/40" strokeWidth="1.5" />
      <circle cx="150" cy="50" r="38" className="fill-[#F58220]/10 stroke-[#F58220]/40" strokeWidth="1.5" />
      <text x="72" y="30" className="fill-brand-500 text-[7px] font-semibold">
        Your filters
      </text>
      <text x="168" y="30" className="fill-brand-500 text-[7px] font-semibold" textAnchor="end">
        Bank accepts
      </text>
      <text x="125" y="54" textAnchor="middle" className={`${mono.className} fill-[#16264D] text-[11px] font-bold`}>
        ∩
      </text>
      <text x="125" y="80" textAnchor="middle" className="fill-success-500 text-[7px] font-bold">
        eligible
      </text>
    </svg>
  );
}

// Facet counts recomputing live — real numbers, see the values checked
// against explore_api.py's facet_counts for "Salaried" selected.
function FacetDiagram() {
  const rows = [
    { label: "Res. — Apartment", before: 78, after: 24 },
    { label: "Res. — Vacant Land", before: 78, after: 24 },
    { label: "Comm. — Indep. Bldg", before: 22, after: 8 },
  ];
  return (
    <svg viewBox="0 0 260 100" className="h-24 w-full">
      {rows.map((r, i) => {
        const y = 10 + i * 30;
        const fullW = 130;
        const afterW = (r.after / r.before) * fullW;
        return (
          <g key={r.label}>
            <text x="0" y={y - 2} className="fill-brand-500 text-[7px]">
              {r.label}
            </text>
            <rect x="0" y={y} width={fullW} height="8" rx="4" className="fill-brand-50" />
            <rect x="0" y={y} width={afterW} height="8" rx="4" className="fill-[#F58220]" />
            <text x={fullW + 6} y={y + 7} className={`${mono.className} fill-[#C2590A] text-[7px] font-bold`}>
              {r.after}/{r.before}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Income -> FOIR% -> Max EMI -> Max Loan Amount, the same pipeline
// AffordabilityPanel runs per bank on the Explore page.
function AffordabilityDiagram() {
  const steps = ["Income", "FOIR %", "Max EMI", "Max Loan"];
  return (
    <svg viewBox="0 0 260 60" className="h-16 w-full">
      {steps.map((label, i) => (
        <g key={label}>
          <rect x={4 + i * 65} y="18" width="54" height="24" rx="6" className="fill-brand-50 stroke-[#F58220]/30" strokeWidth="1" />
          <text x={31 + i * 65} y="33" textAnchor="middle" className={`${mono.className} fill-[#16264D] text-[7px] font-bold`}>
            {label}
          </text>
          {i < steps.length - 1 && (
            <path d={`M${60 + i * 65} 30 H${68 + i * 65}`} stroke="#E06F10" strokeWidth="1.5" markerEnd="url(#arrow)" />
          )}
        </g>
      ))}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill="#E06F10" />
        </marker>
      </defs>
    </svg>
  );
}

const CARDS = [
  {
    Icon: TaxonomyIcon,
    step: "1",
    title: "Data-Driven Taxonomy Loading",
    body: "No hardcoded rules. On every load, the engine queries the live category_options table and builds the entire filter structure — including grouped hierarchies like Property Type — in real time, so a new banking criterion never needs a code change.",
    Diagram: TaxonomyDiagram,
  },
  {
    Icon: IntersectionIcon,
    step: "2",
    title: "Multi-Dimensional Eligibility Intersection",
    body: "Filtering is a real set intersection, not a keyword search: OR within one category (Salaried or Pensioner), AND strictly across categories — a lender is eliminated the instant its accepted set fails to overlap with your picks.",
    Diagram: IntersectionDiagram,
  },
  {
    Icon: FacetIcon,
    step: "3",
    title: "Predictive Facet Engine — Zero Dead-Ends",
    body: "Every click re-simulates every other unselected filter, recomputing how many banks would still match each option — so the sidebar only ever offers choices that lead somewhere, never a 0-result dead end.",
    Diagram: FacetDiagram,
  },
  {
    Icon: CalculatorIcon,
    step: "4",
    title: "Dynamic FOIR & Affordability Computation",
    body: "Real financial modeling per bank: your FOIR checked against its limit, Max Tenure capped by years to retirement, then a present-value annuity formula turns your EMI budget into an exact Max Loan Amount at that bank's live rate.",
    Diagram: AffordabilityDiagram,
  },
] as const;

export function FeatureCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {CARDS.map((card) => (
        <div
          key={card.title}
          className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F58220]/10 text-[#C2590A]">
              <card.Icon />
            </span>
            <span className={`${mono.className} text-xs font-bold tracking-wider text-brand-500`}>
              STEP {card.step}
            </span>
          </div>
          <h3 className="text-lg font-bold leading-tight text-[#16264D] sm:text-xl">{card.title}</h3>
          <p className="text-sm leading-relaxed text-brand-500">{card.body}</p>

          <div className="mt-auto border-t border-brand-100 pt-4">
            <card.Diagram />
          </div>
        </div>
      ))}
    </div>
  );
}
