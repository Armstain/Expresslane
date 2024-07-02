import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import { TbFidgetSpinner } from "react-icons/tb";

const AllDeliveryMen = () => {
    const axiosSecure = useAxiosSecure();

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

    if (isLoadingDeliveryMen || isLoadingDeliveries) {
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

    return (
        <div className="container mx-auto mt-12">
            <h2 className="text-2xl font-bold mb-4">All Delivery Men</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Number of Deliveries</TableHead>
                        <TableHead>Average Rating</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deliveryMenWithStats.map(deliveryMan => (
                        <TableRow key={deliveryMan._id}>
                            <TableCell className="font-medium">{deliveryMan.displayName || 'N/A'}</TableCell>
                            <TableCell>{deliveryMan.phoneNumber || 'N/A'}</TableCell>
                            <TableCell>{deliveryMan.numDeliveries}</TableCell>
                            <TableCell>{deliveryMan.averageRating}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AllDeliveryMen;
