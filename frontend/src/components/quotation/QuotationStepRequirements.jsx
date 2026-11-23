import { Check } from "lucide-react";
import { Field, inputClasses, errorClasses } from "./fields";
import {
  approaches,
  projectTypes,
  serviceCategoryOptions,
} from "../../data/quotationOptions";
import { getService } from "../../data/services";

const featurePill = (selected, error) =>
  `inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors select-none ${
    selected
      ? "border-brand-600 bg-brand-600 text-white"
      : error
        ? "border-red-300 bg-white text-ink-700 hover:border-brand-500"
        : "border-line bg-white text-ink-700 hover:border-brand-500 hover:text-brand-600"
  }`;

export default function QuotationStepRequirements({ data, errors, onChange, onToggleFeature }) {
  const category = getService(data.serviceCategory);
  const featureOptions = [...(category?.offerings ?? []), "Not sure yet"];

  const cls = (n) => `${inputClasses} ${errors[n] ? errorClasses : ""}`;

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Service Category" name="serviceCategory" error={errors.serviceCategory}>
          <select
            id="serviceCategory"
            name="serviceCategory"
            value={data.serviceCategory}
            onChange={onChange}
            className={cls("serviceCategory")}
          >
            <option value="">Select a category…</option>
            {serviceCategoryOptions.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Project Type" name="projectType" error={errors.projectType}>
          <select id="projectType" name="projectType" value={data.projectType} onChange={onChange} className={cls("projectType")}>
            <option value="">Select a project type…</option>
            {projectTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Project Description" name="description" error={errors.description}>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={data.description}
          onChange={onChange}
          placeholder="Describe your business, the problem you want to solve, or the application you have in mind…"
          className={`${cls("description")} resize-y`}
        />
      </Field>

      <Field label="Required Features" name="features" error={errors.features}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Required features">
          {featureOptions.map((feature) => {
            const selected = data.features.includes(feature);
            return (
              <button
                key={feature}
                type="button"
                onClick={() => onToggleFeature(feature)}
                aria-pressed={selected}
                className={featurePill(selected, errors.features)}
              >
                {selected && <Check size={14} strokeWidth={3} />}
                {feature}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Existing Software / Website" name="existingSoftware" optional>
          <input
            id="existingSoftware"
            name="existingSoftware"
            value={data.existingSoftware}
            onChange={onChange}
            placeholder="e.g. Excel sheets, old system, none"
            className={cls("existingSoftware")}
          />
        </Field>
        <Field label="Preferred Approach" name="approach">
          <select id="approach" name="approach" value={data.approach} onChange={onChange} className={cls("approach")}>
            {approaches.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}
