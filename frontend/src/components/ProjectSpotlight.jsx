import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import Button from "./Button";
import DashboardMockup from "./DashboardMockup";
import { useEnquiry } from "./enquiryContext";

export default function ProjectSpotlight({ project, reversed = false }) {
  const { open } = useEnquiry();

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
    >
      {/* Visual */}
      <div className={reversed ? "lg:order-2" : ""}>
        <div className="rounded-3xl border border-line bg-mist-50 p-3 sm:p-6 lg:p-8">
          <DashboardMockup variant={project.mockup} />
        </div>
      </div>

      {/* Content */}
      <div className={reversed ? "lg:order-1" : ""}>
        <span className="mb-3 inline-block rounded-full bg-brand-100 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
          {project.category}
        </span>
        <h3 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
          {project.title}
        </h3>

        <div className="mt-4 space-y-3 text-sm leading-relaxed sm:text-[15px]">
          <p className="text-ink-500">
            <span className="font-semibold text-ink-900">The challenge — </span>
            {project.problem}
          </p>
          <p className="text-ink-500">
            <span className="font-semibold text-ink-900">Our solution — </span>
            {project.solution}
          </p>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-400">
            Key Features
          </p>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-2.5 min-[420px]:grid-cols-2">
            {project.features.slice(0, 8).map((f) => (
              <li key={f.title} className="flex items-center gap-2 text-sm font-medium text-ink-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-600">
                  <Check size={12} strokeWidth={3} />
                </span>
                {f.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-ink-400">
            Built With
          </p>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button to={`/portfolio/${project.slug}`} variant="primary" size="sm">
            View Project
            <ArrowRight size={16} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => open(project.title)}>
            Request Similar Solution
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
