import { motion } from "framer-motion";
import {
  Wallet,
  Cpu,
  Puzzle,
  MessagesSquare,
  TrendingUp,
  Headset,
  ArrowRight,
} from "lucide-react";
import Button from "../components/Button";

const reasons = [
  {
    icon: Wallet,
    title: "Affordable by Design",
    description: "Fair pricing built for small businesses and startups — quality software shouldn't only belong to big enterprises.",
  },
  {
    icon: Cpu,
    title: "Modern Technology",
    description: "React.js, Spring Boot and MySQL — proven tools that keep your software fast, secure and reliable.",
  },
  {
    icon: Puzzle,
    title: "Custom-Built, Not Templates",
    description: "Every solution is designed around how your business actually works — not the other way round.",
  },
  {
    icon: MessagesSquare,
    title: "Direct Communication",
    description: "Talk directly with the developers building your product. No middlemen, no confusion.",
  },
  {
    icon: TrendingUp,
    title: "Built to Scale",
    description: "Start small and grow — architecture that expands with your business, without expensive rebuilds.",
  },
  {
    icon: Headset,
    title: "Support That Stays",
    description: "We remain available after launch — updates, fixes and improvements as your needs evolve.",
  },
];

export default function About() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        {/* Left: story */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="max-w-lg"
        >
          <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
            Why Choose Us
          </span>
          <h2 className="text-h2 font-heading font-bold text-ink-900">
            Software That Fits Your Business —{" "}
            <span className="text-brand-600">and Your Budget.</span>
          </h2>
          <p className="mt-5 leading-relaxed text-ink-500">
            Our mission is simple: make quality software accessible to every
            business. We focus on small and growing businesses — shops,
            colleges, hospitals and organisations — that need practical tools,
            not overpriced complexity.
          </p>
          <p className="mt-4 leading-relaxed text-ink-500">
            Our approach is hands-on and honest. We listen first, design around
            your real workflow, then build with modern technology and support
            you long after launch.
          </p>
          <Button to="/about" variant="secondary" className="mt-7">
            More About Us
            <ArrowRight size={16} />
          </Button>
        </motion.div>

        {/* Right: value grid */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-2xl border border-line bg-mist-50 p-5 transition-colors duration-300 hover:border-brand-500/40 hover:bg-brand-50 sm:p-6"
            >
              <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-line">
                <reason.icon size={20} strokeWidth={1.8} />
              </div>
              <h3 className="font-heading text-[15px] font-semibold text-ink-900">
                {reason.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
