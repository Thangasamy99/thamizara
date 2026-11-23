import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Send, AlertCircle } from "lucide-react";
import QuotationStepCustomer from "./QuotationStepCustomer";
import QuotationStepRequirements from "./QuotationStepRequirements";
import QuotationStepBudget from "./QuotationStepBudget";
import QuotationStepReview from "./QuotationStepReview";
import QuotationConfirmation from "./QuotationConfirmation";
import { wizardSteps, serviceCategoryOptions, tierLabels, approaches } from "../../data/quotationOptions";
import { apiEnabled, postJson } from "../../lib/api";

const initialData = {
  name: "",
  business: "",
  email: "",
  whatsapp: "",
  country: "Cameroon",
  city: "",
  serviceCategory: "",
  serviceLevel: "",
  projectType: "",
  description: "",
  features: [],
  existingSoftware: "",
  approach: approaches[0],
  budget: "",
  timeline: "",
  currency: "XAF",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStep(step, data) {
  const errs = {};
  if (step === 1) {
    if (!data.name.trim()) errs.name = "Required";
    if (!data.email.trim()) errs.email = "Required";
    else if (!EMAIL_RE.test(data.email)) errs.email = "Enter a valid email";
    if (!data.whatsapp.trim()) errs.whatsapp = "Required";
    if (!data.country) errs.country = "Required";
  }
  if (step === 2) {
    if (!data.serviceCategory) errs.serviceCategory = "Select a category";
    if (!data.projectType) errs.projectType = "Select a type";
    if (!data.description.trim()) errs.description = "Tell us briefly about your project";
    if (!data.features.length) errs.features = "Select at least one feature";
  }
  if (step === 3) {
    if (!data.budget) errs.budget = "Select a range or 'Not sure yet'";
    if (!data.timeline) errs.timeline = "Select a timeline";
  }
  return errs;
}

function Progress({ step }) {
  return (
    <ol className="mb-8 flex items-center gap-2 sm:gap-3" aria-label="Progress">
      {wizardSteps.map((s, i) => {
        const done = step > s.id;
        const active = step === s.id;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? "bg-accent-500 text-white"
                    : active
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                      : "bg-mist-50 text-ink-400 ring-1 ring-line"
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : s.id}
              </span>
              <span
                className={`hidden text-xs font-semibold sm:block ${
                  active ? "text-ink-900" : "text-ink-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < wizardSteps.length - 1 && (
              <div className={`h-px flex-1 ${done ? "bg-accent-500" : "bg-line"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function QuotationWizard() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);
  // Stable key for this enquiry session — retries send the same key, so the
  // backend never stores the request twice.
  const idemKey = useRef(crypto.randomUUID());

  const initial = useMemo(() => {
    const d = { ...initialData };
    const service = params.get("service");
    const tier = params.get("tier");
    if (service && serviceCategoryOptions.some((c) => c.slug === service)) {
      d.serviceCategory = service;
    }
    if (tier && tierLabels[tier]) d.serviceLevel = tier;
    return d;
  }, [params]);

  const [data, setData] = useState(initial);

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const onSelect = (name, value) => {
    setData((d) => ({ ...d, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const onToggleFeature = (feature) => {
    setData((d) => ({
      ...d,
      features: d.features.includes(feature)
        ? d.features.filter((f) => f !== feature)
        : [...d.features, feature],
    }));
    setErrors((err) => ({ ...err, features: undefined }));
  };

  const submit = async () => {
    if (!apiEnabled) {
      // Offline fallback — the confirmation offers mailto/WhatsApp instead.
      setSubmitted(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await postJson("/public/quotation-requests", data, {
        idempotencyKey: idemKey.current,
      });
      setResult(res.data);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      // Form data is preserved — the visitor can retry with the same key.
      setSubmitError(
        err.status === 409
          ? "This enquiry is already being processed — please wait a moment and try again."
          : err.message ?? "Submission failed. Please try again or contact us directly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    const errs = validateStep(step, data);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (step < wizardSteps.length) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const reset = () => {
    setData(initialData);
    setErrors({});
    setStep(1);
    setSubmitted(false);
    setResult(null);
    setSubmitError(null);
    idemKey.current = crypto.randomUUID();
  };

  if (submitted) {
    return <QuotationConfirmation data={data} result={result} onReset={reset} />;
  }

  const stepTitles = {
    1: "Tell us about yourself",
    2: "What do you need?",
    3: "Budget & timeline",
    4: "Review your enquiry",
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Progress step={step} />

      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 font-heading text-xl font-bold text-ink-900">
          {stepTitles[step]}
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <QuotationStepCustomer data={data} errors={errors} onChange={onChange} />
            )}
            {step === 2 && (
              <QuotationStepRequirements
                data={data}
                errors={errors}
                onChange={onChange}
                onToggleFeature={onToggleFeature}
              />
            )}
            {step === 3 && (
              <QuotationStepBudget data={data} errors={errors} onChange={onChange} onSelect={onSelect} />
            )}
            {step === 4 && (
              <QuotationStepReview data={data} onSelect={onSelect} />
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {step === wizardSteps.length ? (
              <>
                {submitting ? "Submitting…" : "Submit Enquiry"}
                <Send size={16} />
              </>
            ) : (
              <>
                Next
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
