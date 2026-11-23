import { Link } from "react-router-dom";

const variants = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/25",
  secondary:
    "border border-line bg-white text-ink-900 hover:border-brand-500 hover:text-brand-600",
  white: "bg-white text-brand-700 hover:bg-brand-50",
  outlineLight:
    "border border-white/30 text-white hover:bg-white/10",
  ghost: "text-ink-700 hover:text-brand-600",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  children,
  to,
  href,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
