import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import toast from "react-hot-toast";
import DeleteModal from "@/components/Modal/DeleteModal.jsx";
import AllParcelModal from "@/components/Modal/AllParcelModal.jsx";
import { Button } from "@/components/ui/button";
import { calculateApproximateDeliveryDate } from "@/api/utils/dateUtils.js";
import LoadingSpinner from "@/components/Shared/LoadingSpinner.jsx";

const AllParcels = () => {
  const axiosSecure = useAxiosSecure();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [parcelToUpdate, setParcelToUpdate] = useState(null);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState(null);
  const [approximateDeliveryDate, setApproximateDeliveryDate] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { mutateAsync: updateParcel } = useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosSecure.patch(`/parcel/${id}`, {
        deliveryManId: selectedDeliveryMan,
        approximateDeliveryDate,
        status: "on the way",
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Parcel assigned successfully");
      refetch();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutateAsync: deleteParcel } = useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosSecure.delete(`/my-parcel/${id}`);
      return data;
    },
    onSuccess: () => {
      refetch();
      toast.success("Parcel deleted successfully");
      setIsDeleteOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // eslint-disable-next-line no-unused-vars
  const { data: allDeliveryMen = [], isLoading: isDeliveryMenLoading } =
    useQuery({
      queryKey: ["DeliveryMen"],
      queryFn: async () => {
        const res = await axiosSecure.get("/users");

        return res.data.filter((user) => user.role === "DeliveryMen");
      },
    });

  const {
    data: parcels = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["parcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/parcels");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  const handleManageClick = (parcel) => {
    setParcelToUpdate(parcel);
    setApproximateDeliveryDate(
      calculateApproximateDeliveryDate(parcel.parcelType, parcel.deliveryDate)
    );
    setIsOpen(true);
  };

  const handleAssignParcel = async (parcel) => {
    await updateParcel(parcel._id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteParcel(id);
    } catch (error) {
      console.log(error);
    }
  };

  const closeModal = () => {
    setIsDeleteOpen(false);
    setIsOpen(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white">Parcel Management</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-blue-100">Total Parcels: {parcels.length}</p>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-100"></span>
            <p className="text-blue-100">
              Pending: {parcels.filter((p) => p.status === "pending").length}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Phone Number</TableHead>
                <TableHead className="font-semibold">Parcel Type</TableHead>
                <TableHead className="font-semibold">Booking Date</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Delivery Man</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcels.map((parcel) => (
                <TableRow
                  key={parcel._id}
                  className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                    {parcel.name}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {parcel.phoneNumber}
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 font-medium">
                      {parcel.parcelType}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {format(new Date(parcel.createdDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      ${parcel.price}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {parcel.deliveryManId || "Not Assigned"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1.5 rounded-full font-medium ${
                        parcel.status === "delivered"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                          : parcel.status === "on the way"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {parcel.status}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      disabled={parcel.status === "delivered"}
                      onClick={() => handleManageClick(parcel)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105"
                    >
                      Manage
                    </Button>
                    {parcel.status === "pending" && (
                      <Button
                        onClick={() => {
                          setSelectedParcelId(parcel._id);
                          setIsDeleteOpen(true);
                        }}
                        variant="destructive"
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 transform hover:scale-105"
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Parcel Management Modal */}
      {parcelToUpdate && (
        <AllParcelModal
          isOpen={isOpen}
          onClose={closeModal}
          parcelToUpdate={parcelToUpdate}
          allDeliveryMen={allDeliveryMen}
          setSelectedDeliveryMan={setSelectedDeliveryMan}
          setApproximateDeliveryDate={setApproximateDeliveryDate}
          handleAssignParcel={handleAssignParcel}
          selectedDeliveryMan={selectedDeliveryMan}
          approximateDeliveryDate={approximateDeliveryDate}
        />
      )}
    </div>
  );
};

export default AllParcels;
