
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css"; // Import the CSS for star rating
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAuth from '@/hooks/useAuth.jsx';
import toast from 'react-hot-toast'

const ReviewModal = ({ isOpen, onClose, parcel }) => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setRating(0);
            setReviewSubmitted(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please provide a rating.');
            return;
        }

        try {
            const response = await axiosSecure.post('/reviews', {
                rating,
                feedback: e.target.feedback.value,
                deliveryManId: parcel.deliveryManId,
                parcelId: parcel._id,
                reviewerEmail: user?.email,
                reviewerName: user?.displayName,
                reviewDate: new Date()
            });

            if (response.status === 200) {
                toast.success('Review submitted successfully.');
                setReviewSubmitted(true);
                onClose();
            } else {
                toast.error('Failed to submit review.');
            }
        } catch (error) {
            toast.error('An error occurred while submitting the review.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Give Review</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User's Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right">
                            Your Name:
                        </label>
                        <Input id="name" value={user?.displayName || ''} readOnly className="col-span-3" />
                    </div>

                    {/* User's Image */}
                    {user?.photoURL && (
                        <div className="flex justify-center">
                            <img src={user.photoURL} alt="User Avatar" className="w-20 h-20 rounded-full" />
                        </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="rating">Rating:</label>
                        <Rating
                            style={{ maxWidth: 180 }}
                            value={rating}
                            onChange={setRating}
                        />
                    </div>

                    {/* Feedback */}
                    <div>
                        <label htmlFor="feedback">Feedback</label>
                        <Textarea id="feedback" placeholder="Share your experience..." />
                    </div>

                    {/* Hidden Input for Delivery Man's Id */}
                    <input type="hidden" value={parcel ? parcel.deliveryManId : ""} name="deliveryManId" />

                    <Button type="submit">{reviewSubmitted ? 'Reviewed' : 'Submit Review'}</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewModal;
