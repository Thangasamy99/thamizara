import { motion } from "framer-motion";
import { CheckCircle2, Mail, MessageCircle, RotateCcw, Hash, KeyRound } from "lucide-react";
import {
  buildEnquirySummary,
  sendByEmail,
  sendByWhatsApp,
  canSubmit,
} from "../../lib/quotation";
import { siteConfig } from "../../config/siteConfig";

/** Confirmation shown after the backend has stored the enquiry. */
function ApiConfirmation({ data, result, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl"
    >
      <div className="rounded-2xl border border-line bg-white p-6 text-center sm:p-10">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-600">
          <CheckCircle2 size={32} />
        </span>
        <h2 className="font-heading text-2xl font-bold text-ink-900">
          Quotation Request Received
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-500">
          Your enquiry has been securely stored. Our team will review your
          requirements and prepare a customised quotation
          in <strong className="text-ink-900">{data.currency}</strong> — pricing
          is prepared manually for your project, not generated automatically.
        </p>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-xl bg-mist-50 p-4 ring-1 ring-line">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-400">
              <Hash size={12} /> Reference
            </p>
            <p className="mt-1.5 font-heading text-lg font-bold text-brand-600">
              {result.reference}
            </p>
          </div>
          <div className="rounded-xl bg-mist-50 p-4 ring-1 ring-line">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-400">
              <KeyRound size={12} /> Tracking code
            </p>
            <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-ink-700">
              {result.statusToken}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Save your reference and tracking code — you can use them to check the
          status of your request. If email is configured you'll also receive a
          confirmation message.
        </p>

        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-600"
        >
          <RotateCcw size={15} />
          Start a new enquiry
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-ink-400">
        Prefer to talk first?{" "}
        <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-brand-600 hover:underline">
          {siteConfig.contact.email}
        </a>
      </p>
    </motion.div>
  );
}

export default function QuotationConfirmation({ data, result, onReset }) {
  if (result) return <ApiConfirmation data={data} result={result} onReset={onReset} />;

  const emailHref = sendByEmail(data);
  const whatsappHref = sendByWhatsApp(data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl"
    >
      <div className="rounded-2xl border border-line bg-white p-6 text-center sm:p-10">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-600">
          <CheckCircle2 size={32} />
        </span>
        <h2 className="font-heading text-2xl font-bold text-ink-900">
          Your Enquiry Is Ready to Send
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-500">
          Our online enquiry system launches soon. For now, send your enquiry
          summary through email or WhatsApp — choose whichever is easier below.
          Our team will review your requirements and reply with a customised
          quotation in <strong className="text-ink-900">{data.currency}</strong>.
        </p>

        <div className="mt-6 rounded-xl bg-mist-50 p-4 text-left ring-1 ring-line">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">
            Your enquiry summary
          </p>
          <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap font-body text-xs leading-relaxed text-ink-700">
            {buildEnquirySummary(data)}
          </pre>
        </div>

        {canSubmit() ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={emailHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-colors hover:bg-brand-700"
            >
              <Mail size={17} />
              Send via Email
            </a>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-6 py-3.5 text-sm font-semibold text-ink-900 transition-colors hover:border-accent-500 hover:text-accent-600"
              >
                <MessageCircle size={17} />
                Send via WhatsApp
              </a>
            ) : (
              <span className="inline-flex items-center justify-center rounded-xl border border-dashed border-line px-6 py-3.5 text-xs text-ink-400">
                WhatsApp sending isn't configured yet — please use email.
              </span>
            )}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Our contact details aren't configured yet, so this enquiry can't be
            sent right now. Please check back soon.
          </p>
        )}

        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-600"
        >
          <RotateCcw size={15} />
          Start a new enquiry
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-ink-400">
        Prefer to talk first?{" "}
        <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-brand-600 hover:underline">
          {siteConfig.contact.email}
        </a>
      </p>
    </motion.div>
  );
}
