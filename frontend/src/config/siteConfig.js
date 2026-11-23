/**
 * Central site configuration.
 * Update the values below to change contact details, social links and
 * company information across the whole website.
 */
export const siteConfig = {
  name: "THAMIZARA Technologies",
  shortName: "THAMIZARA",
  tagline: "Tamil Roots. Global Innovation.",
  positioning: "Technology for Every Business. Solutions for Every Idea.",
  description:
    "THAMIZARA Technologies builds affordable custom software, web and mobile applications for small businesses, students, institutions and organisations across Africa and worldwide.",

  contact: {
    // TODO: replace with the real email address before launch.
    email: "info@thamizara.com",
    // TODO: add the WhatsApp number in international format, digits only
    // (e.g. "2376XXXXXXXX" for Cameroon, "234XXXXXXXXXX" for Nigeria).
    whatsappNumber: "",
    region: "Cameroon · Nigeria · Remote Worldwide",
  },

  // Internal admin application URL — footer "Admin Login" link.
  adminUrl: "http://localhost:5174",

  socials: [
    // Add profile URLs to display social icons in the footer.
    // { label: "LinkedIn", url: "https://www.linkedin.com/company/thamizara" },
    // { label: "GitHub", url: "https://github.com/thamizara" },
    // { label: "X", url: "https://x.com/thamizara" },
    // { label: "Instagram", url: "https://instagram.com/thamizara" },
  ],
};

export const mailtoUrl = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
  "Project enquiry — THAMIZARA Technologies",
)}`;

export const whatsappUrl = siteConfig.contact.whatsappNumber
  ? `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(
      "Hello THAMIZARA, I would like to discuss a project.",
    )}`
  : mailtoUrl;
