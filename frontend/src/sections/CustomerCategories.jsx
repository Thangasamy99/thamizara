import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  GraduationCap,
  School,
  HeartPulse,
  Check,
  ArrowRight,
} from "lucide-react";
import SectionHeading from "../components/SectionHeading";

const categories = [
  {
    icon: Store,
    title: "Small Businesses & Shops",
    description: "Affordable tools that put your daily operations on autopilot.",
    items: ["POS software", "Billing systems", "Inventory management", "Sales reporting", "Business websites"],
    to: "/services",
  },
  {
    icon: GraduationCap,
    title: "College Students",
    description: "Guidance that helps you build and understand your own project.",
    items: ["Final-year project mentoring", "Architecture guidance", "React & Spring Boot learning", "Debugging assistance", "Deployment support"],
    to: "/services",
  },
  {
    icon: School,
    title: "Colleges & Institutions",
    description: "Management systems that digitise your entire institution.",
    items: ["Student management", "Attendance systems", "Examination management", "Fee management", "College websites"],
    to: "/services",
  },
  {
    icon: HeartPulse,
    title: "Hospitals & Organisations",
    description: "Systems for hospitals, pharmacies, laboratories and property businesses.",
    items: ["Hospital Management Systems", "Pharmacy management", "Laboratory management", "Property management", "ERP solutions"],
    to: "/services",
  },
];

export default function CustomerCategories() {
  return (
    <section className="bg-mist-50 py-16 lg:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Who We Serve"
          title="Technology for Every Business"
          description="Whether you run a shop, study at college, manage an institution or lead an organisation — we build software that fits your needs and your budget."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-600/10"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
                <category.icon size={24} strokeWidth={1.8} />
              </div>
              <h3 className="font-heading text-lg font-semibold leading-snug text-ink-900">
                {category.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {category.description}
              </p>
              <ul className="mt-4 space-y-2 border-t border-line pt-4">
                {category.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-ink-700">
                    <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-brand-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={category.to}
                className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                Learn More
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
