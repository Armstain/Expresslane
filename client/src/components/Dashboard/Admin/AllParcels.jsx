

import { useState } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead
} from "@/components/ui/table"
import { format } from 'date-fns';
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import toast from 'react-hot-toast';
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
                status: 'on the way',
            });
            return data;
        },
        onSuccess: () => {
            toast.success('Parcel assigned successfully');
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
            toast.success('Parcel deleted successfully');
            setIsDeleteOpen(false);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    // eslint-disable-next-line no-unused-vars
    const { data: allDeliveryMen = [], isLoading: isDeliveryMenLoading } = useQuery({
        queryKey: ['DeliveryMen'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users');

            return res.data.filter(user => user.role === 'DeliveryMen');
        }
    });

    const { data: parcels = [], isLoading, refetch } = useQuery({
        queryKey: ['parcels'],
        queryFn: async () => {
            const res = await axiosSecure.get('/parcels');
            return res.data;
        },
    });

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner>
    }

    const handleManageClick = (parcel) => {
        setParcelToUpdate(parcel);
        setApproximateDeliveryDate(calculateApproximateDeliveryDate(parcel.parcelType, parcel.deliveryDate));
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
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Parcel Type</TableHead>
                        <TableHead>Requested Delivery Date</TableHead>
                        {/* <TableHead>Approximate Delivery Date</TableHead> */}
                        <TableHead>Booking Date</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Delivery Man</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parcels.map((parcel) => (
                        <TableRow key={parcel._id}>
                            <TableCell className="font-medium">{parcel.name}</TableCell>
                            <TableCell className="font-medium">{parcel.phoneNumber}</TableCell>
                            <TableCell className="font-medium">{parcel.parcelType}</TableCell>
                            {/* <TableCell>{format(new Date(parcel.deliveryDate), 'dd/MM/yyyy')}</TableCell> */}
                            {/* <TableCell>
                                {calculateApproximateDeliveryDate(parcel.parcelType, parcel.deliveryDate)}
                            </TableCell> */}
                            <TableCell>{format(new Date(parcel.createdDate), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{parcel.price}</TableCell>
                            <TableCell>{parcel.deliveryManId || 'N/A'}</TableCell>
                            <TableCell>{parcel.status}</TableCell>
                            <TableCell>
                                <Button disabled={parcel.status === 'delivered'} onClick={() => handleManageClick(parcel)}>Manage</Button>
                                {parcel.status === 'pending' && (
                                    <Button onClick={() => { setSelectedParcelId(parcel._id); setIsDeleteOpen(true); }} variant="destructive">
                                        Delete
                                    </Button>
                                )}
                                <DeleteModal
                                    isOpen={isDeleteOpen}
                                    closeModal={closeModal}
                                    handleDelete={handleDelete}
                                    id={selectedParcelId}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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
        </>
    )
}

export default AllParcels;
