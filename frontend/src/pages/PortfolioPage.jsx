import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import Seo from "../components/Seo";
import ProjectFilters from "../components/ProjectFilters";
import ProjectGrid from "../components/ProjectGrid";
import ContactCTA from "../sections/ContactCTA";
import { projects } from "../data/projects";

export default function PortfolioPage() {
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.filter === filter)),
    [filter],
  );

  return (
    <>
      <Seo
        title="Our Work — Software Portfolio"
        description="Explore software applications built by THAMIZARA Technologies — hospital, school, property, e-commerce, church, hotel and hostel management systems."
        path="/portfolio"
      />

      <PageHeader
        eyebrow="Our Portfolio"
        title="Software Solutions We've Built."
        description="Explore our software applications designed to simplify business operations, improve productivity and solve real-world challenges."
      />

      <section className="bg-white py-14 lg:py-20">
        <div className="container-x">
          <ProjectFilters active={filter} onChange={setFilter} />

          <p className="mt-6 text-center text-sm text-ink-400" aria-live="polite">
            Showing {visible.length} of {projects.length} projects
          </p>

          <div className="mt-8">
            <ProjectGrid projects={visible} />
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
