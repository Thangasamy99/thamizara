import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Images } from "lucide-react";
import Button from "./Button";
import DashboardMockup from "./DashboardMockup";
import { useEnquiry } from "./enquiryContext";

export default function ProjectHero({ project }) {
  const { open } = useEnquiry();

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
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
            <li>
              <Link to="/portfolio" className="font-medium transition-colors hover:text-brand-600">
                Portfolio
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} className="text-ink-400" />
            </li>
            <li className="font-semibold text-ink-900">{project.title}</li>
          </ol>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
              {project.category}
            </span>
            <h1 className="text-display mt-5 font-heading font-bold text-ink-900">
              {project.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">
              {project.overview}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button size="lg" onClick={() => open(project.title)} className="w-full sm:w-auto">
                Request a Similar Solution
                <ArrowRight size={18} />
              </Button>
              <Button href="#screens" variant="secondary" size="lg" className="w-full sm:w-auto">
                <Images size={18} />
                View Screens
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-3xl border border-line bg-white p-3 shadow-xl shadow-ink-900/5 sm:p-5"
          >
            <div role="img" aria-label={`${project.title} dashboard preview`}>
              <DashboardMockup variant={project.mockup} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
