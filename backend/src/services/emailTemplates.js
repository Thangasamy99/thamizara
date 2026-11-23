import env from "../config/env.js";

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const shell = (title, bodyHtml) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#17243A">
    <div style="background:#245BDB;padding:20px 28px;border-radius:12px 12px 0 0">
      <strong style="color:#fff;font-size:16px">THAMIZARA Technologies</strong>
    </div>
    <div style="border:1px solid #E5EAF2;border-top:none;padding:28px;border-radius:0 0 12px 12px">
      <h2 style="margin:0 0 16px;font-size:18px">${title}</h2>
      ${bodyHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#64748B">
        Tamil Roots. Global Innovation. — ${env.PUBLIC_SITE_URL}
      </p>
    </div>
  </div>`;

export function customerContactAck({ name, reference }) {
  return {
    subject: "We received your enquiry — THAMIZARA Technologies",
    text: `Hello ${name},\n\nThank you for contacting THAMIZARA Technologies. Your enquiry ${reference} has been received and our team will review it shortly.\n\nWe typically respond within 1–2 business days.\n\n— THAMIZARA Technologies`,
    html: shell(
      "We received your enquiry",
      `<p>Hello ${esc(name)},</p>
       <p>Thank you for contacting THAMIZARA Technologies. Your enquiry
          <strong>${esc(reference)}</strong> has been received and our team
          will review it shortly.</p>
       <p>We typically respond within 1–2 business days.</p>`,
    ),
  };
}

export function customerQuotationAck({ name, reference, currency }) {
  return {
    subject: `Quotation request received — ${reference}`,
    text: `Hello ${name},\n\nYour quotation request ${reference} has been received.\n\nOur team will review your requirements and prepare a customised quotation${currency ? ` in ${currency}` : ""}. No pricing is generated automatically — every quotation is prepared manually for your specific project.\n\nKeep your reference number for future correspondence.\n\n— THAMIZARA Technologies`,
    html: shell(
      "Your quotation request was received",
      `<p>Hello ${esc(name)},</p>
       <p>Your quotation request <strong>${esc(reference)}</strong> has been received.</p>
       <p>Our team will review your requirements and prepare a customised quotation${currency ? ` in <strong>${esc(currency)}</strong>` : ""}.
          No pricing is generated automatically — every quotation is prepared
          manually for your specific project.</p>
       <p style="background:#F4F7FC;padding:12px 16px;border-radius:8px">
         Reference: <strong>${esc(reference)}</strong> — keep it for future correspondence.</p>`,
    ),
  };
}

export function adminContactAlert({ reference, name, email, type, message }) {
  return {
    subject: `New contact enquiry ${reference} — ${name}`,
    text: `New contact enquiry ${reference}\n\nName: ${name}\nEmail: ${email}\nType: ${type}\n\n${message}`,
    html: shell(
      `New contact enquiry <span style="color:#245BDB">${esc(reference)}</span>`,
      `<p><strong>Name:</strong> ${esc(name)}<br>
        <strong>Email:</strong> ${esc(email)}<br>
        <strong>Type:</strong> ${esc(type)}</p>
       <p style="background:#F4F7FC;padding:12px 16px;border-radius:8px;white-space:pre-wrap">${esc(message)}</p>`,
    ),
  };
}

export function adminQuotationAlert({ reference, name, email, serviceCategory, currency, budget }) {
  return {
    subject: `New quotation request ${reference} — ${name}`,
    text: `New quotation request ${reference}\n\nName: ${name}\nEmail: ${email}\nService: ${serviceCategory}\nBudget: ${budget} (${currency})\n\nReview it in the admin dashboard.`,
    html: shell(
      `New quotation request <span style="color:#245BDB">${esc(reference)}</span>`,
      `<p><strong>Name:</strong> ${esc(name)}<br>
        <strong>Email:</strong> ${esc(email)}<br>
        <strong>Service:</strong> ${esc(serviceCategory)}<br>
        <strong>Customer budget:</strong> ${esc(budget)} (${esc(currency)})</p>
       <p>Review the full requirements in the admin dashboard.</p>`,
    ),
  };
}
