import { motion } from "framer-motion";
import { categories } from "../data/projects";

export default function ProjectFilters({ active, onChange }) {
  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
      role="tablist"
      aria-label="Filter projects by category"
    >
      {categories.map((cat) => {
        const isActive = active === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.key)}
            className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              isActive ? "text-white" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-full bg-brand-600 shadow-md shadow-brand-600/25"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
