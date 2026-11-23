import { motion } from "framer-motion";

export default function PageHeader({ eyebrow, title, description }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-brand-50 py-16 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e5eaf2 1px, transparent 1px), linear-gradient(to bottom, #e5eaf2 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />
      <div className="container-x relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          {eyebrow && (
            <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
              {eyebrow}
            </span>
          )}
          <h1 className="text-display font-heading font-bold text-ink-900">
            {title}
          </h1>
          {description && (
            <p className="mt-5 text-lg leading-relaxed text-ink-500">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
