import { ArrowRight } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import ProjectSpotlight from "../components/ProjectSpotlight";
import Button from "../components/Button";
import { featuredProjects } from "../data/projects";

export default function FeaturedProjects() {
  return (
    <section className="bg-mist-50 py-16 lg:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our Work"
          title="Software We've Actually Built"
          description="Real systems designed and developed by our team — practical software solving real business problems."
        />

        <div className="space-y-16 lg:space-y-24">
          {featuredProjects.map((project, index) => (
            <ProjectSpotlight key={project.id} project={project} reversed={index % 2 === 1} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button to="/portfolio" variant="secondary" size="lg">
            View All Projects
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
