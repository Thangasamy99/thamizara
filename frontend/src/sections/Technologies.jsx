import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading";

const groups = [
  {
    label: "Frontend",
    items: ["React.js", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
  },
  {
    label: "Backend",
    items: ["Java", "Spring Boot", "REST APIs", "Microservices"],
  },
  {
    label: "Database",
    items: ["MySQL"],
  },
  {
    label: "Tools",
    items: ["GitHub", "Postman", "Vercel"],
  },
];

export default function Technologies() {
  return (
    <section className="border-y border-line bg-white py-16 lg:py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our Stack"
          title="Technologies We Work With"
          description="A modern, proven stack that delivers reliable software — without unnecessary complexity."
        />

        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group, gi) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: gi * 0.08 }}
            >
              <h3 className="mb-4 font-heading text-xs font-bold uppercase tracking-[0.18em] text-ink-400">
                {group.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-line bg-mist-50 px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-500/50 hover:bg-brand-100 hover:text-brand-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
