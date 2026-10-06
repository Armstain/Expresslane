import { useQueries } from "@tanstack/react-query";
import { Bike, Phone, Star } from "lucide-react";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import EmptyState from "@/components/Shared/EmptyState.jsx";
import LoadingSpinner from "@/components/Shared/LoadingSpinner.jsx";
import PageHeader from "@/components/Shared/PageHeader.jsx";
import UserAvatar from "@/components/Shared/UserAvatar.jsx";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AllDeliveryMen = () => {
  const axiosSecure = useAxiosSecure();
  const get = (url) => async () => (await axiosSecure.get(url)).data;

  const [usersQ, parcelsQ, reviewsQ] = useQueries({
    queries: [
      { queryKey: ["users"], queryFn: get("/users") },
      { queryKey: ["parcels"], queryFn: get("/parcels") },
      { queryKey: ["reviews"], queryFn: get("/reviews") },
    ],
  });

  if (usersQ.isLoading || parcelsQ.isLoading) return <LoadingSpinner />;

  const parcels = parcelsQ.data || [];
  const reviews = reviewsQ.data || [];
  const deliveryMen = (usersQ.data || [])
    .filter((u) => u.role === "DeliveryMen")
    .map((man) => {
      const assigned = parcels.filter((p) => p.deliveryManId === man._id);
      const own = reviews.filter((r) => r.deliveryManId === man._id);
      return {
        ...man,
        assigned: assigned.length,
        delivered: assigned.filter((p) => p.status === "delivered").length,
        reviewCount: own.length,
        averageRating: own.length
          ? own.reduce((sum, r) => sum + Number(r.rating || 0), 0) / own.length
          : null,
      };
    })
    .sort((a, b) => b.delivered - a.delivered);

  return (
    <>
      <PageHeader title="Delivery men" description={`${deliveryMen.length} delivery partners on the team.`} />

      <Card className="overflow-hidden">
        {deliveryMen.length === 0 ? (
          <EmptyState
            icon={Bike}
            title="No delivery men yet"
            description="Promote a user to delivery partner from the Users page."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryMen.map((man) => (
                <TableRow key={man._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar src={man.photoURL} name={man.displayName} email={man.email} className="h-9 w-9" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{man.displayName || "—"}</p>
                        <p className="truncate text-xs text-muted-foreground">{man.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {man.phoneNumber ? (
                      <a href={`tel:${man.phoneNumber}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                        <Phone className="h-3.5 w-3.5" /> {man.phoneNumber}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{man.assigned}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{man.delivered}</TableCell>
                  <TableCell>
                    {man.averageRating ? (
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{man.averageRating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({man.reviewCount})</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No reviews</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
};

export default AllDeliveryMen;
