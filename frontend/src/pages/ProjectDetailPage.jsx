import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import Seo from "../components/Seo";
import Button from "../components/Button";
import ProjectHero from "../components/ProjectHero";
import ProjectGallery from "../components/ProjectGallery";
import TechnologyBadges from "../components/TechnologyBadges";
import RelatedProjects from "../components/RelatedProjects";
import SectionHeading from "../components/SectionHeading";
import { useEnquiry } from "../components/enquiryContext";
import { getProject } from "../data/projects";
import { whatsappUrl } from "../config/siteConfig";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { open } = useEnquiry();
  const project = getProject(slug);

  if (!project) return <Navigate to="/portfolio" replace />;

  return (
    <>
      <Seo
        title={`${project.title} — ${project.category} Software`}
        description={project.shortDescription}
        path={`/portfolio/${project.slug}`}
      />

      {/* A — Hero */}
      <ProjectHero project={project} />

      {/* B — Overview */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
              Overview
            </span>
            <h2 className="text-h2 font-heading font-bold text-ink-900">
              What This Application Does
            </h2>
            <p className="mt-5 leading-relaxed text-ink-500">{project.overview}</p>
            <p className="mt-4 leading-relaxed text-ink-500">{project.solution}</p>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-fit rounded-2xl border border-line bg-mist-50 p-6 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Building2 size={20} />
              </span>
              <h3 className="font-heading text-base font-semibold text-ink-900">
                Who It's For
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              {project.serves}
            </p>
            <div className="mt-5 border-t border-line pt-5">
              <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-ink-400">
                Technology
              </p>
              <TechnologyBadges technologies={project.technologies} />
            </div>
          </motion.aside>
        </div>
      </section>

      {/* C — Business challenges */}
      <section className="bg-mist-50 py-16 lg:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="The Problem"
            title="Business Challenges It Solves"
            description="The everyday operational problems this application is designed to address."
          />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:gap-5">
            {project.challenges.map((challenge, i) => (
              <motion.div
                key={challenge}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-start gap-3.5 rounded-2xl border border-line bg-white p-5"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                  <AlertCircle size={18} />
                </span>
                <p className="text-sm leading-relaxed text-ink-700">{challenge}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* D — Features */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Capabilities"
            title="Features & Modules"
            description={`The core modules included in the ${project.title}.`}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {project.features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-line p-5 transition-colors duration-300 hover:border-brand-500/40 hover:bg-brand-50"
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600">
                  <CheckCircle2 size={18} />
                </span>
                <h3 className="font-heading text-[15px] font-semibold text-ink-900">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* E — Screenshots */}
      <section id="screens" className="scroll-mt-20 bg-mist-50 py-16 lg:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Screenshots"
            title="Inside the Application"
            description="Key screens from the product. Select any screen to view it enlarged."
          />
          <ProjectGallery project={project} />
        </div>
      </section>

      {/* F — Technology */}
      <section className="border-y border-line bg-white py-14 lg:py-16">
        <div className="container-x flex flex-col items-center gap-6 text-center">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink-900">
              Technology Stack
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              Built with proven, maintainable technology.
            </p>
          </div>
          <TechnologyBadges technologies={project.technologies} />
        </div>
      </section>

      {/* G — Related */}
      <RelatedProjects project={project} />

      {/* H — Enquiry CTA */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center sm:px-12"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[24px] border-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[28px] border-white/5" aria-hidden="true" />

          <h2 className="text-h2 relative mx-auto max-w-xl font-heading font-bold text-white">
            Looking for a Similar Software Solution?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">
            Tell us about your business and we'll design a solution that fits
            your needs — and your budget.
          </p>
          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="white"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => open(project.title)}
            >
              Request a Similar Application
              <ArrowRight size={18} />
            </Button>
            <Button to="/contact" variant="outlineLight" size="lg" className="w-full sm:w-auto">
              Contact Us
            </Button>
            <Button href={whatsappUrl} variant="outlineLight" size="lg" className="w-full sm:w-auto">
              <MessageCircle size={18} />
              WhatsApp Us
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
