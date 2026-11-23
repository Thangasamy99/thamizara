import SectionHeading from "./SectionHeading";
import ProjectGrid from "./ProjectGrid";
import { getRelated } from "../data/projects";

export default function RelatedProjects({ project }) {
  const related = getRelated(project);
  if (!related.length) return null;

  return (
    <section className="bg-mist-50 py-16 lg:py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow="Keep Exploring"
          title="Related Projects"
          description="Other applications we've built that may be relevant to your business."
        />
        <ProjectGrid projects={related} />
      </div>
    </section>
  );
}
