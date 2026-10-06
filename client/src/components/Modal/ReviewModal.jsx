import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Loader2 } from 'lucide-react';
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAuth from '@/hooks/useAuth.jsx';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

const ReviewModal = ({ isOpen, onClose, parcel }) => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) setRating(0);
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return toast.error('Please choose a rating.');

        setSubmitting(true);
        try {
            await axiosSecure.post('/reviews', {
                rating,
                feedback: e.target.feedback.value,
                deliveryManId: parcel.deliveryManId,
                parcelId: parcel._id,
                reviewerEmail: user?.email,
                reviewerName: user?.displayName,
                reviewerImage: user?.photoURL,
                reviewDate: new Date(),
            });
            toast.success('Thanks for your review!');
            onClose();
        } catch {
            toast.error('Could not submit your review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate your delivery</DialogTitle>
                    <DialogDescription>
                        How was the delivery of your {parcel?.parcelType?.toLowerCase()} parcel to {parcel?.recipientName || 'the recipient'}?
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-secondary/60 py-5">
                        <Rating
                            style={{ maxWidth: 200 }}
                            value={rating}
                            onChange={setRating}
                            aria-label="Rating"
                        />
                        <p className="h-5 text-sm font-medium text-muted-foreground">{RATING_LABELS[rating]}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback <span className="font-normal text-muted-foreground">(optional)</span></Label>
                        <Textarea id="feedback" name="feedback" rows={4} placeholder="Share your experience…" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit review
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

ReviewModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    parcel: PropTypes.object,
};

export default ReviewModal;
