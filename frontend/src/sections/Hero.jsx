import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Button from "../components/Button";
import DashboardMockup from "../components/DashboardMockup";
import { siteConfig } from "../config/siteConfig";

const trustPoints = ["Affordable pricing", "Custom-built software", "Ongoing support"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Decorative grid + soft tint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, #eef2f9 1px, transparent 1px), linear-gradient(to bottom, #eef2f9 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="container-x relative grid items-center gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-2 lg:gap-10 lg:pb-24 lg:pt-20">
        {/* Copy */}
        <div className="max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold text-ink-700 shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            {siteConfig.name} — {siteConfig.tagline}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-display mt-6 font-heading font-bold text-ink-900"
          >
            Turning Business Ideas Into{" "}
            <span className="relative whitespace-nowrap text-brand-600">
              Powerful
              <svg
                className="absolute -bottom-1.5 left-0 w-full"
                viewBox="0 0 120 8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6C30 2 70 2 118 5"
                  stroke="#3978F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            Digital Solutions.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base leading-relaxed text-ink-500 sm:text-lg"
          >
            We help businesses, shops, colleges and organisations simplify their
            operations with affordable, reliable and modern software solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Button to="/request-quotation" size="lg" className="w-full sm:w-auto">
              Start Your Project
              <ArrowRight size={18} />
            </Button>
            <Button to="/portfolio" variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Our Work
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5"
          >
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm font-medium text-ink-500">
                <CheckCircle2 size={17} className="text-accent-500" />
                {point}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Product showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative"
        >
          <div className="rounded-3xl bg-brand-100/60 p-3 sm:p-5 lg:p-6">
            <DashboardMockup variant="business" />
          </div>

          {/* Overlapping analytics card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -bottom-6 -left-2 w-44 rounded-2xl border border-line bg-white p-4 shadow-xl shadow-ink-900/10 sm:-left-6 sm:w-52"
            aria-hidden="true"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Monthly Revenue
            </p>
            <p className="mt-1 font-heading text-xl font-bold text-ink-900 sm:text-2xl">
              $8,420
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-bold text-accent-600">
                +18.2%
              </span>
              <span className="text-[10px] text-ink-400">vs last month</span>
            </div>
            <div className="mt-3 flex h-10 items-end gap-1">
              {["35%", "55%", "40%", "75%", "60%", "90%"].map((h, i) => (
                <div
                  key={i}
                  style={{ height: h }}
                  className={`flex-1 rounded-t ${i === 5 ? "bg-brand-500" : "bg-brand-100"}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Overlapping appointment card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="absolute -top-5 right-0 hidden w-48 rounded-2xl border border-line bg-white p-3.5 shadow-xl shadow-ink-900/10 min-[420px]:block sm:-right-4"
            aria-hidden="true"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                <CheckCircle2 size={16} />
              </span>
              <div>
                <p className="text-[11px] font-bold text-ink-900">Appointment booked</p>
                <p className="text-[10px] text-ink-400">Dr. Chen · 10:30 AM</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
