import PropTypes from "prop-types";
import { Check, X } from "lucide-react";
import { calculateApproximateDeliveryDate, formatDate } from "@/api/utils/dateUtils.js";
import { cn } from "@/lib/utils";

// Turn a parcel's status into the four tracking milestones
export const getTimeline = (parcel) => {
  const status = parcel?.status;
  const eta = parcel?.approximateDeliveryDate
    ? formatDate(parcel.approximateDeliveryDate)
    : calculateApproximateDeliveryDate(parcel?.parcelType, parcel?.deliveryDate);

  if (status === "cancelled") {
    return [
      { label: "Booked", detail: formatDate(parcel.createdDate), state: "done" },
      { label: "Cancelled", detail: "This booking was cancelled", state: "cancelled" },
    ];
  }

  // index of the milestone in progress: pending waits for a rider, on the way is in transit
  const reached = { pending: 1, "on the way": 2, delivered: 3 }[status] ?? 1;
  const steps = [
    { label: "Booked", detail: formatDate(parcel?.createdDate) },
    { label: "Rider assigned", detail: reached >= 2 ? "A delivery partner has your parcel" : "Usually within a few hours" },
    { label: "On the way", detail: reached >= 2 ? "Out with your rider" : `Pickup on ${formatDate(parcel?.deliveryDate)}` },
    { label: "Delivered", detail: reached >= 3 ? "Handed to the recipient" : `Estimated ${eta}` },
  ];

  return steps.map((step, i) => ({
    ...step,
    state: i < reached || (i === reached && status === "delivered") ? "done" : i === reached ? "current" : "upcoming",
  }));
};

const Dot = ({ state, index }) => (
  <span
    className={cn(
      "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-card text-xs font-bold",
      state === "done" && "border-primary bg-primary text-primary-foreground",
      state === "current" && "border-primary text-primary ring-4 ring-primary/15",
      state === "upcoming" && "border-border text-muted-foreground",
      state === "cancelled" && "border-destructive bg-destructive text-destructive-foreground"
    )}
  >
    {state === "done" ? <Check className="h-4 w-4" /> : state === "cancelled" ? <X className="h-4 w-4" /> : index + 1}
  </span>
);

Dot.propTypes = { state: PropTypes.string, index: PropTypes.number };

const ParcelTimeline = ({ parcel, orientation = "vertical", className }) => {
  const steps = getTimeline(parcel);

  if (orientation === "horizontal") {
    return (
      <ol className={cn("grid gap-4 sm:gap-2", className)} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, i) => (
          <li key={step.label} className="relative flex flex-col items-center text-center">
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute left-1/2 top-3.5 h-0.5 w-full",
                  steps[i + 1].state === "upcoming" ? "bg-border" : "bg-primary"
                )}
                aria-hidden="true"
              />
            )}
            <Dot state={step.state} index={i} />
            <p className={cn("mt-2 text-xs font-semibold sm:text-sm", step.state === "upcoming" && "text-muted-foreground")}>
              {step.label}
            </p>
            <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{step.detail}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className={cn("space-y-0", className)}>
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
          {i < steps.length - 1 && (
            <span
              className={cn(
                "absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5",
                steps[i + 1].state === "upcoming" ? "bg-border" : "bg-primary"
              )}
              aria-hidden="true"
            />
          )}
          <Dot state={step.state} index={i} />
          <div className="pt-0.5">
            <p className={cn("text-sm font-semibold", step.state === "upcoming" && "text-muted-foreground")}>{step.label}</p>
            <p className="text-xs text-muted-foreground">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};

ParcelTimeline.propTypes = {
  parcel: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf(["vertical", "horizontal"]),
  className: PropTypes.string,
};

export default ParcelTimeline;
