import { motion } from "framer-motion";
import { Target, Eye, HeartHandshake } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Seo from "../components/Seo";
import About from "../sections/About";
import ContactCTA from "../sections/ContactCTA";
import { siteConfig } from "../config/siteConfig";

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    text: "To make quality software accessible to every business — from the corner shop to the large institution — through practical, affordable technology.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "A digital Africa where every business, student and organisation has the technology they need to grow and compete globally.",
  },
  {
    icon: HeartHandshake,
    title: "Our Values",
    text: "Honest pricing, direct communication, clean engineering and long-term support. We build software the way we would want it built for us.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Us"
        description="THAMIZORA Technologies — Tamil Roots. Global Innovation. A software development company serving Cameroon, Nigeria, Africa and international clients."
        path="/about"
      />
      <PageHeader
        eyebrow="About Us"
        title={siteConfig.tagline}
        description="THAMIZORA Technologies is a software development company serving clients in Cameroon, Nigeria, across Africa and internationally. We build practical technology for businesses of every size."
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="container-x">
          <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-2xl border border-line bg-mist-50 p-7 transition-colors duration-300 hover:border-brand-500/40 hover:bg-brand-50"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
                  <pillar.icon size={22} strokeWidth={1.8} />
                </div>
                <h2 className="font-heading text-lg font-semibold text-ink-900">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {pillar.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <About />
      <ContactCTA />
    </>
  );
}
