import { useRef, useState } from "react";
import { Mail, MessageCircle, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Seo from "../components/Seo";
import Button from "../components/Button";
import { siteConfig, mailtoUrl, whatsappUrl } from "../config/siteConfig";
import { apiEnabled, postJson } from "../lib/api";

const enquiryCategories = [
  "Software Development",
  "Website Development",
  "Mobile Application",
  "Existing Software / Product",
  "Student Technical Mentoring",
  "Pricing and Services",
  "Partnership",
  "Technical Support",
  "Other",
];

export default function ContactPage() {
  const { email, whatsappNumber, region } = siteConfig.contact;
  const [form, setForm] = useState({
    name: "", email: "", phone: "", country: "",
    category: enquiryCategories[0], message: "",
  });
  // One stable key per form session — safe retries never create duplicates.
  const idemKey = useRef(crypto.randomUUID());
  const [state, setState] = useState({ status: "idle", reference: null, error: null });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiEnabled) {
      const subject = encodeURIComponent(`Enquiry — ${form.category}`);
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nCountry: ${form.country}\nCategory: ${form.category}\n\n${form.message}`,
      );
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      return;
    }
    setState({ status: "sending", reference: null, error: null });
    try {
      const res = await postJson("/public/enquiries", form, { idempotencyKey: idemKey.current });
      setState({ status: "sent", reference: res.data.reference, error: null });
      idemKey.current = crypto.randomUUID(); // next enquiry gets a fresh key
    } catch (err) {
      setState({
        status: "error",
        reference: null,
        error: err.message ?? "Something went wrong. Please try again or email us directly.",
      });
    }
  };

  const contactCards = [
    { icon: Mail, title: "Email Us", value: email, href: `mailto:${email}` },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: whatsappNumber ? `+${whatsappNumber}` : "Chat with us",
      href: whatsappUrl,
    },
    { icon: MapPin, title: "Where We Work", value: region },
  ];

  const inputClasses =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <>
      <Seo
        title="Contact Us"
        description="Send a general enquiry to THAMIZARA Technologies — software, websites, mobile apps, mentoring or partnerships."
        path="/contact"
      />
      <PageHeader
        eyebrow="Contact"
        title="Let's Talk About Your Idea"
        description="Reach us by email or WhatsApp, or send a quick enquiry and we'll reply within 1–2 business days."
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-5 lg:gap-12">
          {/* Contact info */}
          <div className="space-y-4 lg:col-span-2">
            {contactCards.map((card) => {
              const content = (
                <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-brand-500/50">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <card.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-heading text-sm font-semibold text-ink-900">
                      {card.title}
                    </h2>
                    <p className="mt-1 break-words text-sm text-ink-500">{card.value}</p>
                  </div>
                </div>
              );
              return card.href ? (
                <a key={card.title} href={card.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={card.title}>{content}</div>
              );
            })}

            <div className="rounded-2xl bg-ink-950 p-6 sm:p-7">
              <h2 className="font-heading text-lg font-semibold text-white">
                Prefer a Live Walkthrough?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                See one of our ready-made management systems in action — request a
                demo and we'll schedule a session with you.
              </p>
              <Button to="/request-demo" variant="primary" size="sm" className="mt-5">
                <Send size={16} />
                Request a Demo
              </Button>
            </div>
          </div>

          {/* General enquiry form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-line bg-mist-50 p-6 sm:p-8 lg:col-span-3"
          >
            <h2 className="font-heading text-xl font-semibold text-ink-900">
              Send a General Enquiry
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {apiEnabled
                ? "Fill in the form and our team will get back to you within 1–2 business days."
                : "Fill in the form and we'll open your email app with the details ready to send."}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Amina Ngu"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+237 6XX XX XX XX"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={form.country}
                  onChange={handleChange}
                  placeholder="e.g. Cameroon"
                  className={inputClasses}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-ink-900">
                  What is this about? <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {enquiryCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help…"
                  className={`${inputClasses} resize-y`}
                />
              </div>
            </div>

            {state.status === "sent" ? (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent-500/30 bg-accent-100/60 px-4 py-4">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-accent-600" />
                <div className="text-sm">
                  <p className="font-semibold text-ink-900">
                    Enquiry received — reference <span className="text-brand-600">{state.reference}</span>
                  </p>
                  <p className="mt-1 text-ink-500">
                    We've logged your message and will reply within 1–2 business days.
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
                  {state.status === "sending" ? "Sending…" : "Send Enquiry"}
                </Button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
