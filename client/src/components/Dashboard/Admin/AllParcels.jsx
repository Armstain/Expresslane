import { useState } from "react";
import toast from "react-hot-toast";
import { add, format, isValid } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Package, Trash2, UserPlus } from "lucide-react";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import { formatDate } from "@/api/utils/dateUtils.js";
import { formatPrice } from "@/lib/parcel.js";
import { cn } from "@/lib/utils";
import AllParcelModal from "@/components/Modal/AllParcelModal.jsx";
import ConfirmDialog from "@/components/Shared/ConfirmDialog.jsx";
import EmptyState from "@/components/Shared/EmptyState.jsx";
import LoadingSpinner from "@/components/Shared/LoadingSpinner.jsx";
import PageHeader from "@/components/Shared/PageHeader.jsx";
import StatusBadge from "@/components/Shared/StatusBadge.jsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "on the way", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const TRANSIT_DAYS = { Express: 1, Regular: 3, International: 7 };

// Default ETA for the assign dialog, in the yyyy-MM-dd format a date input expects
const defaultEta = (parcel) => {
  const base = new Date(parcel.deliveryDate);
  const start = isValid(base) ? base : new Date();
  return format(add(start, { days: TRANSIT_DAYS[parcel.parcelType] ?? 3 }), "yyyy-MM-dd");
};

const AllParcels = () => {
  const axiosSecure = useAxiosSecure();
  const [filter, setFilter] = useState("all");
  const [assigning, setAssigning] = useState(null);
  const [deliveryManId, setDeliveryManId] = useState("");
  const [approximateDeliveryDate, setApproximateDeliveryDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const { data: parcels = [], isLoading, refetch } = useQuery({
    queryKey: ["parcels"],
    queryFn: async () => (await axiosSecure.get("/parcels")).data,
  });

  const { data: deliveryMen = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await axiosSecure.get("/users")).data,
    select: (users) => users.filter((u) => u.role === "DeliveryMen"),
  });

  const { mutate: assignParcel, isPending: saving } = useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosSecure.patch(`/parcel/${id}`, {
        deliveryManId,
        approximateDeliveryDate,
        status: "on the way",
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Rider assigned");
      refetch();
      setAssigning(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: deleteParcel } = useMutation({
    mutationFn: async (id) => (await axiosSecure.delete(`/my-parcel/${id}`)).data,
    onSuccess: () => {
      refetch();
      toast.success("Parcel deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  if (isLoading) return <LoadingSpinner />;

  const openAssign = (parcel) => {
    setAssigning(parcel);
    setDeliveryManId(parcel.deliveryManId || "");
    setApproximateDeliveryDate(defaultEta(parcel));
  };

  const riderName = Object.fromEntries(deliveryMen.map((m) => [m._id, m.displayName || m.email]));
  const counts = parcels.reduce((acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }), {});
  const visible = filter === "all" ? parcels : parcels.filter((p) => p.status === filter);

  return (
    <>
      <PageHeader
        title="Parcels"
        description={`${parcels.length} total · ${counts.pending || 0} waiting for a rider`}
      />

      <Card className="overflow-hidden">
        <div className="flex gap-1 overflow-x-auto border-b p-2" role="tablist" aria-label="Filter by status">
          {FILTERS.map((f) => (
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
              <span className="rounded-full bg-background px-1.5 text-xs tabular-nums">
                {f.value === "all" ? parcels.length : counts[f.value] || 0}
              </span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState icon={Package} title="No parcels here" description="Nothing matches this filter yet." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Customer</TableHead>
                <TableHead>Parcel</TableHead>
                <TableHead>Booked</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((parcel) => (
                <TableRow key={parcel._id}>
                  <TableCell>
                    <p className="font-medium">{parcel.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{parcel.phoneNumber}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{parcel.parcelType}</p>
                    <p className="text-xs text-muted-foreground">{parcel.parcelWeight ? `${parcel.parcelWeight} kg` : ""}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(parcel.createdDate)}</TableCell>
                  <TableCell className="font-medium tabular-nums">{formatPrice(parcel.price)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {parcel.deliveryManId ? riderName[parcel.deliveryManId] || "Assigned" : "Unassigned"}
                  </TableCell>
                  <TableCell><StatusBadge status={parcel.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={parcel.deliveryManId ? "outline" : "default"}
                        disabled={parcel.status === "delivered" || parcel.status === "cancelled"}
                        onClick={() => openAssign(parcel)}
                      >
                        <UserPlus className="h-4 w-4" /> {parcel.deliveryManId ? "Reassign" : "Assign"}
                      </Button>
                      {parcel.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteId(parcel._id)}
                          aria-label="Delete parcel"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AllParcelModal
        isOpen={!!assigning}
        onClose={() => setAssigning(null)}
        parcel={assigning}
        deliveryMen={deliveryMen}
        deliveryManId={deliveryManId}
        setDeliveryManId={setDeliveryManId}
        approximateDeliveryDate={approximateDeliveryDate}
        setApproximateDeliveryDate={setApproximateDeliveryDate}
        onAssign={() => assignParcel(assigning._id)}
        saving={saving}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this parcel?"
        description="The booking will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteParcel(deleteId)}
      />
    </>
  );
};

export default AllParcels;
