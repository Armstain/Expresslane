import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import { TbFidgetSpinner } from "react-icons/tb";

const AllDeliveryMen = () => {
  const axiosSecure = useAxiosSecure();

  // Fetch all delivery men
  const { data: allDeliveryMen = [], isLoading: isLoadingDeliveryMen } =
    useQuery({
      queryKey: ["delivery-men"],
      queryFn: async () => {
        const res = await axiosSecure.get("/users?");
        return res.data.filter((user) => user.role === "DeliveryMen");
      },
    });

  // Fetch all deliveries
  const { data: allDeliveries = [], isLoading: isLoadingDeliveries } = useQuery(
    {
      queryKey: ["parcels"],
      queryFn: async () => {
        const res = await axiosSecure.get("/parcels");
        return res.data;
      },
    }
  );

  // Fetch all reviews
  const { data: allReviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await axiosSecure.get("/reviews");
      return res.data;
    },
  });

  if (isLoadingDeliveryMen || isLoadingDeliveries) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <TbFidgetSpinner className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Calculate number of deliveries and average rating for each delivery man
  const deliveryMenWithStats = allDeliveryMen.map((deliveryMan) => {
    const deliveries = allDeliveries.filter(
      (delivery) => delivery.deliveryManId === deliveryMan._id
    );
    const numDeliveries = deliveries.length;

    const reviews = allReviews.filter(
      (review) => review.deliveryManId === deliveryMan._id
    );
    const averageRating =
      reviews.length > 0
        ? (
            reviews.reduce((acc, review) => acc + review.rating, 0) /
            reviews.length
          ).toFixed(2)
        : "N/A";

    return {
      ...deliveryMan,
      numDeliveries,
      averageRating,
    };
  });

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white">Delivery Personnel</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-blue-100">
              Total Delivery Men: {deliveryMenWithStats.length}
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-100"></span>
            <p className="text-blue-100">
              Active:{" "}
              {
                deliveryMenWithStats.filter((dm) => dm.status === "active")
                  .length
              }
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Deliveries</TableHead>
                <TableHead className="font-semibold">Rating</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryMenWithStats.map((deliveryMan) => (
                <TableRow
                  key={deliveryMan._id}
                  className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white overflow-hidden">
                        {deliveryMan?.photoURL ? (
                          <img
                            src={deliveryMan.photoURL}
                            alt={deliveryMan.displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold">
                            {deliveryMan?.displayName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {deliveryMan.displayName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {deliveryMan.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-600 dark:text-gray-300">
                      {deliveryMan.phoneNumber || "N/A"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 font-medium">
                      {deliveryMan.numDeliveries}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-3 py-1.5 rounded-full font-medium ${
                          deliveryMan.averageRating !== "N/A"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {deliveryMan.averageRating}
                        {deliveryMan.averageRating !== "N/A" && "⭐"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 font-medium">
                      Active
                    </span>
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

export default AllDeliveryMen;
