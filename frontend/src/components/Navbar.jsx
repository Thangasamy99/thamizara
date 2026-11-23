import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Our Work", to: "/portfolio" },
  { label: "Pricing", to: "/pricing" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-shadow ${
        scrolled ? "border-line shadow-[0_1px_12px_rgba(23,36,58,0.06)]" : "border-line"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Logo />

        <ul className="hidden items-center gap-8 lg:flex xl:gap-10">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `relative py-2 text-[15px] font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:rounded-full after:bg-brand-600 after:transition-all ${
                    isActive
                      ? "text-brand-600 after:w-full"
                      : "text-ink-500 after:w-0 hover:text-ink-900 hover:after:w-full"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 lg:block">
          <Button to="/request-demo" size="sm">
            Request a Demo
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-lg p-2.5 text-ink-900 transition-colors hover:bg-mist-50 lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <ul className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                        isActive
                          ? "bg-brand-100 text-brand-700"
                          : "text-ink-700 hover:bg-mist-50"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li className="px-1 pt-3" onClick={closeMenu}>
                <Button to="/request-demo" className="w-full">
                  Request a Demo
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
