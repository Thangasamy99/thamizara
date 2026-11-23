import {
  Code2,
  Globe,
  Smartphone,
  Workflow,
  GraduationCap,
  Building2,
  Store,
  School,
  HeartPulse,
  Hotel,
  Wrench,
} from "lucide-react";

/** Homepage service cards (Phase 1). */
export const services = [
  {
    icon: Code2,
    title: "Custom Software Development",
    description:
      "Tailored software built around your exact business process — billing, inventory, records, reporting and more.",
  },
  {
    icon: Globe,
    title: "Web Application Development",
    description:
      "Fast, secure and responsive web applications built with React.js and Java Spring Boot that work on any device.",
  },
  {
    icon: Smartphone,
    title: "Mobile Application Development",
    description:
      "Practical mobile apps that put your business in your customers' pockets — from idea to Play Store release.",
  },
  {
    icon: Workflow,
    title: "Business Automation",
    description:
      "Replace manual paperwork and spreadsheets with automated workflows that save time and reduce errors.",
  },
  {
    icon: GraduationCap,
    title: "Student Project Mentoring",
    description:
      "Technical guidance for final-year projects — architecture advice, code reviews, debugging help and deployment support.",
  },
  {
    icon: Building2,
    title: "Enterprise Software Solutions",
    description:
      "Scalable management systems and ERP solutions for institutions, hospitals and growing organisations.",
  },
];

/**
 * The six service categories offered to clients.
 * Each maps to a /services/:slug detail page and a quotation category.
 */
