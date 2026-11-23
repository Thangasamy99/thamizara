import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import DashboardMockup from "./DashboardMockup";

function Lightbox({ project, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onNav]);

  const screen = project.screens[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/85 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — ${screen.label}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close viewer"
        className="absolute right-4 top-4 rounded-lg bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
      >
        <X size={20} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNav(-1); }}
        aria-label="Previous screen"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 sm:left-6"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNav(1); }}
        aria-label="Next screen"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 sm:right-6"
      >
        <ChevronRight size={22} />
      </button>

      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl"
      >
        <DashboardMockup variant={project.mockup} screen={screen.key} />
        <p className="mt-4 text-center text-sm font-medium text-white/70">
          {screen.label} — {index + 1} of {project.screens.length}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectGallery({ project }) {
  const [active, setActive] = useState(null);
  const nav = (dir) =>
    setActive((i) => (i + dir + project.screens.length) % project.screens.length);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {project.screens.map((screen, i) => (
          <motion.button
            key={screen.key}
            type="button"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            onClick={() => setActive(i)}
            className="group relative rounded-2xl border border-line bg-mist-50 p-3 text-left transition-all hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-600/10"
            aria-label={`Enlarge ${screen.label}`}
          >
            <div className="pointer-events-none aspect-[16/10] overflow-hidden rounded-xl">
              <DashboardMockup variant={project.mockup} screen={screen.key} className="shadow-md" />
            </div>
            <div className="flex items-center justify-between px-1 pt-3">
              <span className="text-sm font-semibold text-ink-900">{screen.label}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-ink-400 ring-1 ring-line transition-colors group-hover:text-brand-600">
                <Expand size={14} />
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <Lightbox
            project={project}
            index={active}
            onClose={() => setActive(null)}
            onNav={nav}
          />
        )}
      </AnimatePresence>
    </>
  );
}
