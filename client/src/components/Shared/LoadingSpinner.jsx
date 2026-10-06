import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingSpinner = ({ className, fullScreen = false, label = "Loading" }) => (
  <div
    role="status"
    className={cn(
      "flex w-full items-center justify-center py-16",
      fullScreen && "min-h-screen py-0",
      className
    )}
  >
    <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </div>
);

LoadingSpinner.propTypes = {
  className: PropTypes.string,
  fullScreen: PropTypes.bool,
  label: PropTypes.string,
};

export default LoadingSpinner;
