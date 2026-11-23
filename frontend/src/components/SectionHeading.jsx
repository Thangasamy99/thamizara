import { motion } from "framer-motion";

export default function SectionHeading({ eyebrow, title, description, light = false, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={`mb-12 max-w-2xl lg:mb-16 ${center ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && (
        <span
          className={`mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${
            light ? "bg-white/10 text-white" : "bg-brand-100 text-brand-700"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2 className={`text-h2 font-heading font-bold ${light ? "text-white" : "text-ink-900"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 leading-relaxed ${light ? "text-white/70" : "text-ink-500"}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
