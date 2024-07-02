
import { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import useAuth from "@/hooks/useAuth.jsx";
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { calculateApproximateDeliveryDate } from '@/api/utils/dateUtils.js';
import DeliveryManagementModal from '@/components/Modal/DeliveryManagementModal.jsx';
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx';
import LocationModal from '@/components/Modal/LocationModal.jsx';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';


const DeliveryList = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [selectedParcelLocation, setSelectedParcelLocation] = useState(null);


    const { data: parcels = [], isLoading: parcelsLoading, refetch } = useQuery({
        queryKey: ['delivery-list', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/my-delivery/${user?.email}`);
            return res.data;
        },
    });

    const { mutateAsync: updateParcelStatus } = useMutation({
        mutationFn: async ({ id, newStatus }) => {
            const { data } = await axiosSecure.patch(`/parcel/${id}`, { status: newStatus });
            return data;
        },
        onSuccess: (data, { newStatus }) => {
            toast.success(`Parcel marked as ${newStatus}`);
            refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleStatusUpdate = (parcelId, newStatus) => {
        if (confirm(`Are you sure you want to mark this parcel as ${newStatus}?`)) {
            updateParcelStatus({ id: parcelId, newStatus });
        }
    };

    const handleOpenModal = (parcel) => {
        setSelectedParcel(parcel);
        setIsOpen(true);
    };

    const handleCloseModal = () => {
        setIsOpen(false);
        setSelectedParcel(null);
    };

    const handleOpenLocationModal = (parcel) => {
        setSelectedParcelLocation(parcel);
        setShowLocationModal(true);
    };

    const handleCloseLocationModal = () => {
        setShowLocationModal(false);
        setSelectedParcelLocation(null);
    };

    if (parcelsLoading) {
        return <LoadingSpinner />
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Booked User</TableHead>
                        <TableHead>Receiver's Name</TableHead>
                        <TableHead>Booked User's Phone</TableHead>
                        <TableHead>Requested Delivery Date</TableHead>
                        <TableHead>Approximate Delivery Date</TableHead>
                        <TableHead>Receiver's Phone Number</TableHead>
                        <TableHead>Receiver's Address</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parcels.map((parcel) => (
                        <TableRow key={parcel._id}>
                            <TableCell className="font-medium">{parcel.name}</TableCell>
                            <TableCell>{parcel.recipientName}</TableCell>
                            <TableCell>{parcel.phoneNumber}</TableCell>
                            <TableCell>{format(new Date(parcel.deliveryDate), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>
                                {calculateApproximateDeliveryDate(parcel.parcelType, parcel.deliveryDate)}
                            </TableCell>
                            <TableCell>{parcel.recipientPhoneNumber}</TableCell>
                            <TableCell>{parcel.recipientAddress}</TableCell>
                            <TableCell>
                                <Button onClick={() => handleOpenLocationModal(parcel)}>View Location</Button>
                            </TableCell>
                            <TableCell className="space-x-2">
                                {
                                    parcel.status === 'cancelled' ? (
                                        <span>Cancelled</span>
                                    ) : parcel.status === 'delivered' ? (
                                        <span>Delivered</span>
                                    ) : (
                                        <>
                                            <Button variant="outline" onClick={() => handleOpenModal(parcel)}>
                                                Manage
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleStatusUpdate(parcel._id, 'cancelled')}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )
                                }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Delivery Management Modal */}
            <DeliveryManagementModal
                isOpen={isOpen}
                onClose={handleCloseModal}
                parcel={selectedParcel}
                onStatusUpdate={handleStatusUpdate}
            />

            {/* Location Modal */}
            <LocationModal isOpen={showLocationModal} onClose={handleCloseLocationModal}>
                {selectedParcel && selectedParcel.latitude && selectedParcel.longitude ? (
                    <MapContainer
                        center={[selectedParcel.latitude, selectedParcel.longitude]}
                        zoom={13}
                        style={{ height: '400px', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[parseFloat(selectedParcel.latitude), parseFloat(selectedParcel.longitude)]}>
                            <Popup>
                                Parcel Location ({selectedParcel.latitude}, {selectedParcel.longitude})
                            </Popup>
                        </Marker>
                    </MapContainer>
                ) : (
                    <p>Loading location...</p> // Or a loading spinner
                )}
            </LocationModal>
        </>
    );
};

export default DeliveryList;
