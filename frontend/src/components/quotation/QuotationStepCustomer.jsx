import { Field, inputClasses, errorClasses } from "./fields";
import { countries } from "../../data/quotationOptions";

export default function QuotationStepCustomer({ data, errors, onChange }) {
  const cls = (n) => `${inputClasses} ${errors[n] ? errorClasses : ""}`;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Full Name" name="name" error={errors.name}>
        <input id="name" name="name" value={data.name} onChange={onChange} placeholder="e.g. Amina Ngu" className={cls("name")} />
      </Field>
      <Field label="Business / Organisation" name="business" optional>
        <input id="business" name="business" value={data.business} onChange={onChange} placeholder="e.g. City Pharmacy" className={cls("business")} />
      </Field>
      <Field label="Email" name="email" error={errors.email}>
        <input id="email" name="email" type="email" value={data.email} onChange={onChange} placeholder="you@example.com" className={cls("email")} />
      </Field>
      <Field label="WhatsApp Number" name="whatsapp" error={errors.whatsapp}>
        <input id="whatsapp" name="whatsapp" type="tel" value={data.whatsapp} onChange={onChange} placeholder="e.g. +237 6XX XXX XXX" className={cls("whatsapp")} />
      </Field>
      <Field label="Country" name="country" error={errors.country}>
        <select id="country" name="country" value={data.country} onChange={onChange} className={cls("country")}>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="City" name="city" error={errors.city}>
        <input id="city" name="city" value={data.city} onChange={onChange} placeholder="e.g. Douala" className={cls("city")} />
      </Field>
    </div>
  );
}
