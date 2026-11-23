import Seo from "../components/Seo";
import Hero from "../sections/Hero";
import CustomerCategories from "../sections/CustomerCategories";
import Services from "../sections/Services";
import FeaturedProjects from "../sections/FeaturedProjects";
import About from "../sections/About";
import Technologies from "../sections/Technologies";
import ContactCTA from "../sections/ContactCTA";

export default function Home() {
  return (
    <>
      <Seo
        title="Tamil Roots. Global Innovation."
        description="THAMIZORA Technologies builds affordable custom software, web and mobile applications for small businesses, students, institutions and organisations across Africa and worldwide."
        path="/"
      />
      <Hero />
      <CustomerCategories />
      <Services />
      <FeaturedProjects />
      <About />
      <Technologies />
      <ContactCTA />
    </>
  );
}
