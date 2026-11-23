import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { EnquiryContext } from "./enquiryContext";

const COUNTRIES = ["Cameroon", "Nigeria", "Other"];
const PROJECT_TYPES = [
  "Business / POS software",
  "Website or web application",
  "Mobile application",
  "Management system",
  "Student project mentoring",
  "Something else",
];

const inputClasses =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const errorClasses = "border-red-400 focus:border-red-400 focus:ring-red-400/20";

function EnquiryModal({ projectTitle, onClose }) {
  const [form, setForm] = useState({
    name: "",
    business: "",
    country: COUNTRIES[0],
    email: "",
    whatsapp: "",
    projectType: projectTitle || PROJECT_TYPES[0],
    message: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.whatsapp.trim()) errs.whatsapp = "Required";
    if (!form.message.trim()) errs.message = "Required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const subject = encodeURIComponent(`Enquiry — ${form.projectType}`);
    const body = encodeURIComponent(
      [
        `Name: ${form.name}`,
        form.business && `Business / Organisation: ${form.business}`,
        `Country: ${form.country}`,
        `Email: ${form.email}`,
        `WhatsApp: ${form.whatsapp}`,
        `Project type: ${form.projectType}`,
        "",
        form.message,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:${siteConfig.contact.email}?subject=${subject}&body=${body}`;
    onClose();
  };

  const field = (label, name, opts = {}) => (
    <div className={opts.span ? "sm:col-span-2" : ""}>
      <label htmlFor={`enq-${name}`} className="mb-1.5 block text-sm font-medium text-ink-900">
        {label} {opts.required === false && <span className="font-normal text-ink-400">(optional)</span>}
      </label>
      {opts.children ?? (
        <input
          id={`enq-${name}`}
          name={name}
          type={opts.type ?? "text"}
          required={opts.required !== false}
          value={form[name]}
          onChange={set}
          placeholder={opts.placeholder}
          className={`${inputClasses} ${errors[name] ? errorClasses : ""}`}
        />
      )}
      {errors[name] && <p className="mt-1 text-xs font-medium text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Project enquiry form"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink-900">
              Request a Similar Solution
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Tell us about your project — we'll reply by email or WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-mist-50 hover:text-ink-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          {field("Full Name", "name", { placeholder: "e.g. Amina Ngu" })}
          {field("Business / Organisation", "business", { required: false, placeholder: "e.g. City Pharmacy" })}

          <div>
            <label htmlFor="enq-country" className="mb-1.5 block text-sm font-medium text-ink-900">
              Country
            </label>
            <select id="enq-country" name="country" value={form.country} onChange={set} className={inputClasses}>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          {field("Email", "email", { type: "email", placeholder: "you@example.com" })}
          {field("WhatsApp Number", "whatsapp", { type: "tel", placeholder: "e.g. +237 6XX XXX XXX" })}

          <div>
            <label htmlFor="enq-projectType" className="mb-1.5 block text-sm font-medium text-ink-900">
              Project Type
            </label>
            <select
              id="enq-projectType"
              name="projectType"
              value={form.projectType}
              onChange={set}
              className={inputClasses}
            >
              {projectTitle && <option value={projectTitle}>{projectTitle}</option>}
              {PROJECT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {field("Message", "message", {
            span: true,
            children: (
              <textarea
                id="enq-message"
                name="message"
                rows={4}
                required
                value={form.message}
                onChange={set}
                placeholder="Describe what you need — features, timeline, budget range…"
                className={`${inputClasses} resize-y ${errors.message ? errorClasses : ""}`}
              />
            ),
          })}

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700"
            >
              <Send size={17} />
              Send Enquiry
            </button>
            <p className="mt-3 text-center text-xs text-ink-400">
              This opens your email app with the details filled in — nothing is
              sent until you press send. A contact form backend is coming soon.
            </p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function EnquiryProvider({ children }) {
  const [enquiry, setEnquiry] = useState(null);
  const open = (projectTitle = "") => setEnquiry({ projectTitle });
  const close = () => setEnquiry(null);

  return (
    <EnquiryContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {enquiry && <EnquiryModal projectTitle={enquiry.projectTitle} onClose={close} />}
      </AnimatePresence>
    </EnquiryContext.Provider>
  );
}
