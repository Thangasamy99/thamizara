import PageHeader from "../components/PageHeader";
import Seo from "../components/Seo";
import QuotationWizard from "../components/quotation/QuotationWizard";

export default function QuotationPage() {
  return (
    <>
      <Seo
        title="Request a Quotation"
        description="Request a customised software development quotation from THAMIZORA Technologies — prepared in XAF, NGN or USD."
        path="/request-quotation"
      />
      <PageHeader
        eyebrow="Request a Quotation"
        title="Tell Us What You Need."
        description="Answer a few questions about your project and we'll prepare a customised quotation — free and with no obligation."
      />

      <section className="bg-mist-50 py-14 lg:py-20">
        <div className="container-x">
          <QuotationWizard />
        </div>
      </section>
    </>
  );
}
