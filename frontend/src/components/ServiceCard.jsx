import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ServiceCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-600/10 sm:p-7"
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
        <Icon size={24} strokeWidth={1.8} />
      </div>
      <h3 className="font-heading text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-500">
        {description}
      </p>
      <Link
        to="/services"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
      >
        Learn More
        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}
