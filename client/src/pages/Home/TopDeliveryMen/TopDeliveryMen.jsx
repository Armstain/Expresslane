import { axiosSecure } from '@/hooks/useAxiosSecure.jsx';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { TbFidgetSpinner } from 'react-icons/tb';

const TopDeliveryMen = () => {
    const [deliveryMen, setDeliveryMen] = useState([]);

    // Fetch all delivery men
    const { data: allDeliveryMen = [], isLoading: isLoadingDeliveryMen } = useQuery({
        queryKey: ['delivery-men'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users?');
            return res.data.filter(user => user.role === 'DeliveryMen');
        }
    });

    // Fetch all deliveries
    const { data: allDeliveries = [], isLoading: isLoadingDeliveries } = useQuery({
        queryKey: ['parcels'],
        queryFn: async () => {
            const res = await axiosSecure.get('/parcels');
            return res.data;
        }
    });

    // Fetch all reviews
    const { data: allReviews = [], isLoading: isLoadingReviews } = useQuery({
        queryKey: ['reviews'],
        queryFn: async () => {
            const res = await axiosSecure.get('/reviews');
            return res.data;
        }
    });

    if (isLoadingDeliveryMen || isLoadingDeliveries || isLoadingReviews) {
        return <TbFidgetSpinner className="w-8 h-8 animate-spin" />;


    }

    // Calculate number of deliveries and average rating for each delivery man
    const deliveryMenWithStats = allDeliveryMen.map(deliveryMan => {
        const deliveries = allDeliveries.filter(delivery => delivery.deliveryManId === deliveryMan._id);
        const numDeliveries = deliveries.length;

        const reviews = allReviews.filter(review => review.deliveryManId === deliveryMan._id);
        const averageRating = reviews.length > 0
            ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(2)
            : 'N/A';

        return {
            ...deliveryMan,
            numDeliveries,
            averageRating
        };
    });
    const topDeliveryMen = deliveryMenWithStats.sort((a, b) => {

            if (b.numDeliveries !== a.numDeliveries) {
                return b.numDeliveries - a.numDeliveries;
            } else {
                return b.averageRating - a.averageRating;
            }
        })
        .slice(0, 3);

    const renderDeliveryManCard = (man) => (
        <div key={man._id} className="bg-white shadow-md rounded-lg p-6 w-64 dark:bg-gray-800 dark:text-white">
            <img
                src={man.photoURL || "https://placehold.co/200"}
                alt={man.displayName}
                className="rounded-full w-24 h-24 mx-auto"
            />
            <h3 className="mt-4 text-xl font-semibold">{man.displayName}</h3>
            <p className="mt-2 dark:text-white">Parcels Delivered: {man.numDeliveries}</p>
            <p className="mt-2 dark:text-white">Avg. Rating: {man.averageRating}</p>
        </div>
    );


    return (
        <div className="text-center my-8">
            <h2 className="text-3xl font-bold mb-6">Top Delivery Men</h2>


            {deliveryMenWithStats.length === 0 ? (
                <p>No delivery men found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {topDeliveryMen.map(renderDeliveryManCard)}
                </div>
            )}
        </div>
    );
};

export default TopDeliveryMen;