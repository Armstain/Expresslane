import PropTypes from "prop-types";
import { CalendarClock, MapPin, Package, Phone, Scale, UserRound } from "lucide-react";
import { calculateApproximateDeliveryDate, formatDate } from "@/api/utils/dateUtils.js";
import { formatPrice } from "@/lib/parcel.js";
import StatusBadge from "@/components/Shared/StatusBadge.jsx";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import ParcelTimeline from "./ParcelTimeline.jsx";

const Row = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 py-2.5">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <span className="w-24 shrink-0 text-sm text-muted-foreground">{label}</span>
    <span className="min-w-0 flex-1 text-sm font-medium">{children}</span>
  </div>
);

Row.propTypes = { icon: PropTypes.elementType, label: PropTypes.string, children: PropTypes.node };

// Slide-over with the full tracking view of one parcel
const ParcelDetailsSheet = ({ parcel, open, onOpenChange, actions, onAction }) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
      {parcel && (
        <>
          <div className="border-b p-6 pr-12">
            <div className="flex items-center gap-3">
              <SheetTitle>{parcel.parcelType} parcel</SheetTitle>
              <StatusBadge status={parcel.status} />
            </div>
            <SheetDescription className="mt-1 font-mono text-xs">
              #{String(parcel._id).slice(-8).toUpperCase()}
            </SheetDescription>
          </div>

          <div className="flex-1 space-y-8 p-6">
            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking</h3>
              <ParcelTimeline parcel={parcel} />
            </section>

            <section>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recipient</h3>
              <div className="divide-y">
                <Row icon={UserRound} label="Name">{parcel.recipientName || "—"}</Row>
                <Row icon={Phone} label="Phone">
                  {parcel.recipientPhoneNumber ? (
                    <a href={`tel:${parcel.recipientPhoneNumber}`} className="text-primary hover:underline">
                      {parcel.recipientPhoneNumber}
                    </a>
                  ) : (
                    "—"
                  )}
                </Row>
                <Row icon={MapPin} label="Address">{parcel.recipientAddress || "—"}</Row>
              </div>
            </section>

            <section>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipment</h3>
              <div className="divide-y">
                <Row icon={Package} label="Service">{parcel.parcelType}</Row>
                <Row icon={Scale} label="Weight">{parcel.parcelWeight ? `${parcel.parcelWeight} kg` : "—"}</Row>
                <Row icon={CalendarClock} label="Pickup">{formatDate(parcel.deliveryDate)}</Row>
                <Row icon={CalendarClock} label="Est. arrival">
                  {parcel.approximateDeliveryDate
                    ? formatDate(parcel.approximateDeliveryDate)
                    : calculateApproximateDeliveryDate(parcel.parcelType, parcel.deliveryDate)}
                </Row>
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 border-t bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold tabular-nums">{formatPrice(parcel.price)}</span>
            </div>
            {actions && (
              <div className="mt-4 flex gap-2 [&>*]:flex-1" onClickCapture={onAction}>
                {actions}
              </div>
            )}
          </div>
        </>
      )}
    </SheetContent>
  </Sheet>
);

ParcelDetailsSheet.propTypes = {
  parcel: PropTypes.object,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func.isRequired,
  actions: PropTypes.node,
  // called before an action button runs, e.g. to close the sheet first
  onAction: PropTypes.func,
};

export default ParcelDetailsSheet;
