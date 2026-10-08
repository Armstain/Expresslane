import { useQuery } from "@tanstack/react-query";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { MessageSquareText, Star } from 'lucide-react';
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAuth from "@/hooks/useAuth";
import { formatDate } from '@/api/utils/dateUtils.js';
import EmptyState from '@/components/Shared/EmptyState.jsx';
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx';
import PageHeader from '@/components/Shared/PageHeader.jsx';
import UserAvatar from '@/components/Shared/UserAvatar.jsx';
import { Card } from "@/components/ui/card";

const Reviews = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    // 1. Look up this delivery man's id
    const { data: deliveryManId, isLoading: idLoading } = useQuery({
        queryKey: ['delivery-man', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/user/${user?.email}`);
            return res.data?._id ?? null;
        },
    });

    // 2. Fetch reviews left for them
    const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
        queryKey: ['my-reviews', deliveryManId],
        enabled: !!deliveryManId,
        queryFn: async () => {
            const res = await axiosSecure.get(`/reviews/delivery-man/${deliveryManId}`);
            return res.data;
        },
    });

    if (idLoading || reviewsLoading) return <LoadingSpinner />;

    const average = reviews.length
        ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
        : 0;
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: reviews.filter((r) => Math.round(r.rating) === stars).length,
    }));

    return (
        <>
            <PageHeader title='My reviews' description='What customers say about your deliveries.' />

            {reviews.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={MessageSquareText}
                        title='No reviews yet'
                        description='Reviews appear here after customers rate a delivered parcel.'
                    />
                </Card>
            ) : (
                <div className='grid items-start gap-6 lg:grid-cols-[280px_1fr]'>
                    <Card className='p-6 lg:sticky lg:top-24'>
                        <p className='text-sm text-muted-foreground'>Average rating</p>
                        <p className='mt-1 flex items-center gap-2 text-4xl font-bold tabular-nums'>
                            {average.toFixed(1)} <Star className='h-7 w-7 fill-warning text-warning' />
                        </p>
                        <p className='text-sm text-muted-foreground'>from {reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
                        <ul className='mt-5 space-y-2'>
                            {distribution.map(({ stars, count }) => (
                                <li key={stars} className='flex items-center gap-3 text-sm'>
                                    <span className='w-3 tabular-nums text-muted-foreground'>{stars}</span>
                                    <div className='h-2 flex-1 overflow-hidden rounded-full bg-secondary'>
                                        <div
                                            className='h-full rounded-full bg-warning'
                                            style={{ width: `${(count / reviews.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className='w-6 text-right tabular-nums text-muted-foreground'>{count}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <div className='grid gap-4 md:grid-cols-2'>
                        {reviews.map((review) => (
                            <Card key={review._id} className='p-5'>
                                <div className='flex items-center gap-3'>
                                    <UserAvatar src={review.reviewerImage} name={review.reviewerName} email={review.reviewerEmail} />
                                    <div className='min-w-0 flex-1'>
                                        <p className='truncate font-semibold'>{review.reviewerName || 'Customer'}</p>
                                        <p className='text-xs text-muted-foreground'>{formatDate(review.reviewDate)}</p>
                                    </div>
                                </div>
                                <Rating value={review.rating} readOnly style={{ maxWidth: 110 }} className='mt-4' />
                                {review.feedback && <p className='mt-3 text-sm text-muted-foreground'>{review.feedback}</p>}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default Reviews;