export const serviceCategories = [
  {
    slug: "small-business",
    icon: Store,
    title: "Small Business Solutions",
    shortTitle: "Small Business",
    description:
      "Practical, affordable software for retail shops, small businesses, supermarkets and startups — tools that replace notebooks and spreadsheets.",
    target:
      "Retail shops, small businesses, supermarkets, pharmacies and startup founders in Cameroon and Nigeria.",
    offerings: [
      "Point of Sale systems",
      "Inventory management",
      "Billing and invoicing",
      "Sales and expense tracking",
      "Business websites",
      "Customer management",
    ],
    problems: [
      "Sales and expenses recorded in notebooks — nothing is searchable or auditable",
      "Stock runs out unexpectedly because inventory isn't tracked",
      "Creating invoices and receipts manually wastes time every day",
      "No online presence, so customers can't find or contact the business",
    ],
    features: [
      { title: "Point of Sale", text: "Fast checkout, receipts and daily sales records." },
      { title: "Inventory Management", text: "Stock levels, categories and low-stock alerts." },
      { title: "Billing & Invoicing", text: "Professional invoices, receipts and payment tracking." },
      { title: "Sales Reports", text: "Daily, weekly and monthly sales and expense reports." },
      { title: "Business Website", text: "A professional website that brings customers to you." },
      { title: "Customer Records", text: "Customer contacts, history and outstanding balances." },
    ],
    relatedProjects: ["ecommerce", "property-management", "hotel-management"],
    faqs: [
      {
        q: "I have a very small shop — is software worth it for me?",
        a: "Yes. We build right-sized tools for small businesses — a simple POS or inventory tool costs far less than an enterprise system and pays for itself in saved time and fewer errors.",
      },
      {
        q: "Can the software work without constant internet?",
        a: "We can design offline-friendly features where needed and sync when a connection is available. Tell us about your connectivity situation during the quotation discussion.",
      },
      {
        q: "How much would a POS system cost?",
        a: "It depends on the features you need — number of users, inventory size, reporting and integrations. Request a free quotation and we'll give you an honest figure for your scope.",
      },
    ],
    tech: ["React.js", "Java Spring Boot", "MySQL"],
  },
  {
    slug: "student-projects",
    icon: GraduationCap,
    title: "Student Project Services",
    shortTitle: "Student Project",
    description:
      "Mentoring and technical guidance for college and university students building academic software projects — you build it, we guide you.",
    target:
      "College and university students working on final-year projects, internships or personal software projects.",
    offerings: [
      "Software project consultation",
      "Project planning and architecture",
      "React.js mentoring",
      "Java Spring Boot mentoring",
      "Database design guidance",
      "Debugging assistance",
      "Deployment guidance",
      "Technical documentation guidance",
    ],
    problems: [
      "You have a project topic but don't know how to structure the application",
      "You're stuck on a bug or error and losing days of progress",
      "You've built something but can't deploy or present it properly",
      "You need to understand your own code well enough to defend it",
    ],
    features: [
      { title: "Project Consultation", text: "Clarify your topic, scope and what examiners expect." },
      { title: "Architecture Guidance", text: "Plan your frontend, backend and database the right way." },
      { title: "React.js Mentoring", text: "Learn component design, routing and state management." },
      { title: "Spring Boot Mentoring", text: "REST APIs, services, repositories and security basics." },
      { title: "Debugging Support", text: "We help you find and fix errors — and understand why." },
      { title: "Deployment Guidance", text: "Get your project running on Vercel or a live server." },
      { title: "Documentation Help", text: "Structure your report, diagrams and technical writing." },
      { title: "Defence Preparation", text: "Understand your project deeply enough to answer questions." },
    ],
    note: "Our student services are mentoring and guidance — we help you learn and build your own project. We do not complete academic assignments on behalf of students.",
    relatedProjects: [],
    faqs: [
      {
        q: "Will you build my final-year project for me?",
        a: "No — and honestly, that's in your interest. We mentor you to build it yourself so you can defend it confidently. You'll understand every part of your project because you built it.",
      },
      {
        q: "I'm a complete beginner. Can you still help?",
        a: "Yes. We adjust mentoring to your level — from setting up your first React app to advanced Spring Boot architecture.",
      },
      {
        q: "How does mentoring pricing work?",
        a: "It depends on the scope — a single debugging session differs from full project mentoring. Request a quotation describing your project and where you're stuck.",
      },
    ],
    tech: ["React.js", "Java Spring Boot", "MySQL", "GitHub", "Vercel"],
  },
  {
    slug: "education",
    icon: School,
    title: "Education Solutions",
    shortTitle: "Education",
    description:
      "Management systems for schools, colleges and educational institutions — students, attendance, examinations, fees and reporting in one place.",
    target:
      "Primary and secondary schools, colleges, vocational institutions and training centres.",
    offerings: [
      "Student management",
      "Admission management",
      "Attendance",
      "Fee management",
      "Examination management",
      "Results and reporting",
      "Staff management",
    ],
    problems: [
      "Student records and results live in paper registers that are slow and risky",
      "Fee collection and arrears are tracked manually — money slips through",
      "Compiling report cards takes teachers days at the end of every term",
      "Administrators have no quick view of attendance, enrolment or finances",
    ],
    features: [
      { title: "Student Management", text: "Enrolment, profiles, classes and guardian records." },
      { title: "Admissions", text: "Applicant tracking from enquiry to enrolment." },
      { title: "Attendance", text: "Daily attendance with summaries for staff and parents." },
      { title: "Fee Management", text: "Fee structures, payments, receipts and arrears tracking." },
      { title: "Examinations", text: "Marks entry, grading, report cards and transcripts." },
      { title: "Staff Management", text: "Teacher records, subjects and class allocations." },
      { title: "Reports", text: "Academic, attendance and financial reporting." },
      { title: "Role-Based Access", text: "Separate logins for admins, teachers and accountants." },
    ],
    relatedProjects: ["school-management", "hostel-management", "church-management"],
    faqs: [
      {
        q: "Can the system match our school's grading structure?",
        a: "Yes — sequences, terms, subjects and grading scales are configured to your institution during setup, not hardcoded.",
      },
      {
        q: "Do teachers and accountants get different access?",
        a: "Yes. Role-based permissions mean each staff member sees only what their job requires.",
      },
      {
        q: "What does a school management system cost?",
        a: "It depends on student numbers, modules and whether you need a website too. Request a quotation — schools often start with core modules and add more later.",
      },
    ],
    tech: ["React.js", "Java Spring Boot", "MySQL"],
  },
  {
    slug: "healthcare",
    icon: HeartPulse,
    title: "Healthcare Solutions",
    shortTitle: "Healthcare",
    description:
      "Management systems for hospitals, clinics and eye hospitals — patients, pharmacy, laboratory, billing and appointments integrated in one platform.",
    target:
      "Hospitals, clinics, eye hospitals, dental practices and healthcare centres.",
    offerings: [
      "Hospital Management Systems",
      "Eye Hospital Management Systems",
      "Patient management",
      "Pharmacy management",
      "Laboratory management",
      "Billing",
      "Inventory",
      "Appointments",
    ],
    problems: [
      "Patient files are scattered across registers — retrieval is slow and risky",
      "Billing is manual, inconsistent and hard to audit",
      "Pharmacy stock and laboratory results aren't connected to consultations",
      "Appointments and follow-ups are managed by memory and notebooks",
    ],
    features: [
      { title: "Patient Management", text: "Registration, history, admissions and visits." },
      { title: "Appointments", text: "Consultation, procedure and follow-up scheduling." },
      { title: "Pharmacy", text: "Medicine stock, prescriptions and dispensing." },
      { title: "Laboratory", text: "Test requests, samples and result reporting." },
      { title: "Billing", text: "Service charges, invoices, payments and receipts." },
      { title: "Specialised Workflows", text: "Eye exams, optical shop and other department needs." },
      { title: "Inventory", text: "Medical supplies and low-stock visibility." },
      { title: "Reports", text: "Clinical, financial and operational reporting." },
    ],
    relatedProjects: ["hospital-management", "eye-hospital-management"],
    faqs: [
      {
        q: "Can you adapt the system to our hospital's departments?",
        a: "Yes — modules are configured around your departments and workflows. Our eye-hospital variant shows how we specialise for different facilities.",
      },
      {
        q: "Is patient data secure?",
        a: "We build with authentication, role-based access and proper data practices. Security requirements are discussed during the quotation process.",
      },
      {
        q: "What does a hospital management system cost?",
        a: "Hospital systems vary widely — departments, modules and user count all matter. Request a quotation and we'll scope it honestly with your team.",
      },
    ],
    tech: ["React.js", "Java Spring Boot", "MySQL"],
  },
  {
    slug: "property-hospitality",
    icon: Hotel,
    title: "Property & Hospitality Solutions",
    shortTitle: "Property & Hospitality",
    description:
      "Management software for property owners, landlords, apartments, hotels and hostels — tenants, reservations, payments and occupancy in one system.",
    target:
      "Property owners, landlords, real-estate agencies, apartment managers, hotels, guest houses and hostels.",
    offerings: [
      "Property management",
      "Land management",
      "Apartment management",
      "Tenant management",
      "Hotel management",
      "Hostel management",
      "Reservations",
      "Payment tracking",
    ],
    problems: [
      "Tenant, lease and payment records live in notebooks and loose files",
      "Rent arrears slip by because nobody tracks due dates centrally",
      "Hotel bookings in diaries cause double bookings and billing confusion",
      "No clear view of occupancy across rooms, beds or buildings",
    ],
    features: [
      { title: "Property Management", text: "Buildings, land, apartments and unit records." },
      { title: "Tenant Management", text: "Leases, tenant profiles and move-in/out tracking." },
      { title: "Reservations", text: "Hotel bookings with availability and check-in/out." },
      { title: "Hostel Management", text: "Room and bed allocation for shared accommodation." },
      { title: "Payment Tracking", text: "Rent, fees and payment records with arrears view." },
      { title: "Occupancy Reports", text: "Occupancy, revenue and collection reporting." },
    ],
    relatedProjects: ["property-management", "hotel-management", "hostel-management"],
    faqs: [
      {
        q: "We manage properties in different cities — can one system handle that?",
        a: "Yes. The system is designed for multiple properties and locations, with a single dashboard across your whole portfolio.",
      },
      {
        q: "Can tenants or guests pay online?",
        a: "Payment recording is built in; online payment integration can be discussed and scoped as part of your quotation.",
      },
      {
        q: "What does property management software cost?",
        a: "Scope varies — a landlord with 10 units needs something different from a hotel group. Request a quotation and tell us your portfolio size.",
      },
    ],
    tech: ["React.js", "Java Spring Boot", "MySQL"],
  },
  {
    slug: "custom-software",
    icon: Wrench,
    title: "Custom Software Development",
    shortTitle: "Custom Software",
    description:
      "Fully custom applications for entrepreneurs, businesses and organisations — e-commerce, church management, ERP, automation and APIs built around your process.",
    target:
      "Entrepreneurs, businesses, churches, NGOs and international organisations with unique requirements.",
    offerings: [
      "E-commerce platforms",
      "Church management",
      "ERP applications",
      "Business automation",
      "Custom web applications",
      "API development",
      "Application maintenance",
    ],
    problems: [
      "Off-the-shelf software doesn't match how your business actually works",
      "Your team wastes hours on manual, repetitive workflows",
      "Your systems don't talk to each other — data is re-entered everywhere",
      "You have an idea but no technical partner to build it properly",
    ],
    features: [
      { title: "Custom Web Applications", text: "Software designed around your exact workflow." },
      { title: "E-Commerce Platforms", text: "Storefronts, catalogues, orders and payments." },
      { title: "Church Management", text: "Members, events, donations and communications." },
      { title: "ERP Applications", text: "Integrated modules for complex organisations." },
      { title: "Business Automation", text: "Automate repetitive tasks, approvals and reporting." },
      { title: "API Development", text: "REST APIs that connect your systems together." },
      { title: "Maintenance", text: "Ongoing updates, fixes and improvements after launch." },
      { title: "Microservices", text: "Scalable architecture for larger applications." },
    ],
    relatedProjects: ["ecommerce", "church-management", "hospital-management"],
    faqs: [
      {
        q: "Can you take over or improve our existing software?",
        a: "Often, yes. Share access details and we'll review the codebase honestly — sometimes extending is right, sometimes a rebuild is cheaper long-term.",
      },
      {
        q: "We only have a rough idea — is that enough to start?",
        a: "Yes. The quotation process starts from a conversation, not a specification document. We help you shape the idea into a concrete scope.",
      },
      {
        q: "What does custom software cost?",
        a: "Every project is quoted individually based on scope and complexity — that's why we ask about your requirements first. Request a quotation to start the conversation.",
      },
    ],
    tech: ["React.js", "Java Spring Boot", "MySQL", "REST APIs", "Microservices"],
  },
];

/** Shared "How we work" process. */
export const processSteps = [
  { step: "01", title: "Discuss", text: "Tell us your idea or business problem. We listen and ask the right questions." },
  { step: "02", title: "Design", text: "We plan the architecture and design a solution that fits your needs and budget." },
  { step: "03", title: "Develop", text: "We build your application in stages, keeping you updated at every step." },
  { step: "04", title: "Deploy & Support", text: "We launch your software and stay available for support and improvements." },
];

export const getService = (slug) =>
  serviceCategories.find((s) => s.slug === slug);
