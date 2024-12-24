import { useState } from "react";
import useAuth from "@/hooks/useAuth.jsx";
import { Input } from "../ui/input.jsx";
import { Button } from "../ui/button.jsx";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import LoadingSpinner from "../Shared/LoadingSpinner.jsx";

const BookParcelForm = () => {
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
      toast.success("Parcel booked successfully");
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
      status: "pending",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 shadow-xl rounded-xl space-y-6 transform transition-all duration-300 hover:shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Book a Parcel
        </h2>

        {/* Form sections with improved styling */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Sender Details
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Name
                </label>
                <Input
                  name="name"
                  defaultValue={user?.displayName}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Email
                </label>
                <Input
                  name="email"
                  defaultValue={user?.email}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Phone Number
                </label>
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
            </div>

            {/* Recipient Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Recipient Details
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="recipientName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Recipient Name
                </label>
                <Input
                  id="recipientName"
                  name="recipientName"
                  defaultValue=""
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="recipientPhoneNumber"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Recipient Phone Number
                </label>
                <Input
                  type="tel"
                  id="recipientPhoneNumber"
                  name="recipientPhoneNumber"
                  defaultValue=""
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="recipientAddress"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Recipient Address
                </label>
                <Input
                  id="recipientAddress"
                  name="recipientAddress"
                  defaultValue=""
                />
              </div>
            </div>
          </div>

          {/* Parcel Details with improved visual hierarchy */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Parcel Details
            </h3>
            <div className="mb-4">
              <label
                htmlFor="parcelType"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Parcel Type
              </label>
              <Input
                type="text"
                id="parcelType"
                name="parcelType"
                defaultValue=""
                placeholder="Express, Regular, International"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="parcelWeight"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Parcel Weight (kg)
              </label>
              <Input
                type="number"
                id="parcelWeight"
                name="parcelWeight"
                min="0"
                defaultValue=""
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transform transition-all duration-300 hover:scale-105"
        >
          {loading ? <LoadingSpinner /> : "Book Now"}
        </Button>
      </form>
    </div>
  );
};

export default BookParcelForm;
