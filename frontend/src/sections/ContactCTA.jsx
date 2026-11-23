import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "../components/Button";
import WhatsAppCTA from "../components/WhatsAppCTA";

export default function ContactCTA() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center sm:px-12 sm:py-16"
      >
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[24px] border-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[28px] border-white/5" aria-hidden="true" />

        <h2 className="relative text-h2 mx-auto max-w-xl font-heading font-bold text-white">
          Have an Idea? Let's Make It Real.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-white/80">
          Tell us what you need. Let's discuss a practical solution for your
          business or project — your ideas, our technology.
        </p>
        <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/request-quotation" variant="white" size="lg" className="w-full sm:w-auto">
            Start a Project
            <ArrowRight size={18} />
          </Button>
          <WhatsAppCTA size="lg" className="w-full sm:w-auto" />
        </div>
      </motion.div>
    </section>
  );
}
