import PageHeader from "../components/PageHeader";
import Seo from "../components/Seo";
import SectionHeading from "../components/SectionHeading";
import ServiceCategoryCard from "../components/ServiceCategoryCard";
import ProcessSteps from "../components/ProcessSteps";
import ContactCTA from "../sections/ContactCTA";
import { serviceCategories } from "../data/services";

export default function ServicesPage() {
  return (
    <>
      <Seo
        title="Our Services"
        description="Custom software, POS systems, school and hospital management software, e-commerce platforms and student project mentoring — for businesses in Cameroon, Nigeria and beyond."
        path="/services"
      />
      <PageHeader
        eyebrow="Our Services"
        title="Technology Solutions for Every Business."
        description="From small shops to growing organisations, we develop practical software that simplifies operations and helps businesses grow."
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="container-x">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {serviceCategories.map((category, index) => (
              <ServiceCategoryCard key={category.slug} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist-50 py-16 lg:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Our Process"
            title="How We Work"
            description="A clear, transparent process — so you always know where your project stands."
          />
          <ProcessSteps />
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
