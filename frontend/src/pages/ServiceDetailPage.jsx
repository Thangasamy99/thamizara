import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Seo from "../components/Seo";
import Button from "../components/Button";
import ServiceHero from "../components/ServiceHero";
import ServiceFAQ from "../components/ServiceFAQ";
import ProcessSteps from "../components/ProcessSteps";
import SectionHeading from "../components/SectionHeading";
import TechnologyBadges from "../components/TechnologyBadges";
import ProjectGrid from "../components/ProjectGrid";
import WhatsAppCTA from "../components/WhatsAppCTA";
import { getService } from "../data/services";
import { getProject } from "../data/projects";

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = getService(slug);

  if (!service) return <Navigate to="/services" replace />;

  const related = (service.relatedProjects ?? [])
    .map((s) => getProject(s))
    .filter(Boolean);

  return (
    <>
      <Seo
        title={`${service.title} — THAMIZORA`}
        description={service.description}
        path={`/services/${service.slug}`}
      />

      <ServiceHero service={service} />

      {/* Business problems */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="The Problem"
            title="Challenges We Solve"
            description={`The everyday problems ${service.shortTitle.toLowerCase()} clients face — and what we build to fix them.`}
          />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:gap-5">
            {service.problems.map((problem, i) => (
              <motion.div
                key={problem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-start gap-3.5 rounded-2xl border border-line bg-white p-5"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                  <AlertCircle size={18} />
                </span>
                <p className="text-sm leading-relaxed text-ink-700">{problem}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features & modules */}
      <section className="bg-mist-50 py-16 lg:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="What You Get"
            title="Features & Solutions"
            description="Modules are tailored to your needs — pick what matters, skip what doesn't."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {service.features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-line bg-white p-5 transition-colors duration-300 hover:border-brand-500/40 hover:bg-brand-50"
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

          {service.note && (
            <p className="mx-auto mt-8 max-w-3xl rounded-xl border border-brand-100 bg-brand-50 px-5 py-4 text-center text-sm text-ink-700">
              {service.note}
            </p>
          )}
        </div>
      </section>

      {/* How we work */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Our Process"
            title="How We Work"
            description="Clear steps from first conversation to launch and beyond."
          />
          <ProcessSteps />
        </div>
      </section>

      {/* Related portfolio projects */}
      {related.length > 0 && (
        <section className="bg-mist-50 py-16 lg:py-20">
          <div className="container-x">
            <SectionHeading
              eyebrow="Proven Work"
              title="Related Projects We've Built"
              description="Applications from our portfolio in this space — explore them to see what we can build for you."
            />
            <ProjectGrid projects={related} />
          </div>
        </section>
      )}

      {/* Tech stack */}
      <section className="border-y border-line bg-white py-14 lg:py-16">
        <div className="container-x flex flex-col items-center gap-6 text-center">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink-900">Technology Stack</h2>
            <p className="mt-2 text-sm text-ink-500">Built with proven, maintainable technology.</p>
          </div>
          <TechnologyBadges technologies={service.tech} />
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Questions"
            title="Frequently Asked Questions"
          />
          <ServiceFAQ faqs={service.faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
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
            Ready to Discuss Your Project?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">
            Tell us what you need and we'll prepare a customised quotation —
            free, honest and with no obligation.
          </p>
          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              to={`/request-quotation?service=${service.slug}`}
              variant="white"
              size="lg"
              className="w-full sm:w-auto"
            >
              Request Custom Quotation
              <ArrowRight size={18} />
            </Button>
            <WhatsAppCTA
              size="lg"
              className="w-full sm:w-auto"
              message={`Hello THAMIZORA, I'm interested in your ${service.title}. Can we discuss?`}
            />
          </div>
        </motion.div>
      </section>
    </>
  );
}
