import { useRef, useState } from "react";
import { Mail, MessageCircle, Send, CheckCircle2, AlertCircle, MonitorPlay } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Seo from "../components/Seo";
import Button from "../components/Button";
import { siteConfig, whatsappUrl } from "../config/siteConfig";
import { apiEnabled, postJson } from "../lib/api";

const applications = [
  "Hospital Management System",
  "Eye Hospital Management System",
  "School Management System",
  "Property Management System",
  "E-Commerce Platform",
  "Church Management System",
  "Hotel Management System",
  "Hostel Management System",
  "Custom Software",
];

export default function RequestDemoPage() {
  const { email, whatsappNumber } = siteConfig.contact;
  const [form, setForm] = useState({
    name: "", email: "", phone: "", country: "",
    organization: "", application: applications[0], message: "",
  });
  const idemKey = useRef(crypto.randomUUID());
  const [state, setState] = useState({ status: "idle", reference: null, error: null });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiEnabled) {
      const subject = encodeURIComponent(`Demo request — ${form.application}`);
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nPhone/WhatsApp: ${form.phone}\nCountry: ${form.country}\nOrganization: ${form.organization}\nApplication: ${form.application}\n\n${form.message}`,
      );
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      return;
    }
    setState({ status: "sending", reference: null, error: null });
    try {
      const res = await postJson("/public/demo-requests", form, { idempotencyKey: idemKey.current });
      setState({ status: "sent", reference: res.data.reference, error: null });
      idemKey.current = crypto.randomUUID();
    } catch (err) {
      setState({
        status: "error",
        reference: null,
        error: err.message ?? "Something went wrong. Please try again or email us directly.",
      });
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <>
      <Seo
        title="Request a Demo"
        description="See a THAMIZARA management system live — request a personalised demo of our hospital, school, property, church, hotel or e-commerce software."
        path="/request-demo"
      />
      <PageHeader
        eyebrow="Request a Demo"
        title="See Our Software in Action"
        description="Pick a product and tell us where to reach you — we'll schedule a live demo walkthrough, no commitment needed."
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-5 lg:gap-12">
          {/* Side info */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-line bg-mist-50 p-6 sm:p-7">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <MonitorPlay size={20} />
              </div>
              <h2 className="mt-4 font-heading text-lg font-semibold text-ink-900">
                What Happens Next
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-500">
                <li>1. We review your request and reach out on email or WhatsApp.</li>
                <li>2. We schedule a live demo session at a time that suits you.</li>
                <li>3. You see the real system and ask anything — no pressure.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-ink-950 p-6 sm:p-7">
              <h2 className="font-heading text-lg font-semibold text-white">
                Prefer to Reach Us Directly?
              </h2>
              <div className="mt-4 space-y-2">
                <Button href={`mailto:${email}`} variant="primary" size="sm" className="w-full">
                  <Mail size={16} />
                  {email}
                </Button>
                {whatsappNumber && (
                  <Button href={whatsappUrl} variant="secondary" size="sm" className="w-full">
                    <MessageCircle size={16} />
                    Chat on WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Demo request form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-line bg-mist-50 p-6 sm:p-8 lg:col-span-3"
          >
            <h2 className="font-heading text-xl font-semibold text-ink-900">
              Book Your Demo
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {apiEnabled
                ? "Submit the form and we'll contact you to arrange a session."
                : "Fill in the form and we'll open your email app with the details ready to send."}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input id="name" name="name" type="text" required value={form.name}
                  onChange={handleChange} placeholder="e.g. Dr. Tabi Eyong" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Email <span className="text-red-500">*</span>
                </label>
                <input id="email" name="email" type="email" required value={form.email}
                  onChange={handleChange} placeholder="you@example.com" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Phone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input id="phone" name="phone" type="tel" required value={form.phone}
                  onChange={handleChange} placeholder="+237 6XX XX XX XX" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Country <span className="text-red-500">*</span>
                </label>
                <input id="country" name="country" type="text" required value={form.country}
                  onChange={handleChange} placeholder="e.g. Cameroon" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="organization" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Organization / Business (optional)
                </label>
                <input id="organization" name="organization" type="text" value={form.organization}
                  onChange={handleChange} placeholder="e.g. Mercy Clinic" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="application" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Application <span className="text-red-500">*</span>
                </label>
                <select id="application" name="application" value={form.application}
                  onChange={handleChange} className={inputClasses}>
                  {applications.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Additional Message (optional)
                </label>
                <textarea id="message" name="message" rows={4} value={form.message}
                  onChange={handleChange}
                  placeholder="Anything we should know — team size, timeline, current software…"
                  className={`${inputClasses} resize-y`} />
              </div>
            </div>

            {state.status === "sent" ? (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent-500/30 bg-accent-100/60 px-4 py-4">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-accent-600" />
                <div className="text-sm">
                  <p className="font-semibold text-ink-900">
                    Demo request received — reference <span className="text-brand-600">{state.reference}</span>
                  </p>
                  <p className="mt-1 text-ink-500">
                    We'll contact you on your email or WhatsApp to schedule the demo.
                    Keep the reference for future correspondence.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {state.status === "error" && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                    <p className="text-sm text-red-700">{state.error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  size="lg"
                  disabled={state.status === "sending"}
                  className="mt-6 w-full disabled:opacity-60 sm:w-auto"
                >
                  <Send size={18} />
                  {state.status === "sending" ? "Sending…" : "Request Demo"}
                </Button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
