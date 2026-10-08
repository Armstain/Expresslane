import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Package, PackagePlus, Truck, Wallet } from "lucide-react";
import useAuth from "@/hooks/useAuth.jsx";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import { formatDate } from "@/api/utils/dateUtils.js";
import { formatPrice } from "@/lib/parcel.js";
import ParcelDetailsSheet from "@/components/Parcel/ParcelDetailsSheet.jsx";
import ParcelTimeline from "@/components/Parcel/ParcelTimeline.jsx";
import EmptyState from "@/components/Shared/EmptyState.jsx";
import LoadingSpinner from "@/components/Shared/LoadingSpinner.jsx";
import PageHeader from "@/components/Shared/PageHeader.jsx";
import StatCard from "@/components/Shared/StatCard.jsx";
import StatusBadge from "@/components/Shared/StatusBadge.jsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Overview = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [detailParcel, setDetailParcel] = useState(null);

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ["my-parcel", user?.email],
    enabled: !!user?.email,
    queryFn: async () => (await axiosSecure.get(`/my-parcel/${user?.email}`)).data,
  });

  if (isLoading) return <LoadingSpinner />;

  const firstName = user?.displayName?.split(" ")[0];
  const recent = [...parcels].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  const inTransit = parcels.filter((p) => p.status === "on the way");
  const pending = parcels.filter((p) => p.status === "pending");
  const delivered = parcels.filter((p) => p.status === "delivered");
  const spent = delivered.reduce((sum, p) => sum + Number(p.price || 0), 0);
  // Spotlight the parcel the customer most likely cares about right now
  const spotlight =
    recent.find((p) => p.status === "on the way") || recent.find((p) => p.status === "pending");

  return (
    <>
      <PageHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Here's what's happening with your parcels."
        actions={
          <Button asChild>
            <Link to="/dashboard/book-parcel">
              <PackagePlus className="h-4 w-4" /> Book a parcel
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total parcels" value={parcels.length} icon={Package} />
        <StatCard label="In transit" value={inTransit.length} icon={Truck} hint={pending.length ? `${pending.length} awaiting a rider` : undefined} />
        <StatCard label="Delivered" value={delivered.length} icon={CheckCircle2} />
        <StatCard label="Delivered value" value={formatPrice(spent)} icon={Wallet} />
      </div>

      {parcels.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No parcels yet"
            description="Book your first parcel and you'll be able to follow it here, step by step."
            action={
              <Button asChild>
                <Link to="/dashboard/book-parcel">Book your first parcel</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="p-5 sm:p-6">
            {spotlight ? (
              <>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active shipment</p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {spotlight.parcelType} parcel to {spotlight.recipientName || "recipient"}
                    </h2>
                    <p className="text-sm text-muted-foreground">{spotlight.recipientAddress}</p>
                  </div>
                  <StatusBadge status={spotlight.status} />
                </div>
                <ParcelTimeline parcel={spotlight} orientation="horizontal" />
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setDetailParcel(spotlight)}>
                    View details <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Nothing in transit"
                description="All your parcels have been delivered. Time to send another?"
                className="py-8"
              />
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold">Recent parcels</h2>
              <Link to="/dashboard/my-parcels" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <ul className="divide-y">
              {recent.slice(0, 5).map((parcel) => (
                <li key={parcel._id}>
                  <button
                    type="button"
                    onClick={() => setDetailParcel(parcel)}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">To {parcel.recipientName || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {parcel.parcelType} · {formatDate(parcel.createdDate)}
                      </p>
                    </div>
                    <StatusBadge status={parcel.status} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <ParcelDetailsSheet
        parcel={detailParcel}
        open={!!detailParcel}
        onOpenChange={(open) => !open && setDetailParcel(null)}
      />
    </>
  );
};

export default Overview;
