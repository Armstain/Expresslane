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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Parcel Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Total Parcels: {parcels.length}
          </p>
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <TableCell className="font-medium">{parcel.name}</TableCell>
                  <TableCell>{parcel.phoneNumber}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      {parcel.parcelType}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(parcel.createdDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>${parcel.price}</TableCell>
                  <TableCell>
                    {parcel.deliveryManId || "Not Assigned"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-5 py-1 rounded-full ${
                        parcel.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : parcel.status === "on the way"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {parcel.status}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      disabled={parcel.status === "delivered"}
                      onClick={() => handleManageClick(parcel)}
                      className="bg-blue-500 hover:bg-blue-600"
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
                        className="bg-red-500 hover:bg-red-600 my-2"
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
