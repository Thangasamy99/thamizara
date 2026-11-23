import { Field } from "./fields";
import { currencies } from "../../data/quotationOptions";
import { getService } from "../../data/services";
import { tierLabels } from "../../data/quotationOptions";

function Row({ label, children }) {
  if (!children) return null;
  return (
    <div className="grid gap-0.5 py-2.5 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-ink-400">{label}</dt>
      <dd className="text-sm text-ink-900">{children}</dd>
    </div>
  );
}

export default function QuotationStepReview({ data, onSelect }) {
  const category = getService(data.serviceCategory);

  return (
    <div>
      <Field label="Quotation Currency" name="currency">
        <div className="mb-6 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Quotation currency">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => onSelect("currency", c.code)}
              aria-pressed={data.currency === c.code}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                data.currency === c.code
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line bg-white text-ink-700 hover:border-brand-500"
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </Field>

      <div className="rounded-2xl border border-line bg-mist-50 p-5 sm:p-7">
        <h3 className="mb-2 font-heading text-base font-bold text-ink-900">
          Review Your Enquiry
        </h3>
        <dl className="divide-y divide-line">
          <Row label="Name">{data.name}</Row>
          <Row label="Business">{data.business}</Row>
          <Row label="Email">{data.email}</Row>
          <Row label="WhatsApp">{data.whatsapp}</Row>
          <Row label="Location">{[data.city, data.country].filter(Boolean).join(", ")}</Row>
          <Row label="Service">{category?.shortTitle ?? data.serviceCategory}</Row>
          <Row label="Service Level">{tierLabels[data.serviceLevel] ?? data.serviceLevel}</Row>
          <Row label="Project Type">{data.projectType}</Row>
          <Row label="Features">{data.features?.join(", ")}</Row>
          <Row label="Existing Software">{data.existingSoftware}</Row>
          <Row label="Approach">{data.approach}</Row>
          <Row label="Description">
            <span className="whitespace-pre-wrap">{data.description}</span>
          </Row>
          <Row label="Budget">{data.budget}</Row>
          <Row label="Timeline">{data.timeline}</Row>
          <Row label="Currency">{data.currency}</Row>
        </dl>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        Check everything looks right — you can go back to edit any step. When you
        submit, you'll choose how to send your enquiry (email or WhatsApp).
      </p>
    </div>
  );
}
