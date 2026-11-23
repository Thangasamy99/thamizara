import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, FileText } from "lucide-react";

export default function ServiceCategoryCard({ category, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-600/10 sm:p-7"
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
        <category.icon size={24} strokeWidth={1.8} />
      </div>
      <h3 className="font-heading text-lg font-bold text-ink-900">{category.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{category.description}</p>

      <ul className="mt-4 flex-1 space-y-2 border-t border-line pt-4">
        {category.offerings.slice(0, 5).map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-ink-700">
            <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-brand-500" />
            {item}
          </li>
        ))}
        {category.offerings.length > 5 && (
          <li className="text-[13px] font-medium text-ink-400">
            + {category.offerings.length - 5} more
          </li>
        )}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2.5 border-t border-line pt-5">
        <Link
          to={`/services/${category.slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          View Details
          <ArrowRight size={15} />
        </Link>
        <Link
          to={`/request-quotation?service=${category.slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-600"
        >
          <FileText size={15} />
          Request Quotation
        </Link>
      </div>
    </motion.div>
  );
}
