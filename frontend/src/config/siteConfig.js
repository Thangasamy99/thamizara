/**
 * Central site configuration.
 * Update the values below to change contact details, social links and
 * company information across the whole website.
 */
export const siteConfig = {
  name: "THAMIZORA Technologies",
  shortName: "THAMIZORA",
  tagline: "Tamil Roots. Global Innovation.",
  positioning: "Technology for Every Business. Solutions for Every Idea.",
  description:
    "THAMIZORA Technologies builds affordable custom software, web and mobile applications for small businesses, students, institutions and organisations across Africa and worldwide.",

  contact: {
    // TODO: replace with the real email address before launch.
    email: "info@thamizora.com",
    // TODO: add the WhatsApp number in international format, digits only
    // (e.g. "2376XXXXXXXX" for Cameroon, "234XXXXXXXXXX" for Nigeria).
    whatsappNumber: "",
    region: "Cameroon · Nigeria · Remote Worldwide",
  },

  // Internal admin application URL — footer "Admin Login" link.
  adminUrl: "http://localhost:5174",

  socials: [
    // Add profile URLs to display social icons in the footer.
    // { label: "LinkedIn", url: "https://www.linkedin.com/company/thamizora" },
    // { label: "GitHub", url: "https://github.com/thamizora" },
    // { label: "X", url: "https://x.com/thamizora" },
    // { label: "Instagram", url: "https://instagram.com/thamizora" },
  ],
};

export const mailtoUrl = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
  "Project enquiry — THAMIZORA Technologies",
)}`;

export const whatsappUrl = siteConfig.contact.whatsappNumber
  ? `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(
      "Hello THAMIZORA, I would like to discuss a project.",
    )}`
  : mailtoUrl;
