import { Field, errorClasses } from "./fields";
import { budgetRanges, currencies, timelines } from "../../data/quotationOptions";

const pill = (selected) =>
  `cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold transition-colors select-none ${
    selected
      ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/20"
      : "border-line bg-white text-ink-700 hover:border-brand-500 hover:text-brand-600"
  }`;

export default function QuotationStepBudget({ data, errors, onSelect }) {
  const ranges = budgetRanges[data.currency] ?? [];

  return (
    <div className="grid gap-7">
      <Field label="Preferred Quotation Currency" name="currency">
        <p className="mb-3 text-xs text-ink-400">
          We'll prepare your quotation in this currency.
        </p>
        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Preferred currency">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => onSelect("currency", c.code)}
              aria-pressed={data.currency === c.code}
              className={pill(data.currency === c.code)}
            >
              <span className="font-bold">{c.code}</span>
              <span className="ml-1.5 text-xs opacity-80">{c.name}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Budget Range" name="budget" error={errors.budget}>
        <p className="mb-3 text-xs text-ink-400">
          A rough idea helps us propose the right scope — your quotation is
          prepared individually, never auto-calculated.
        </p>
        <div className="grid gap-2.5 min-[420px]:grid-cols-2" role="radiogroup" aria-label="Budget range">
          {[...ranges, "Not sure yet"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onSelect("budget", r)}
              aria-pressed={data.budget === r}
              className={`${pill(data.budget === r)} text-left ${errors.budget ? errorClasses : ""}`}
            >
              {r}
            </button>
          ))}
        </div>
      </Field>

      <Field label="When do you need it?" name="timeline" error={errors.timeline}>
        <div className="grid gap-2.5 min-[420px]:grid-cols-2" role="radiogroup" aria-label="Timeline">
          {timelines.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onSelect("timeline", t)}
              aria-pressed={data.timeline === t}
              className={`${pill(data.timeline === t)} text-left ${errors.timeline ? errorClasses : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}
