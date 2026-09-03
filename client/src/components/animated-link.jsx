import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function AnimatedLink({
  to,
  children,
  external = false,
  className = "",
}) {
  const baseClasses =
    "inline-flex items-center gap-2 font-semibold text-[color:var(--maroon)] hover:text-[color:var(--orange)] group transition-colors cursor-pointer";

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${className}`}
      >
        <span>{children}</span>
        <span className="inline-flex items-center justify-center rounded-full bg-[color:var(--orange)]/10 p-1 text-[color:var(--orange)] group-hover:bg-[color:var(--orange)] group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 shadow-sm">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </a>
    );
  }

  return (
    <Link to={to} className={`${baseClasses} ${className}`}>
      <span>{children}</span>
      <span className="inline-flex items-center justify-center rounded-full bg-[color:var(--orange)]/10 p-1 text-[color:var(--orange)] group-hover:bg-[color:var(--orange)] group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 shadow-sm">
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export function AnimatedButton({
  onClick,
  children,
  className = "",
  loading = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 font-semibold text-[color:var(--maroon)] hover:text-[color:var(--orange)] group transition-colors disabled:opacity-60 cursor-pointer ${className}`}
    >
      <span>{children}</span>
      <span className="inline-flex items-center justify-center rounded-full bg-[color:var(--orange)]/10 p-1 text-[color:var(--orange)] group-hover:bg-[color:var(--orange)] group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 shadow-sm">
        <ArrowRight
          className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
        />
      </span>
    </button>
  );
}
