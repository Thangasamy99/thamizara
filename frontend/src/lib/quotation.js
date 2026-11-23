import { siteConfig } from "../config/siteConfig";

/**
 * Submission adapter for enquiries.
 *
 * Phase 3 is frontend-only: enquiries are composed as a formatted summary the
 * visitor sends via their own email app or WhatsApp — nothing is silently
 * "submitted" to a backend that doesn't exist yet.
 *
 * To connect a real backend later, implement the same interface:
 *   buildEnquirySummary(data) → string
 *   sendByEmail(data) → url
 *   sendByWhatsApp(data) → url | null
 * and swap the calls in QuotationConfirmation.
 */

const line = (label, value) => (value ? `${label}: ${value}` : null);

export function buildEnquirySummary(d) {
  return [
    "— CUSTOMER —",
    line("Name", d.name),
    line("Business / Organisation", d.business),
    line("Email", d.email),
    line("WhatsApp", d.whatsapp),
    line("Country", d.country),
    line("City", d.city),
    "",
    "— REQUIREMENTS —",
    line("Service category", d.serviceCategory),
    line("Service level", d.serviceLevel),
    line("Project type", d.projectType),
    line("Required features", d.features?.join(", ")),
    line("Existing software", d.existingSoftware),
    line("Approach", d.approach),
    "",
    "— PROJECT DESCRIPTION —",
    d.description || null,
    "",
    "— BUDGET & TIMELINE —",
    line("Budget range", d.budget),
    line("Timeline", d.timeline),
    line("Preferred currency", d.currency),
  ]
    .filter(Boolean)
    .join("\n");
}

export function sendByEmail(data) {
  const subject = encodeURIComponent(
    `Quotation request — ${data.serviceCategory || "New project"} (${data.name})`,
  );
  const body = encodeURIComponent(
    `Hello THAMIZARA team,\n\nPlease prepare a quotation for the following enquiry:\n\n${buildEnquirySummary(data)}`,
  );
  return `mailto:${siteConfig.contact.email}?subject=${subject}&body=${body}`;
}

export function sendByWhatsApp(data) {
  const number = siteConfig.contact.whatsappNumber;
  if (!number) return null;
  const text = encodeURIComponent(
    [
      "Hello THAMIZARA, I'd like a quotation.",
      line("Name", data.name),
      line("Service", data.serviceCategory),
      line("Country", data.country),
      line("Currency", data.currency),
      line("Project", data.description?.slice(0, 200)),
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `https://wa.me/${number}?text=${text}`;
}

/** True when at least one contact channel is configured. */
export const canSubmit = () =>
  Boolean(siteConfig.contact.email || siteConfig.contact.whatsappNumber);
