import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ServiceFAQ({ faqs }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-2xl border border-line bg-white">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
            >
              <span className="font-heading text-[15px] font-semibold text-ink-900 sm:text-base">
                {faq.q}
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-ink-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-600" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500 sm:px-6">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
