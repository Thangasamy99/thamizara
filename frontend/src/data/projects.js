/**
 * Portfolio project data.
 *
 * NOTE: Descriptions and feature lists below are editable drafts written to
 * represent each application honestly — no client names, metrics or claims.
 * Update them as verified project documentation becomes available.
 */

export const categories = [
  { key: "all", label: "All Projects" },
  { key: "healthcare", label: "Healthcare" },
  { key: "education", label: "Education" },
  { key: "real-estate", label: "Real Estate" },
  { key: "ecommerce", label: "E-Commerce" },
  { key: "community", label: "Community" },
  { key: "hospitality", label: "Hospitality" },
  { key: "accommodation", label: "Accommodation" },
];

const SCREENS = [
  { key: "dashboard", label: "Dashboard Overview" },
  { key: "records", label: "Records Management" },
  { key: "analytics", label: "Reports & Analytics" },
];

const STACK = ["React.js", "Java Spring Boot", "MySQL"];

export const projects = [
  {
    id: "hms",
    slug: "hospital-management",
    title: "Hospital Management System",
    category: "Healthcare",
    filter: "healthcare",
    mockup: "hms",
    featured: true,
    shortDescription:
      "An integrated platform that connects every hospital department — reception, doctors, pharmacy, laboratory and billing — in one system.",
    overview:
      "A hospital management platform designed for clinics and hospitals that want to replace paper registers and disconnected spreadsheets with a single, reliable system covering the whole patient visit.",
    serves: "Hospitals, clinics and healthcare centres",
    problem:
      "Hospitals often manage patients, billing, pharmacy stock and laboratory results across disconnected registers and spreadsheets — slow, error-prone and hard to audit.",
    solution:
      "An integrated healthcare management platform that connects every department of a hospital — from reception to pharmacy — in one secure system.",
    challenges: [
      "Patient records scattered across paper files and registers",
      "Slow billing and manual invoice preparation",
      "No real-time view of pharmacy and laboratory activity",
      "Difficulty tracking appointments, admissions and follow-ups",
    ],
    features: [
      { title: "Patient Management", text: "Registration, medical history, admissions and discharge tracking." },
      { title: "Doctor Management", text: "Doctor profiles, departments, schedules and patient assignments." },
      { title: "Appointments", text: "Booking, scheduling and follow-up management for consultations." },
      { title: "Pharmacy", text: "Medicine stock, prescriptions and dispensing workflows." },
      { title: "Laboratory", text: "Test requests, sample tracking and result reporting." },
      { title: "Billing & Invoicing", text: "Service charges, invoices, payments and receipts." },
      { title: "Inventory", text: "Stock levels, supplies and low-stock visibility." },
      { title: "Reports", text: "Operational and financial reports for hospital administrators." },
    ],
    technologies: STACK,
    screens: SCREENS,
    related: ["eye-hospital-management", "school-management", "hotel-management"],
  },
  {
    id: "eye-hms",
    slug: "eye-hospital-management",
    title: "Eye Hospital Management System",
    category: "Healthcare",
    filter: "healthcare",
    mockup: "eye",
    featured: false,
    shortDescription:
      "A specialised management system for eye hospitals and optical clinics — eye exams, prescriptions, optical shop and patient follow-up.",
    overview:
      "A variant of our hospital platform tailored to ophthalmology workflows: visual acuity tests, refraction records, lens prescriptions and optical dispensing, alongside standard hospital operations.",
    serves: "Eye hospitals, ophthalmology clinics and optical centres",
    problem:
      "Eye-care facilities need specialised records — refraction results, lens prescriptions and optical inventory — that general hospital systems don't handle well.",
    solution:
      "A dedicated eye-hospital system combining specialised eye-exam records and optical shop management with patient, billing and pharmacy workflows.",
    challenges: [
      "Specialised eye-examination data doesn't fit generic record systems",
      "Prescription and lens-order tracking is managed on paper",
      "Optical shop inventory is disconnected from consultations",
      "Patient follow-up visits are hard to schedule and track",
    ],
    features: [
      { title: "Patient Management", text: "Eye-care patient records, history and visit tracking." },
      { title: "Eye Examinations", text: "Visual acuity, refraction and clinical examination records." },
      { title: "Prescriptions", text: "Lens and medicine prescription generation and history." },
      { title: "Optical Shop", text: "Frames, lenses and accessories inventory with sales." },
      { title: "Appointments", text: "Consultation, surgery and follow-up scheduling." },
      { title: "Billing", text: "Consultation, procedure and optical sales invoicing." },
      { title: "Pharmacy", text: "Eye drops and medication stock with dispensing." },
      { title: "Reports", text: "Clinical, sales and operational reporting." },
    ],
    technologies: STACK,
    screens: SCREENS,
    related: ["hospital-management", "school-management", "church-management"],
  },
  {
    id: "sms",
    slug: "school-management",
    title: "School Management System",
    category: "Education",
    filter: "education",
    mockup: "school",
    featured: false,
    shortDescription:
      "A complete school administration platform — students, attendance, examinations, fees and reporting for schools and colleges.",
    overview:
      "A school administration system that digitises academic and financial operations: enrolment, attendance, examinations, fee collection and communication — built for schools and colleges.",
    serves: "Primary & secondary schools, colleges and training institutions",
    problem:
      "Schools manage enrolment, attendance, marks and fees across registers and spreadsheets, making reporting slow and fee tracking unreliable.",
    solution:
      "A centralised platform where administrators, teachers and accountants manage students, academics and fees in one place.",
    challenges: [
      "Student records and results maintained in paper registers",
      "Fee collection and arrears tracked manually",
      "Attendance taking is slow and error-prone",
      "Report cards and term reports take days to compile",
    ],
    features: [
      { title: "Student Management", text: "Enrolment, profiles, class assignment and guardians." },
      { title: "Attendance", text: "Daily class attendance with summaries and alerts." },
      { title: "Examination Management", text: "Marks entry, grading, report cards and transcripts." },
      { title: "Fee Management", text: "Fee structures, payments, receipts and arrears tracking." },
      { title: "Staff Management", text: "Teacher records, subjects and class allocations." },
      { title: "Timetable", text: "Class and examination scheduling." },
      { title: "Reports", text: "Academic, attendance and financial reports." },
      { title: "Portal Access", text: "Role-based access for admins, teachers and accountants." },
    ],
    technologies: STACK,
    screens: SCREENS,
    related: ["hostel-management", "church-management", "hospital-management"],
  },
  {
    id: "pms",
    slug: "property-management",
    title: "Property Management System",
    category: "Real Estate",
    filter: "real-estate",
    mockup: "pms",
    featured: true,
    shortDescription:
      "A property and real-estate management application for landlords and agencies — properties, tenants, payments and reports in one place.",
    overview:
      "A real-estate management platform covering residential and commercial portfolios: property and land records, tenant management, rent collection and maintenance tracking.",
    serves: "Landlords, real-estate agencies and property managers",
    problem:
      "Landlords and agencies tracking properties, tenants and rent payments on paper or spreadsheets lose time and miss collections — especially across multiple buildings.",
    solution:
      "A property and real estate management application for landlords and agencies to manage properties, tenants and payments in one place.",
    challenges: [
      "Tenant and lease information spread across notebooks and files",
      "Rent collections tracked manually with missed or late payments",
      "No single view of occupancy across buildings",
      "Maintenance issues reported informally and easily forgotten",
    ],
    features: [
      { title: "Property Management", text: "Buildings, land, apartments and units with documents." },
      { title: "Tenant Management", text: "Tenant profiles, leases and move-in/move-out records." },
      { title: "Rent & Payments", text: "Rent schedules, payment tracking and receipts." },
      { title: "Hostel Management", text: "Room and bed allocation for hostel-type properties." },
      { title: "Land Management", text: "Plots, titles and land transaction records." },
      { title: "Maintenance", text: "Issue reporting and resolution tracking." },
      { title: "Reports", text: "Occupancy, collection and arrears reports." },
    ],
    technologies: STACK,
    screens: SCREENS,
    related: ["hostel-management", "hotel-management", "ecommerce"],
  },
  {
    id: "ecom",
    slug: "ecommerce",
    title: "E-Commerce Platform",
    category: "Retail & E-Commerce",
    filter: "ecommerce",
    mockup: "shop",
    featured: false,
    shortDescription:
      "An online store and back-office platform for retail businesses — product catalogue, orders, payments and customer management.",
    overview:
      "An e-commerce solution for shops and entrepreneurs selling online: a storefront for customers plus an admin back-office for products, orders, payments and delivery tracking.",
    serves: "Retail shops, wholesalers and online sellers",
    problem:
      "Small retailers selling through WhatsApp and phone calls struggle to track orders, stock and payments — and have no professional storefront.",
    solution:
      "A complete commerce platform: an online storefront for buyers and a management dashboard for the business owner.",
    challenges: [
      "Orders arrive through chats and calls with no central record",
      "Stock levels are unknown until items run out",
      "No professional online presence for the business",
      "Payment and delivery status are hard to track per order",
    ],
    features: [
      { title: "Product Catalogue", text: "Categories, variants, pricing, images and stock levels." },
      { title: "Order Management", text: "Order tracking from placement to delivery." },
      { title: "Shopping Cart & Checkout", text: "Customer cart, checkout and order confirmation." },
      { title: "Payments", text: "Payment recording and transaction tracking." },
      { title: "Customer Management", text: "Customer accounts, addresses and order history." },
      { title: "Inventory", text: "Stock tracking with low-stock alerts." },
      { title: "Discounts & Offers", text: "Promotions and coupon management." },
      { title: "Sales Reports", text: "Revenue, orders and product performance reports." },
    ],
    technologies: STACK,
    screens: SCREENS,
    related: ["property-management", "hotel-management", "church-management"],
  },
  {
    id: "church",
    slug: "church-management",
    title: "Church Management System",
    category: "Community & Religious Organisations",
    filter: "community",
    mockup: "church",
    featured: false,
    shortDescription:
      "A church administration platform — member records, departments, events, donations and attendance for faith communities.",
    overview:
      "A management system for churches and faith-based organisations: membership records, service and event planning, donations and department coordination in one place.",
    serves: "Churches, ministries and faith-based organisations",
    problem:
      "Church administration runs on paper registers — member records, donations and attendance are hard to maintain, report and audit.",
    solution:
      "A central church management platform covering membership, events, giving and group coordination for pastors and administrators.",
    challenges: [
      "Member and family records kept in paper registers",
      "Tithes, offerings and donations tracked manually",
      "Service and event attendance is hard to measure",
      "Departments and groups lack coordinated records",
    ],
    features: [
      { title: "Member Management", text: "Member profiles, families and membership status." },
      { title: "Donations & Tithes", text: "Offerings, tithes and donation records with receipts." },
      { title: "Events & Services", text: "Service schedules, events and attendance tracking." },
      { title: "Departments & Groups", text: "Choir, ushers, cells and group membership." },
      { title: "Attendance", text: "Service and meeting attendance records." },
      { title: "Communications", text: "Announcements and member notifications." },
      { title: "Reports", text: "Membership, giving and attendance reports." },
    ],
    technologies: STACK,
    screens: SCREENS,
    related: ["school-management", "hostel-management", "hospital-management"],
  },
  {
    id: "hotel",
    slug: "hotel-management",
    title: "Hotel Management System",
    category: "Hospitality",
    filter: "hospitality",
    mockup: "hotel",
    featured: false,
    shortDescription:
      "A hotel operations platform — reservations, front desk, housekeeping, billing and guest management for hotels and guest houses.",
    overview:
      "A hotel management system covering the full guest cycle: reservations, check-in/check-out, room allocation, housekeeping status and billing.",
    serves: "Hotels, guest houses, lodges and resorts",
    problem:
      "Hotels managing bookings in diaries and spreadsheets face double bookings, missed check-outs and confusing billing.",
    solution:
      "A single platform connecting reservations, front-desk operations, housekeeping and invoicing.",
    challenges: [
      "Reservations recorded in diaries cause double bookings",
      "Room status is unclear between housekeeping and front desk",
      "Guest folios and bills are calculated manually",
      "No reliable record of occupancy and revenue",
    ],
    features: [
      { title: "Reservations", text: "Booking management with availability calendar." },
      { title: "Front Desk", text: "Check-in, check-out and room allocation." },
      { title: "Room Management", text: "Room types, rates and occupancy status." },
      { title: "Housekeeping", text: "Room cleaning status and task assignment." },
      { title: "Guest Management", text: "Guest profiles, history and preferences." },
      { title: "Billing & Folio", text: "Charges, invoices, payments and receipts." },
      { title: "Reports", text: "Occupancy, revenue and booking reports." },
    ],
    technologies: STACK,
    screens: SCREENS,
    related: ["hostel-management", "property-management", "ecommerce"],
  },
  {
    id: "hostel",
    slug: "hostel-management",
    title: "Hostel Management System",
    category: "Accommodation",
    filter: "accommodation",
    mockup: "hostel",
    featured: false,
    shortDescription:
      "An accommodation management platform for hostels — rooms, beds, occupants, payments and check-in records.",
    overview:
      "A hostel and shared-accommodation system managing rooms, beds and long-stay occupants — built for student hostels, staff quarters and budget accommodation.",
    serves: "Student hostels, staff quarters and budget accommodation providers",
    problem:
      "Hostels tracking rooms, beds and monthly payments on paper lose track of occupancy, arrears and who is staying where.",
    solution:
      "A dedicated system for room and bed allocation, occupant records, payment tracking and occupancy reporting.",
    challenges: [
      "Bed-level occupancy is impossible to see at a glance",
      "Monthly payments and arrears tracked in notebooks",
      "Check-in/check-out records are incomplete",
      "Room allocation changes create confusion",
    ],
    features: [
      { title: "Room & Bed Management", text: "Rooms, beds and allocation with occupancy view." },
      { title: "Occupant Records", text: "Resident profiles, duration and contact details." },
      { title: "Check-in / Check-out", text: "Arrival and departure tracking per occupant." },
      { title: "Payments", text: "Monthly fees, payment records and arrears tracking." },
      { title: "Allocations", text: "Assign and move occupants between rooms and beds." },
      { title: "Reports", text: "Occupancy, revenue and arrears reports." },
    ],
    technologies: STACK,
    screens: SCREENS,
    related: ["hotel-management", "property-management", "school-management"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export const getProject = (slug) => projects.find((p) => p.slug === slug);

export const getRelated = (project) =>
  project.related.map((slug) => getProject(slug)).filter(Boolean);
