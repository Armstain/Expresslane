import Chart from 'react-apexcharts';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from 'date-fns';
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx';

const Statistics = () => {
    const axiosSecure = useAxiosSecure();
   
    const {
        data: bookingsByDate = [],
        isLoading: bookingsLoading,
        error: bookingsError,
    } = useQuery({
        queryKey: ['bookingsByDate'],
        queryFn: async () => {
            const res = await axiosSecure.get('/bookingsByDate');
            return res.data;
        },
        select: data => data.map(booking => ({
            x: new Date(booking._id).getTime(),
            y: booking.count,
        })),
    });
   
    const barChartSeries = [{ name: 'Booked Parcels', data: bookingsByDate }];
    const barChartOptions = {
        chart: { id: 'bookings-bar-chart' },
        xaxis: { type: 'datetime', title: { text: 'Date' } },
        yaxis: { title: { text: 'Number of Parcels' } },
        title: { text: 'Parcel Bookings by Date', align: 'center' },
    };

    const {
        data: parcelsData = { bookings: [], deliveries: [] },
        isLoading: parcelsLoading,
        error: parcelsError
    } = useQuery({
        queryKey: ['parcels-data'],
        queryFn: async () => {
            const res = await axiosSecure.get('/parcels');
            return res.data;
        },
        select: data => {
            const bookingsByDate = {};
            const deliveriesByDate = {};
            data.forEach(parcel => {
                try {
                    const date = format(parseISO(parcel.deliveryDate), 'yyyy-MM-dd');
                    bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
                    if (parcel.status === 'delivered') {
                        deliveriesByDate[date] = (deliveriesByDate[date] || 0) + 1;
                    }
                } catch (error) {
                    console.error("Error parsing date:", parcel.deliveryDate, error);
                }
            });
            const formattedBookings = Object.entries(bookingsByDate).map(([date, count]) => ({
                x: new Date(date).getTime(),
                y: count,
            }));
            const formattedDeliveries = Object.entries(deliveriesByDate).map(([date, count]) => ({
                x: new Date(date).getTime(),
                y: count,
            }));
            return {
                bookings: formattedBookings,
                deliveries: formattedDeliveries,
            };
        },
    });

    const lineChartSeries = [
        { name: 'Booked', data: parcelsData.bookings },
        { name: 'Delivered', data: parcelsData.deliveries }
    ];
    const lineChartOptions = {
        chart: { id: 'parcels-line-chart' },
        xaxis: { type: 'datetime', title: { text: 'Date' } },
        yaxis: { title: { text: 'Number of Parcels' } },
        title: { text: 'Booked vs. Delivered Parcels', align: 'center' },
    };

    if (bookingsLoading || parcelsLoading) {
        return <LoadingSpinner />;
    }

    if (bookingsError || parcelsError) {
        console.error("Bookings error:", bookingsError);
        console.error("Parcels error:", parcelsError);
        return <p>Error loading data</p>;
    }
   
    return (
        <div className="container mx-auto mt-12">
            <h1 className="text-3xl font-bold mb-8">Statistics</h1>
            <Chart
                options={barChartOptions}
                series={barChartSeries}
                type="bar"
                height={350}
            />
            <Chart
                options={lineChartOptions}
                series={lineChartSeries}
                type="line"
                height={350}
            />
        </div>
    );
};

export default Statistics;