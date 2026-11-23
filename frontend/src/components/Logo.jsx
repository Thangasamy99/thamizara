import { Link } from "react-router-dom";
import { siteConfig } from "../config/siteConfig";

export function LogoMark({ className = "h-10 w-auto" }) {
  return <img src="/logo.png" alt="" className={className} aria-hidden="true" />;
}

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex shrink-0 items-center" aria-label={siteConfig.name}>
      <img
        src="/logo.png"
        alt={siteConfig.name}
        className={
          light
            ? "h-11 w-auto rounded-lg bg-white px-2 py-1"
            : "h-11 w-auto"
        }
      />
    </Link>
  );
}
