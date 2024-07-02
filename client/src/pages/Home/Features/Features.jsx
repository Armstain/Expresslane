import LoadingSpinner from "@/components/Shared/LoadingSpinner.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import { useQuery } from "@tanstack/react-query";
import { Truck, Timer, Phone } from "lucide-react";
import CountUp from "react-countup";
import { Fade } from "react-awesome-reveal";

const Features = () => {
    const axiosSecure = useAxiosSecure();

    const { data: statisticsData, isLoading, error } = useQuery({
        queryKey: ['statistics'],
        queryFn: async () => {
            const res = await axiosSecure.get('/statistics');
            return res.data;
        }
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="py-12 bg-gray-100 dark:bg-[#020817] dark:text-white">
            <div className="container mx-auto mt-16 grid gap-6 md:gap-8">
                {/* Features Section */}
                <Fade cascade>
                    <h2 className="text-3xl font-semibold text-center md:text-left mb-6">Our Features</h2>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <Card className="rounded-lg shadow-lg">
                            <CardHeader className="flex flex-col items-start">
                                <CardTitle className="text-2xl font-bold flex items-center gap-x-2">
                                    <Truck className="h-6 w-6" /> Parcel Safety
                                </CardTitle>
                                <CardDescription className="text-lg mt-2">
                                    Your packages are handled with the utmost care and security.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mt-4">
                                    We prioritize the safety of your shipments, ensuring they arrive in pristine condition.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg shadow-lg">
                            <CardHeader className="flex flex-col items-start">
                                <CardTitle className="text-2xl font-bold flex items-center gap-x-2">
                                    <Timer className="h-6 w-6" /> Super Fast Delivery
                                </CardTitle>
                                <CardDescription className="text-lg mt-2">Get your parcels delivered in record time.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mt-4">
                                    Our optimized delivery network guarantees swift and efficient delivery of your packages.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg shadow-lg">
                            <CardHeader className="flex flex-col items-start">
                                <CardTitle className="text-2xl font-bold flex items-center gap-x-2">
                                    <Phone className="h-6 w-6" /> 24/7 Customer Support
                                </CardTitle>
                                <CardDescription className="text-lg mt-2">We are always here to help you.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mt-4">
                                    Our dedicated support team is available round-the-clock to assist you with any queries or concerns.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </Fade>

                {/* App Usage Statistics */}
                <Fade cascade>
                    <h2 className="text-3xl font-semibold text-center md:text-left mt-12 mb-6">App Usage Statistics</h2>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <Card className="rounded-lg shadow-lg">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold">Total Parcels Booked</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center">
                                <CountUp end={statisticsData.totalBooked} duration={2} className="text-4xl font-bold text-blue-500" />
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg shadow-lg">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold">Total Parcels Delivered</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center">
                                <CountUp end={statisticsData.totalDelivered} duration={2} className="text-4xl font-bold text-blue-500" />
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg shadow-lg">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold">Total Users</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center">
                                <CountUp end={statisticsData.totalUsers} duration={2} className="text-4xl font-bold text-blue-500" />
                            </CardContent>
                        </Card>
                    </div>
                </Fade>
            </div>
        </div>
    );
};

export default Features;
