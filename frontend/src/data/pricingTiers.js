import { Rocket, TrendingUp, Building } from "lucide-react";

/**
 * Service-level pricing presentation.
 * THAMIZORA uses custom quotation pricing — no fixed prices are published.
 */
export const pricingTiers = [
  {
    key: "starter",
    icon: Rocket,
    name: "Starter Solutions",
    tagline: "For small shops, startups, individual entrepreneurs and students seeking mentoring.",
    examples: [
      "Business websites",
      "Basic POS systems",
      "Inventory tools",
      "Project mentoring",
    ],
    cta: "Request Starter Quotation",
  },
  {
    key: "business",
    icon: TrendingUp,
    name: "Business Solutions",
    tagline: "For growing businesses, schools, hotels, property businesses and churches.",
    examples: [
      "Management applications",
      "Business automation",
      "E-commerce systems",
      "Custom business platforms",
    ],
    cta: "Request Business Quotation",
    highlighted: true,
  },
  {
    key: "enterprise",
    icon: Building,
    name: "Enterprise Solutions",
    tagline: "For hospitals, large institutions, multi-branch organisations and complex operations.",
    examples: [
      "Hospital Management Systems",
      "Integrated enterprise applications",
      "Microservices architecture",
      "Complex workflow automation",
    ],
    cta: "Request Enterprise Quotation",
  },
];

/** Factors that influence a project's quotation. */
export const pricingFactors = [
  { title: "Number of Modules", text: "More modules (billing, inventory, reports…) means more development work." },
  { title: "Workflow Complexity", text: "Simple record-keeping differs from multi-step approval processes." },
  { title: "User Roles & Permissions", text: "Different access levels for admins, staff and customers." },
  { title: "Integrations", text: "Payment gateways, SMS, external APIs and third-party services." },
  { title: "Data Migration", text: "Moving existing records from paper or old systems into the new one." },
  { title: "Deployment Requirements", text: "Cloud hosting, local installation or offline-capable setups." },
  { title: "Maintenance & Support", text: "Ongoing updates, training and technical support after launch." },
];

export const pricingFaqs = [
  {
    q: "How much does custom software development cost?",
    a: "There is no single fixed price — cost depends on your modules, workflows, users and integrations. That's why every project gets a free, customised quotation after we understand your requirements.",
  },
  {
    q: "Do you work with small businesses?",
    a: "Absolutely — small shops and startups are our core clients. We design right-sized solutions that fit small budgets instead of selling enterprise packages you don't need.",
  },
  {
    q: "Do you provide software for Nigerian clients?",
    a: "Yes. We work with clients in Nigeria and prepare quotations in Naira (NGN). Everything is handled remotely with clear communication throughout.",
  },
  {
    q: "Can I request a customised application?",
    a: "That's exactly what we do. Describe your idea or business problem in the quotation form — even a rough idea is enough to start the conversation.",
  },
  {
    q: "Do you provide student project mentoring?",
    a: "Yes — mentoring, architecture guidance, debugging help and deployment support for student projects. We guide you to build and understand your own work; we don't do assignments for students.",
  },
  {
    q: "Can you develop or improve an existing software system?",
    a: "In many cases yes. We'll review your existing system honestly and recommend whether extending it or rebuilding makes more sense.",
  },
  {
    q: "Do you provide maintenance and support?",
    a: "Yes — we offer ongoing maintenance, updates and technical support after launch. Support terms are defined in your quotation.",
  },
  {
    q: "Which currencies do you accept for quotations?",
    a: "We prepare quotations in XAF (Central African CFA Franc), NGN (Nigerian Naira) or USD — whichever you prefer. You select your preferred currency in the enquiry form.",
  },
  {
    q: "How long does development take?",
    a: "It depends on scope — a business website is weeks, a hospital system is longer. Your quotation includes a realistic timeline estimate for your specific project.",
  },
];
