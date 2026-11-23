import { motion } from "framer-motion";
import { SlidersHorizontal, Coins, ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Seo from "../components/Seo";
import SectionHeading from "../components/SectionHeading";
import PricingCard from "../components/PricingCard";
import ServiceFAQ from "../components/ServiceFAQ";
import Button from "../components/Button";
import WhatsAppCTA from "../components/WhatsAppCTA";
import { pricingTiers, pricingFactors, pricingFaqs } from "../data/pricingTiers";
import { currencies } from "../data/quotationOptions";

export default function PricingPage() {
  return (
    <>
      <Seo
        title="Pricing — Custom Software Quotations"
        description="Transparent, customised software pricing for businesses in Cameroon and Nigeria. Every project is quoted individually in XAF, NGN or USD."
        path="/pricing"
      />
      <PageHeader
        eyebrow="Pricing"
        title="Transparent Pricing. Tailored Solutions."
        description="Every business has different requirements. We evaluate your project scope, features, complexity and budget before preparing a customised quotation."
      />

      {/* Tiers */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container-x">
          <div className="grid gap-6 pt-4 md:grid-cols-3 lg:gap-8">
            {pricingTiers.map((tier, i) => (
              <PricingCard key={tier.key} tier={tier} index={i} />
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-ink-500">
            Every project is priced individually. Request a free quotation —
            no obligation, no hidden fees.
          </p>
        </div>
      </section>

      {/* Cost factors */}
      <section className="bg-mist-50 py-16 lg:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="How Quoting Works"
            title="What Influences Your Project Cost"
            description="We never quote blindly. These are the factors we evaluate when preparing your customised quotation."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {pricingFactors.map((factor, i) => (
              <motion.div
                key={factor.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                  <SlidersHorizontal size={17} />
                </span>
                <h3 className="font-heading text-[15px] font-semibold text-ink-900">
                  {factor.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
                  {factor.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Currencies */}
      <section className="border-y border-line bg-white py-14 lg:py-16">
        <div className="container-x flex flex-col items-center gap-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <Coins size={24} />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold text-ink-900">
              Quotations in Your Currency
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
              Choose your preferred currency when you request a quotation — our
              team prepares every quote manually in the currency you select.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {currencies.map((c) => (
              <div
                key={c.code}
                className="rounded-xl border border-line bg-mist-50 px-5 py-3 text-left"
              >
                <p className="font-heading text-base font-bold text-brand-600">{c.code}</p>
                <p className="text-xs text-ink-500">{c.name} ({c.symbol})</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="FAQ"
            title="Pricing & Service Questions"
            description="Honest answers about cost, timelines and how we work."
          />
          <ServiceFAQ faqs={pricingFaqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center sm:px-12"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[24px] border-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[28px] border-white/5" aria-hidden="true" />

          <h2 className="text-h2 relative mx-auto max-w-xl font-heading font-bold text-white">
            Get Your Custom Quotation
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">
            Five minutes to describe your project — a tailored quotation in
            reply. Free and with no obligation.
          </p>
          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/request-quotation" variant="white" size="lg" className="w-full sm:w-auto">
              Request a Quotation
              <ArrowRight size={18} />
            </Button>
            <WhatsAppCTA size="lg" className="w-full sm:w-auto" />
          </div>
        </motion.div>
      </section>
    </>
  );
}
