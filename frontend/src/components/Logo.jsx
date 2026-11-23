import { Link } from "react-router-dom";
import { siteConfig } from "../config/siteConfig";

export function LogoMark({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="11" className="fill-brand-600" />
      <path
        d="M13 15h22v6.5h-7.75V35h-6.5V21.5H13V15z"
        className="fill-white"
      />
      <rect x="33" y="31.5" width="4" height="4" rx="1" className="fill-[#8FB3FF]" />
    </svg>
  );
}

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={siteConfig.name}>
      <LogoMark />
      <span
        className={`font-heading text-base font-bold leading-tight tracking-tight sm:text-lg ${
          light ? "text-white" : "text-ink-900"
        }`}
      >
        THAMIZARA
        <span className={`block text-[10px] font-semibold tracking-[0.22em] ${light ? "text-white/60" : "text-brand-600"}`}>
          TECHNOLOGIES
        </span>
      </span>
    </Link>
  );
}
