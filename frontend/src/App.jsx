import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { EnquiryProvider } from "./components/ProjectEnquiryForm";
import Home from "./pages/Home";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const QuotationPage = lazy(() => import("./pages/QuotationPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const RequestDemoPage = lazy(() => import("./pages/RequestDemoPage"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-brand-600" />
    </div>
  );
}

function PublicShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/request-quotation" element={<QuotationPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
          <Route path="/work" element={<Navigate to="/portfolio" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/request-demo" element={<RequestDemoPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <EnquiryProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="*" element={<PublicShell />} />
            </Routes>
          </Suspense>
        </EnquiryProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
