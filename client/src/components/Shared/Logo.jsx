import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const LogoMark = ({ className }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("h-8 w-8", className)}>
    <rect width="32" height="32" rx="8" className="fill-primary" />
    <path
      d="M9 11h9M7 16h12M9 21h9"
      className="stroke-primary-foreground"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M19 10l6 6-6 6"
      fill="none"
      className="stroke-primary-foreground"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

LogoMark.propTypes = { className: PropTypes.string };

const Logo = ({ className, to = "/" }) => (
  <Link
    to={to}
    className={cn(
      "inline-flex items-center gap-2.5 rounded-md text-lg font-extrabold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
    aria-label="ExpressLane home"
  >
    <LogoMark />
    <span>
      Express<span className="text-primary">Lane</span>
    </span>
  </Link>
);

Logo.propTypes = { className: PropTypes.string, to: PropTypes.string };

export default Logo;
