import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Users } from "lucide-react";
import Button from "./Button";
import WhatsAppCTA from "./WhatsAppCTA";

export default function ServiceHero({ service }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-brand-50 py-14 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e5eaf2 1px, transparent 1px), linear-gradient(to bottom, #e5eaf2 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />

      <div className="container-x relative">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
            <li>
              <Link to="/services" className="font-medium transition-colors hover:text-brand-600">
                Services
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} className="text-ink-400" />
            </li>
            <li className="font-semibold text-ink-900">{service.title}</li>
          </ol>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
                <service.icon size={24} strokeWidth={1.8} />
              </span>
              <span className="rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
                Our Services
              </span>
            </div>

            <h1 className="text-display mt-6 font-heading font-bold text-ink-900">
              {service.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">
              {service.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                to={`/request-quotation?service=${service.slug}`}
                size="lg"
                className="w-full sm:w-auto"
              >
                Request Custom Quotation
                <ArrowRight size={18} />
              </Button>
              <WhatsAppCTA
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                message={`Hello THAMIZARA, I'm interested in your ${service.title}. Can we discuss?`}
              >
                Discuss Your Project
              </WhatsAppCTA>
            </div>
          </motion.div>

          {/* Who it's for card */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="rounded-2xl border border-line bg-white p-6 shadow-xl shadow-ink-900/5 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Users size={20} />
              </span>
              <h2 className="font-heading text-base font-semibold text-ink-900">
                Who It's For
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">{service.target}</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-ink-400">
                What's Included
              </p>
              <div className="flex flex-wrap gap-1.5">
                {service.offerings.slice(0, 4).map((o) => (
                  <span key={o} className="rounded-md bg-mist-50 px-2.5 py-1 text-[11px] font-semibold text-ink-700 ring-1 ring-line">
                    {o}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
