import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import UpdateUserModal from "@/components/Modal/UpdateUserModal.jsx";
import { ROLE_LABEL } from "@/components/Dashboard/Sidebar/navigation.js";
import EmptyState from "@/components/Shared/EmptyState.jsx";
import LoadingSpinner from "@/components/Shared/LoadingSpinner.jsx";
import PageHeader from "@/components/Shared/PageHeader.jsx";
import UserAvatar from "@/components/Shared/UserAvatar.jsx";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROLE_BADGE = { admin: "default", DeliveryMen: "info", user: "secondary" };

const AllUsers = () => {
  const axiosSecure = useAxiosSecure();
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await axiosSecure.get("/users")).data,
  });

  const { data: parcels = [] } = useQuery({
    queryKey: ["parcels"],
    queryFn: async () => (await axiosSecure.get("/parcels")).data,
  });

  const { mutateAsync } = useMutation({
    mutationFn: async ({ _id, role }) => {
      const { data } = await axiosSecure.patch(`/users/update/${_id}`, { role });
      return data;
    },
    onSuccess: () => {
      refetch();
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });

  if (isLoading) return <LoadingSpinner />;

  const bookedBy = parcels.reduce((acc, p) => ({ ...acc, [p.email]: (acc[p.email] || 0) + 1 }), {});
  const term = search.trim().toLowerCase();
  const visible = term
    ? users.filter((u) => `${u.displayName} ${u.email}`.toLowerCase().includes(term))
    : users;

  return (
    <>
      <PageHeader title="Users" description={`${users.length} registered accounts.`} />

      <Card className="overflow-hidden">
        <div className="border-b p-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="pl-9"
              aria-label="Search users"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Try a different search." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Parcels booked</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar src={u.photoURL} name={u.displayName} email={u.email} className="h-9 w-9" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.displayName || "—"}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.phoneNumber || "—"}</TableCell>
                  <TableCell className="tabular-nums">{bookedBy[u.email] || 0}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGE[u.role] || "secondary"}>{ROLE_LABEL[u.role] || u.role || "—"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <UpdateUserModal user={u} onUpdate={(_id, role) => mutateAsync({ _id, role })} />
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

export default AllUsers;
