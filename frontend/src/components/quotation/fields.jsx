export const inputClasses =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export const errorClasses = "!border-red-400 !ring-red-400/20";

export function Field({ label, name, error, optional, children }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink-900">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-400">(optional)</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
