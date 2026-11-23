import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function PricingCard({ tier, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className={`relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${
        tier.highlighted
          ? "border-brand-600 bg-white shadow-lg shadow-brand-600/15 hover:shadow-brand-600/25"
          : "border-line bg-white hover:border-brand-500/40 hover:shadow-brand-600/10"
      }`}
    >
      {tier.highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
          Most Popular
        </span>
      )}

      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
        tier.highlighted ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-600"
      }`}>
        <tier.icon size={24} strokeWidth={1.8} />
      </div>

      <h3 className="font-heading text-xl font-bold text-ink-900">{tier.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{tier.tagline}</p>

      {/* Quotation model — never a fixed price */}
      <div className="mt-5 rounded-xl bg-brand-50 px-4 py-3">
        <span className="font-heading text-2xl font-bold text-brand-600">Custom Quote</span>
        <p className="mt-0.5 text-xs text-ink-500">Priced after we understand your requirements</p>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {tier.examples.map((example) => (
          <li key={example} className="flex items-start gap-2.5 text-sm text-ink-700">
            <Check size={17} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent-500" />
            {example}
          </li>
        ))}
      </ul>

      <Link
        to={`/request-quotation?tier=${tier.key}`}
        className={`mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
          tier.highlighted
            ? "bg-brand-600 text-white shadow-md shadow-brand-600/25 hover:bg-brand-700"
            : "border border-line bg-white text-ink-900 hover:border-brand-500 hover:text-brand-600"
        }`}
      >
        {tier.cta}
        <ArrowRight size={16} />
      </Link>
    </motion.div>
  );
}
