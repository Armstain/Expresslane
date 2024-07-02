
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns';
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import { TbFidgetSpinner } from "react-icons/tb";
import useAuth from "@/hooks/useAuth.jsx";
import { Link } from "react-router-dom";
import DeleteModal from "@/components/Modal/DeleteModal.jsx";
import { useState } from "react";
import toast from "react-hot-toast";
import { calculateApproximateDeliveryDate } from "@/api/utils/dateUtils.js";
import ReviewModal from "@/components/Modal/ReviewModal.jsx";
import { loadStripe } from '@stripe/stripe-js';

import PaymentModal from "@/components/Modal/PaymentModal.jsx";
import Confetti from 'react-confetti';
import LoadingSpinner from "@/components/Shared/LoadingSpinner.jsx";
const MyParcels = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedParcelId, setSelectedParcelId] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedParcelForReview, setSelectedParcelForReview] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    // const [reviewedParcels, setReviewedParcels] = useState(new Set());
    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);


    const { data: parcel = [], isLoading, refetch } = useQuery({
        queryKey: ['my-parcel', user?.email],
        queryFn: async () => {
            const { data } = await axiosSecure.get(`/my-parcel/${user?.email}`);
            return data;
        },
    });

    const handleOpenReviewModal = (parcel) => {
        setSelectedParcelForReview(parcel);
        setIsReviewOpen(true);
    };

    const handleCloseReviewModal = () => {
        setIsReviewOpen(false);
        setSelectedParcelForReview(null);
    };
    const openPaymentModal = (parcel) => {
        setSelectedParcel(parcel);
        setIsPaymentModalOpen(true);
    };

    const closePaymentModal = () => setIsPaymentModalOpen(false);

    // const handleReview = (parcelId) => {
    //     // Mark the parcel as reviewed
    //     setReviewedParcels((prevReviewedParcels) => new Set(prevReviewedParcels.add(parcelId)));
    // };

    // delete function
    const { mutateAsync } = useMutation({
        mutationFn: async (id) => {
            const { data } = await axiosSecure.delete(`/my-parcel/${id}`);
            return data;
        },
        onSuccess: () => {
            refetch();
            toast.success('Parcel deleted successfully');
            setIsOpen(false);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    // handle delete
    const handleDelete = async (id) => {
        try {
            await mutateAsync(id);
        } catch (error) {
            console.log(error);
        }
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const openModal = (id) => {
        setSelectedParcelId(id);
        setIsOpen(true);
    };

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner>
    }

    return (
        <>{paymentSuccess && <Confetti />}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Parcel Type</TableHead>
                        <TableHead>Requested Delivery Date</TableHead>
                        <TableHead>Approximate Delivery Date</TableHead>
                        <TableHead>Booking Date</TableHead>
                        <TableHead>Delivery Man ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parcel.map((parcel) => (
                        <TableRow key={parcel._id}>
                            <TableCell className="font-medium">{parcel.parcelType}</TableCell>
                            <TableCell>
                                {parcel.deliveryDate
                                    ? format(new Date(parcel.deliveryDate), 'dd/MM/yyyy')
                                    : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {calculateApproximateDeliveryDate(parcel?.parcelType, parcel?.deliveryDate)}
                            </TableCell>
                            <TableCell>{format(new Date(parcel.createdDate), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{parcel.deliveryManId || 'N/A'}</TableCell>
                            <TableCell>{parcel.status}</TableCell>
                            <TableCell className='space-x-2'>
                                {parcel.status === 'pending' && (
                                    <>
                                        <Link to='/dashboard/book-parcel' >
                                            <Button variant="outline">Update</Button>
                                        </Link>
                                        <Button onClick={() => openModal(parcel._id)} variant="destructive">Cancel</Button>
                                    </>
                                )}
                                <div className="flex gap-2">
                                    {parcel.status === 'delivered' && (
                                        <Button variant="outline" onClick={() => handleOpenReviewModal(parcel)}>Review</Button>
                                    )}
                                    {/* payment button */}
                                    <Button
                                        disabled={parcel.status !== 'delivered'}
                                        onClick={() => openPaymentModal(parcel)}
                                    >
                                        Pay
                                    </Button>

                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {isOpen && (
                <DeleteModal
                    isOpen={isOpen}
                    closeModal={closeModal}
                    handleDelete={handleDelete}
                    id={selectedParcelId}
                    parcel={selectedParcel}
                />
            )}
            <ReviewModal
                isOpen={isReviewOpen}
                onClose={handleCloseReviewModal}
                parcel={selectedParcelForReview}
            />
            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                closeModal={closePaymentModal}
                parcel={selectedParcel}
                stripePromise={stripePromise}
                setPaymentSuccess={setPaymentSuccess}
            />
        </>
    )
}

export default MyParcels;
