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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Delivery Personnel
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Total Delivery Men: {deliveryMenWithStats.length}
          </p>
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {deliveryMan?.photoURL ? (
                          <img
                            src={deliveryMan.photoURL}
                            alt={deliveryMan.displayName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-gray-600">
                            {deliveryMan?.displayName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {deliveryMan.displayName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {deliveryMan.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>{deliveryMan.phoneNumber || "N/A"}</p>
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      {deliveryMan.numDeliveries}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          deliveryMan.averageRating !== "N/A"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {deliveryMan.averageRating}{" "}
                        {deliveryMan.averageRating !== "N/A" && "⭐"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
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
