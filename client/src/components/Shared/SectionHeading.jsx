import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const SectionHeading = ({ eyebrow, title, description, className }) => (
  <div className={cn("mx-auto mb-12 max-w-2xl text-center", className)}>
    {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
    <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">{title}</h2>
    {description && <p className="mt-4 text-muted-foreground">{description}</p>}
  </div>
);

SectionHeading.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  className: PropTypes.string,
};

export default SectionHeading;
