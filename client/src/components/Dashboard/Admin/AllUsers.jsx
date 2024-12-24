import { Helmet } from "react-helmet-async";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import UpdateUserModal from "@/components/Modal/UpdateUserModal.jsx";
import useAuth from "@/hooks/useAuth.jsx";
import toast from "react-hot-toast";

const AllUsers = () => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useAuth();

  const { mutateAsync } = useMutation({
    mutationFn: async (updatedUserData) => {
      const { data } = await axiosSecure.patch(
        `/users/update/${updatedUserData._id}`,
        { role: updatedUserData.role }
      );
      return data;
    },
    onSuccess: () => {
      refetch();
      toast.success("Role updated successfully");
    },
  });

  const handleUpdateRole = async (userId, role) => {
    try {
      await mutateAsync({ _id: userId, role });
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const {
    data: users = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axiosSecure(`/users`);
      return data;
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoaderCircle className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8">
      <Helmet>
        <title>Manage Users</title>
      </Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-blue-100 mt-2">Total Users: {users.length}</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Phone Number</TableHead>
                <TableHead className="font-semibold">Parcel Booked</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user?._id}
                  className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white overflow-hidden">
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold">
                            {user?.displayName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{user?.displayName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.phoneNumber || "-"}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      {user.parcelBooked || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "DeliveryMen"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <UpdateUserModal user={user} onUpdate={handleUpdateRole} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
