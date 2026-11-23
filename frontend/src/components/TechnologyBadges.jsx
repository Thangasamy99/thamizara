export default function TechnologyBadges({ technologies, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {technologies.map((tech) => (
        <span
          key={tech}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-700"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}
