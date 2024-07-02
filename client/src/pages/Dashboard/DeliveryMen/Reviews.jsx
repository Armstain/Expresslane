
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAuth from "@/hooks/useAuth";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { format } from "date-fns";
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx';


const Reviews = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const [deliveryManId, setDeliveryManId] = useState(null);

    // 1. Fetch delivery man details to get the ID
    const { isLoading: deliveryManLoading } = useQuery({
        queryKey: ['delivery-man', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/user/${user?.email}`);
            setDeliveryManId(res.data._id); // Store the deliveryManId in state
        },
    });

    // 2. Fetch reviews based on deliveryManId (enable after deliveryManId is fetched)
    const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
        queryKey: ['my-reviews', deliveryManId],
        enabled: !!deliveryManId, // Only fetch when deliveryManId is available
        queryFn: async () => {
            const res = await axiosSecure.get(`/reviews/delivery-man/${deliveryManId}`);
            return res.data;
        },
    });

    if (deliveryManLoading || reviewsLoading) {
        return <LoadingSpinner></LoadingSpinner>;
    }


    return (
        <div className="container mx-auto mt-12">
            <h1 className="text-3xl font-bold mb-8 text-center">My Reviews</h1>

            {reviews.length === 0 ? (
                <p className="text-center text-gray-500">No reviews yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div key={review._id} className="border shadow-md rounded-lg p-4">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 overflow-hidden rounded-full mr-4">
                                    <img className="w-full h-full object-cover" src={review.reviewerImage} alt={review.reviewerName} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{review.reviewerName}</h2>
                                    <p className="text-sm text-gray-500">{format(new Date(review.reviewDate), 'dd/MM/yyyy')}</p>
                                </div>
                            </div>
                            <div className="mb-4">
                                <Rating value={review.rating} readOnly style={{ maxWidth: 120 }} />
                            </div>
                            <p className="text-gray-700">{review.feedback}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
};

export default Reviews;
