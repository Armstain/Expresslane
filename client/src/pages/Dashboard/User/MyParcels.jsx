import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronRight, CreditCard, Package, PackagePlus, Star, X } from "lucide-react";
import useAuth from "@/hooks/useAuth.jsx";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import { calculateApproximateDeliveryDate, formatDate } from "@/api/utils/dateUtils.js";
import { formatPrice } from "@/lib/parcel.js";
import { cn } from "@/lib/utils";
import ReviewModal from "@/components/Modal/ReviewModal.jsx";
import ParcelDetailsSheet from "@/components/Parcel/ParcelDetailsSheet.jsx";
import PaymentModal from "@/components/Modal/PaymentModal.jsx";
import ConfirmDialog from "@/components/Shared/ConfirmDialog.jsx";
import EmptyState from "@/components/Shared/EmptyState.jsx";
import LoadingSpinner from "@/components/Shared/LoadingSpinner.jsx";
import PageHeader from "@/components/Shared/PageHeader.jsx";
import StatusBadge from "@/components/Shared/StatusBadge.jsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Created once per app load, not on every render
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "on the way", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const MyParcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [filter, setFilter] = useState("all");
  const [cancelId, setCancelId] = useState(null);
  const [reviewParcel, setReviewParcel] = useState(null);
  const [payParcel, setPayParcel] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [detailParcel, setDetailParcel] = useState(null);

  const { data: parcels = [], isLoading, refetch } = useQuery({
    queryKey: ["my-parcel", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/my-parcel/${user?.email}`);
      return data;
    },
  });

  const { mutate: cancelParcel } = useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosSecure.delete(`/my-parcel/${id}`);
      return data;
    },
    onSuccess: () => {
      refetch();
      toast.success("Booking cancelled");
    },
    onError: (error) => toast.error(error.message),
  });

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => setPaymentSuccess(false), 6000);
  };

  if (isLoading) return <LoadingSpinner />;

  const renderActions = (parcel) => (
    <>
      {parcel.status === "pending" && (
        <Button size="sm" variant="outline" onClick={() => setCancelId(parcel._id)}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      )}
      {parcel.status === "delivered" && (
        <>
          <Button size="sm" variant="outline" onClick={() => setReviewParcel(parcel)}>
            <Star className="h-4 w-4" /> Review
          </Button>
          <Button size="sm" onClick={() => setPayParcel(parcel)} disabled={!stripePromise}>
            <CreditCard className="h-4 w-4" /> Pay
          </Button>
        </>
      )}
    </>
  );

  const eta = (parcel) =>
    parcel.approximateDeliveryDate
      ? formatDate(parcel.approximateDeliveryDate)
      : calculateApproximateDeliveryDate(parcel.parcelType, parcel.deliveryDate);

  const counts = parcels.reduce((acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }), {});
  const visible = filter === "all" ? parcels : parcels.filter((p) => p.status === filter);

  return (
    <>
      {paymentSuccess && <Confetti recycle={false} numberOfPieces={350} />}
      <PageHeader
        title="My parcels"
        description="Track bookings, pay for delivered parcels and leave reviews."
        actions={
          <Button asChild>
            <Link to="/dashboard/book-parcel">
              <PackagePlus className="h-4 w-4" /> Book a parcel
            </Link>
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {parcels.length > 0 && (
          <div className="flex gap-1 overflow-x-auto border-b p-2" role="tablist" aria-label="Filter by status">
            {FILTERS.map((f) => {
              const count = f.value === "all" ? parcels.length : counts[f.value] || 0;
              return (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={filter === f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    filter === f.value ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                  <span className="rounded-full bg-background px-1.5 text-xs tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {visible.length === 0 ? (
          <EmptyState
            icon={Package}
            title={parcels.length ? "No parcels with this status" : "No parcels yet"}
            description={parcels.length ? "Try a different filter." : "Book your first parcel and it will show up here."}
            action={
              !parcels.length && (
                <Button asChild>
                  <Link to="/dashboard/book-parcel">Book a parcel</Link>
                </Button>
              )
            }
          />
        ) : (
          <>
          {/* Phones: one card per parcel */}
          <ul className="divide-y md:hidden">
            {visible.map((parcel) => (
              <li key={parcel._id} className="space-y-3 p-4">
                <button
                  type="button"
                  onClick={() => setDetailParcel(parcel)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div>
                    <p className="font-medium">{parcel.parcelType} · {formatPrice(parcel.price)}</p>
                    <p className="text-sm text-muted-foreground">To {parcel.recipientName || "—"}</p>
                  </div>
                  <StatusBadge status={parcel.status} />
                </button>
                <dl className="grid grid-cols-3 gap-2 text-xs">
                  <div><dt className="text-muted-foreground">Booked</dt><dd className="font-medium">{formatDate(parcel.createdDate)}</dd></div>
                  <div><dt className="text-muted-foreground">Pickup</dt><dd className="font-medium">{formatDate(parcel.deliveryDate)}</dd></div>
                  <div><dt className="text-muted-foreground">Est. arrival</dt><dd className="font-medium">{eta(parcel)}</dd></div>
                </dl>
                {(parcel.status === "pending" || parcel.status === "delivered") && (
                  <div className="flex gap-2 [&>*]:flex-1">{renderActions(parcel)}</div>
                )}
              </li>
            ))}
          </ul>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Parcel</TableHead>
                <TableHead>Booked</TableHead>
                <TableHead>Pickup date</TableHead>
                <TableHead>Est. arrival</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((parcel) => (
                <TableRow key={parcel._id} className="cursor-pointer" onClick={() => setDetailParcel(parcel)}>
                  <TableCell>
                    <p className="font-medium">{parcel.parcelType}</p>
                    <p className="text-xs text-muted-foreground">
                      To {parcel.recipientName || "—"} · {formatPrice(parcel.price)}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(parcel.createdDate)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(parcel.deliveryDate)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {eta(parcel)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {parcel.deliveryManId ? "Assigned" : "Not yet"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={parcel.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {renderActions(parcel)}
                      <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setDetailParcel(parcel)} aria-label="View details">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
        title="Cancel this booking?"
        description="The parcel will be removed and no rider will be assigned. This can't be undone."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        destructive
        onConfirm={() => cancelParcel(cancelId)}
      />
      <ParcelDetailsSheet
        parcel={detailParcel}
        open={!!detailParcel}
        onOpenChange={(open) => !open && setDetailParcel(null)}
        actions={detailParcel && (detailParcel.status === "pending" || detailParcel.status === "delivered") ? renderActions(detailParcel) : null}
        onAction={() => setDetailParcel(null)}
      />
      <ReviewModal isOpen={!!reviewParcel} onClose={() => setReviewParcel(null)} parcel={reviewParcel} />
      <PaymentModal
        isOpen={!!payParcel}
        closeModal={() => setPayParcel(null)}
        parcel={payParcel}
        stripePromise={stripePromise}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default MyParcels;
