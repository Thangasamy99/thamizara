/**
 * Options for the quotation request wizard.
 * Budget ranges are configurable per currency — they describe the CLIENT'S
 * budget expectation, not THAMIZARA's prices. All quotes are prepared manually.
 */

export const countries = ["Cameroon", "Nigeria", "Other"];

export const currencies = [
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "USD", name: "US Dollar", symbol: "$" },
];

export const timelines = [
  "As soon as possible",
  "Within one month",
  "Within three months",
  "Flexible",
];

export const budgetRanges = {
  XAF: [
    "Under 100,000 FCFA",
    "100,000 – 300,000 FCFA",
    "300,000 – 800,000 FCFA",
    "Above 800,000 FCFA",
  ],
  NGN: [
    "Under ₦150,000",
    "₦150,000 – ₦500,000",
    "₦500,000 – ₦1,500,000",
    "Above ₦1,500,000",
  ],
  USD: ["Under $200", "$200 – $600", "$600 – $2,000", "Above $2,000"],
};

export const approaches = [
  "New application from scratch",
  "Improve or rebuild existing software",
  "Not sure — I need advice",
];

export const projectTypes = [
  "Management system",
  "Website / web application",
  "Mobile application",
  "E-commerce platform",
  "Student project (mentoring)",
  "Other",
];

/** Maps service slug → the label used in the enquiry + preselect key. */
export const serviceCategoryOptions = [
  { slug: "small-business", label: "Small Business" },
  { slug: "student-projects", label: "Student Project" },
  { slug: "education", label: "Education" },
  { slug: "healthcare", label: "Healthcare" },
  { slug: "property-hospitality", label: "Property & Hospitality" },
  { slug: "custom-software", label: "Custom Software" },
];

/** Maps pricing tier key → label carried into the enquiry. */
export const tierLabels = {
  starter: "Starter Solution",
  business: "Business Solution",
  enterprise: "Enterprise Solution",
};

export const wizardSteps = [
  { id: 1, label: "Your Details" },
  { id: 2, label: "Requirements" },
  { id: 3, label: "Budget & Timeline" },
  { id: 4, label: "Review & Send" },
];
