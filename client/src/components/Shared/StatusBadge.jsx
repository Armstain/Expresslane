import PropTypes from "prop-types";
import { CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  "on the way": { label: "On the way", variant: "info", icon: Truck },
  delivered: { label: "Delivered", variant: "success", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS[status] || { label: status || "Unknown", variant: "secondary", icon: Clock };
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
};

StatusBadge.propTypes = { status: PropTypes.string };

export default StatusBadge;
