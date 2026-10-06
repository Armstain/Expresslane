import PropTypes from "prop-types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const StatCard = ({ label, value, icon: Icon, hint, className }) => (
  <Card className={cn("p-4 sm:p-5", className)}>
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {Icon && (
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground sm:flex">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
    </div>
  </Card>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
  icon: PropTypes.elementType,
  hint: PropTypes.node,
  className: PropTypes.string,
};

export default StatCard;
