import PropTypes from "prop-types";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const EmptyState = ({ icon: Icon = Inbox, title, description, action, className }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center px-6 py-14 text-center",
      className
    )}
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </div>
    <h3 className="text-base font-semibold">{title}</h3>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
};

export default EmptyState;
