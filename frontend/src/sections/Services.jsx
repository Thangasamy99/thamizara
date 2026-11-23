import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import { services } from "../data/services";

export default function Services() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our Services"
          title="What We Build For You"
          description="Affordable digital solutions — from your first business application to enterprise-grade systems."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.title} {...service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
