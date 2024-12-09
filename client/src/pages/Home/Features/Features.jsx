import LoadingSpinner from "@/components/Shared/LoadingSpinner.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import { useQuery } from "@tanstack/react-query";
import { Truck, Timer, Phone } from "lucide-react";
import CountUp from "react-countup";
import { Fade } from "react-awesome-reveal";

const Features = () => {
  const axiosSecure = useAxiosSecure();

  const {
    data: statisticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      const res = await axiosSecure.get("/statistics");
      return res.data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="py-16  dark:from-[#020817] dark:to-[#0f172a] dark:text-white">
      <div className="container mx-auto px-4">
        {/* Features Section */}
        <Fade cascade damping={0.2}>
          <h2 className="text-4xl font-bold text-center mb-12">
            Our <span className="text-blue-500">Features</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <Card className="rounded-lg shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
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
                  We prioritize the safety of your shipments, ensuring they
                  arrive in pristine condition.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-col items-start">
                <CardTitle className="text-2xl font-bold flex items-center gap-x-2">
                  <Timer className="h-6 w-6" /> Super Fast Delivery
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Get your parcels delivered in record time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mt-4">
                  Our optimized delivery network guarantees swift and efficient
                  delivery of your packages.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-col items-start">
                <CardTitle className="text-2xl font-bold flex items-center gap-x-2">
                  <Phone className="h-6 w-6" /> 24/7 Customer Support
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  We are always here to help you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mt-4">
                  Our dedicated support team is available round-the-clock to
                  assist you with any queries or concerns.
                </p>
              </CardContent>
            </Card>
          </div>
        </Fade>

        {/* App Usage Statistics */}
        <Fade cascade damping={0.2}>
          <h2 className="text-4xl font-bold text-center mt-20 mb-12">
            Our <span className="text-blue-500">Impact</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <Card className="rounded-lg shadow-lg transition-all hover:shadow-xl hover:border-blue-500">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  Total Parcels Booked
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <CountUp
                  end={statisticsData.totalBooked}
                  duration={2}
                  className="text-5xl font-bold text-blue-500"
                />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Successfully Booked
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-lg transition-all hover:shadow-xl hover:border-blue-500">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  Total Parcels Delivered
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <CountUp
                  end={statisticsData.totalDelivered}
                  duration={2}
                  className="text-5xl font-bold text-blue-500"
                />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Successfully Delivered
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-lg transition-all hover:shadow-xl hover:border-blue-500">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <CountUp
                  end={statisticsData.totalUsers}
                  duration={2}
                  className="text-5xl font-bold text-blue-500"
                />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Registered Users
                </p>
              </CardContent>
            </Card>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default Features;
