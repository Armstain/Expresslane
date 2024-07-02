import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth.jsx';
import { Input } from '../ui/input.jsx';
import { Button } from '../ui/button.jsx';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure.jsx';
import { TbFidgetSpinner } from 'react-icons/tb';
import LoadingSpinner from '../Shared/LoadingSpinner.jsx';

const BookParcelForm = ({ id }) => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(false);

    const calculatePrice = (weight) => {
        return weight <= 1 ? 50 : weight <= 2 ? 100 : 150;
    };

    const { mutateAsync } = useMutation({
        mutationFn: async (ProductData) => {
            const { data } = await axiosSecure.post(`/parcel`, ProductData);
            return data;
        },
        onSuccess: () => {
            toast.success('Parcel booked successfully');
            setLoading(false);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    })



    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const form = event.target;
        const formData = {
            name: form.name.value,
            email: form.email.value,
            phoneNumber: form.phoneNumber.value,
            parcelType: form.parcelType.value,
            parcelWeight: form.parcelWeight.value,
            recipientName: form.recipientName.value,
            recipientPhoneNumber: form.recipientPhoneNumber.value,
            recipientAddress: form.recipientAddress.value,
            deliveryDate: form.deliveryDate.value,
            latitude: form.latitude.value,
            longitude: form.longitude.value,
            price: calculatePrice(parseFloat(form.parcelWeight.value) || 0),
            status: 'pending',
            createdDate: new Date(),
        };

        setPrice(formData.price);

        try {
            await mutateAsync(formData);
            form.reset();
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };



    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-8 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-bold mb-6">Book a Parcel</h2>

            {/* Sender Details */}
            <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <Input name="name" defaultValue={user?.displayName} readOnly className="bg-gray-100" />
            </div>
            <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <Input name="email" defaultValue={user?.email} readOnly className="bg-gray-100" />
            </div>
            <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                <Input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    // pattern="[0-9]{10}"
                    required
                    defaultValue=""

                    placeholder="01XXXXXXXXX"
                />
            </div>

            {/* Parcel Details */}
            <div className="mb-4">
                <label htmlFor="parcelType" className="block text-gray-700 text-sm font-bold mb-2">Parcel Type</label>
                <Input
                    type="text"
                    id="parcelType"
                    name="parcelType"
                    defaultValue=""
                    placeholder="Express, Regular, International"

                />
            </div>

            <div className="mb-4">
                <label htmlFor="parcelWeight" className="block text-gray-700 text-sm font-bold mb-2">Parcel Weight (kg)</label>
                <Input
                    type="number"
                    id="parcelWeight"
                    name="parcelWeight"
                    min="0"
                    defaultValue=""


                />
            </div>

            {/* Recipient Details */}
            <div className="mb-4">
                <label htmlFor="recipientName" className="block text-gray-700 text-sm font-bold mb-2">Recipient Name</label>
                <Input
                    id="recipientName"
                    name="recipientName"
                    defaultValue=""


                />
            </div>
            <div className="mb-4">
                <label htmlFor="recipientPhoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Recipient Phone Number</label>
                <Input
                    type="tel"
                    id="recipientPhoneNumber"
                    name="recipientPhoneNumber"
                    defaultValue=""

                    placeholder="01XXXXXXXXX"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="recipientAddress" className="block text-gray-700 text-sm font-bold mb-2">Recipient Address</label>
                <Input
                    id="recipientAddress"
                    name="recipientAddress"
                    defaultValue=""
                />
            </div>

            {/* Delivery Details */}
            <div className="mb-4">
                <label htmlFor="deliveryDate" className="block text-gray-700 text-sm font-bold mb-2">Requested Delivery Date</label>
                <Input
                    type="date"
                    id="deliveryDate"
                    name="deliveryDate"
                    defaultValue=""
                />
            </div>
            <div className="mb-4">
                <label htmlFor="latitude" className="block text-gray-700 text-sm font-bold mb-2">Delivery Address Latitude</label>
                <Input
                    type="text"
                    id="latitude"
                    name="latitude"
                    defaultValue=""
                    placeholder="21.121365496"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="longitude" className="block text-gray-700 text-sm font-bold mb-2">Delivery Address Longitude</label>
                <Input
                    type="text"
                    id="longitude"
                    name="longitude"
                    defaultValue=""
                    placeholder="21.121365496"
                />
            </div>

            {/* Price */}
            <div className="mb-4">
                <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price (Tk)</label>
                <Input name="price" defaultValue="" readOnly className="bg-gray-100" />
            </div>

            <Button type="submit" disabled={loading}> {loading ? (
                <LoadingSpinner />
            ) : (
                'Book'
            )}</Button>
        </form>
    );
};

export default BookParcelForm;