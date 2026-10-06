import PropTypes from "prop-types";
import { Elements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CheckoutForm from "@/components/Form/CheckoutForm.jsx";
import { formatPrice } from "@/lib/parcel.js";

const PaymentModal = ({ isOpen, closeModal, parcel, stripePromise, onPaymentSuccess }) => {
    const handlePaymentSuccess = () => {
        onPaymentSuccess?.();
        closeModal();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pay for delivery</DialogTitle>
                    <DialogDescription>
                        {parcel?.parcelType} parcel to {parcel?.recipientName || "recipient"} · {formatPrice(parcel?.price)}
                    </DialogDescription>
                </DialogHeader>
                {stripePromise && parcel && (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm parcel={parcel} onPaymentSuccess={handlePaymentSuccess} />
                    </Elements>
                )}
            </DialogContent>
        </Dialog>
    );
};

PaymentModal.propTypes = {
    isOpen: PropTypes.bool,
    closeModal: PropTypes.func.isRequired,
    parcel: PropTypes.object,
    stripePromise: PropTypes.object,
    onPaymentSuccess: PropTypes.func,
};

export default PaymentModal;
