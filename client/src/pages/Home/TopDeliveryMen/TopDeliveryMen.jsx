import { axiosSecure } from "@/hooks/useAxiosSecure.jsx";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { TbFidgetSpinner } from "react-icons/tb";

const TopDeliveryMen = () => {
  const [deliveryMen, setDeliveryMen] = useState([]);

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

  if (isLoadingDeliveryMen || isLoadingDeliveries || isLoadingReviews) {
    return <TbFidgetSpinner className="w-8 h-8 animate-spin" />;
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
  const topDeliveryMen = deliveryMenWithStats
    .sort((a, b) => {
      if (b.numDeliveries !== a.numDeliveries) {
        return b.numDeliveries - a.numDeliveries;
      } else {
        return b.averageRating - a.averageRating;
      }
    })
    .slice(0, 3);

  const renderDeliveryManCard = (man) => (
    <div
      key={man._id}
      className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm mx-auto transform transition-all hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:text-white"
    >
      <div className="relative">
        <img
          src={man.photoURL || "https://placehold.co/200"}
          alt={man.displayName}
          className="rounded-full w-32 h-32 mx-auto object-cover border-4 border-blue-500"
        />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
          Top Performer
        </div>
      </div>
      <div className="text-center mt-8">
        <h3 className="text-2xl font-bold mb-2">{man.displayName}</h3>
        <div className="flex justify-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-500">
              {man.numDeliveries}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deliveries
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-500">
              {man.averageRating}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-16 bg-gray-50 dark:bg-[#020817]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Our Top <span className="text-blue-500">Delivery Heroes</span>
        </h2>
        {deliveryMenWithStats.length === 0 ? (
          <p>No delivery men found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {topDeliveryMen.map(renderDeliveryManCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopDeliveryMen;
