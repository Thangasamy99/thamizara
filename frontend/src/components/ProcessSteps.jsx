import { motion } from "framer-motion";
import { processSteps } from "../data/services";

export default function ProcessSteps() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {processSteps.map((item, index) => (
        <motion.div
          key={item.step}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: index * 0.08 }}
          className="rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-600/10"
        >
          <span className="font-heading text-3xl font-bold text-brand-600/25">
            {item.step}
          </span>
          <h3 className="mt-3 font-heading text-lg font-semibold text-ink-900">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.text}</p>
        </motion.div>
      ))}
    </div>
  );
}
