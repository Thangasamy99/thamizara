import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import DashboardMockup from "./DashboardMockup";
import { useEnquiry } from "./enquiryContext";

export default function ProjectCard({ project }) {
  const { open } = useEnquiry();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/10"
    >
      {/* Cover */}
      <Link
        to={`/portfolio/${project.slug}`}
        className="relative block bg-mist-50 p-4 pt-5 sm:p-5 sm:pt-6"
        aria-label={`View ${project.title}`}
      >
        <span className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 shadow-sm ring-1 ring-line backdrop-blur">
          {project.category}
        </span>
        <div className="pointer-events-none aspect-[16/10] overflow-hidden rounded-xl transition-transform duration-500 group-hover:-translate-y-1">
          <DashboardMockup variant={project.mockup} className="shadow-lg" />
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-heading text-lg font-bold leading-snug text-ink-900">
          <Link to={`/portfolio/${project.slug}`} className="transition-colors hover:text-brand-600">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
          {project.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-line pt-5">
          <Link
            to={`/portfolio/${project.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            View Project
            <ArrowRight size={15} />
          </Link>
          <button
            type="button"
            onClick={() => open(project.title)}
            className="inline-flex items-center rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            Request Similar
          </button>
        </div>
      </div>
    </motion.article>
  );
}
