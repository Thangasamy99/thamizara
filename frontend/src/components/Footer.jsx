import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import Logo from "./Logo";
import SocialIcon from "./SocialIcons";
import { siteConfig, whatsappUrl } from "../config/siteConfig";
import { serviceCategories } from "../data/services";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Our Work", to: "/portfolio" },
  { label: "Pricing", to: "/pricing" },
  { label: "Request a Demo", to: "/request-demo" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  const [year] = useState(() => new Date().getFullYear());
  const { email, whatsappNumber, region } = siteConfig.contact;
  const socials = siteConfig.socials.filter((s) => s.url);

  return (
    <footer className="bg-ink-950 text-white/60">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-16">
        {/* Brand */}
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {siteConfig.tagline} We build practical, affordable software that
            helps businesses, students and organisations grow.
          </p>
          {socials.length > 0 ? (
            <div className="mt-5 flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="rounded-lg border border-white/10 p-2 transition-colors hover:border-brand-500 hover:text-brand-500"
                >
                  <SocialIcon name={social.label} />
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-xs text-white/30">
              Follow us — social links coming soon.
            </p>
          )}
        </div>

        {/* Quick links */}
        <nav aria-label="Quick links">
          <h3 className="mb-4 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-sm">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-brand-500">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Services */}
        <nav aria-label="Services">
          <h3 className="mb-4 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">
            Services
          </h3>
          <ul className="space-y-2.5 text-sm">
            {serviceCategories.map((service) => (
              <li key={service.slug}>
                <Link to={`/services/${service.slug}`} className="transition-colors hover:text-brand-500">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className="mb-4 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">
            Contact
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-brand-500"
              >
                <Mail size={16} className="shrink-0 text-brand-500" />
                {email}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl}
                className="flex items-center gap-2.5 transition-colors hover:text-brand-500"
              >
                <MessageCircle size={16} className="shrink-0 text-brand-500" />
                {whatsappNumber ? `+${whatsappNumber}` : "WhatsApp us"}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={16} className="shrink-0 text-brand-500" />
              {region}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs sm:flex-row">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="text-white/30 transition-colors hover:text-brand-500"
            >
              Admin Login
            </Link>
            <p className="text-white/30">{siteConfig.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
