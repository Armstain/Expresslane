import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CheckoutForm from "@/components/Form/CheckoutForm.jsx";
import { Elements } from '@stripe/react-stripe-js';

const PaymentModal = ({ isOpen, closeModal, parcel, stripePromise, setPaymentSuccess }) => {
    const handlePaymentSuccess = () => {

        setPaymentSuccess(true);

        closeModal();
    };
    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogTitle>Pay for Parcel {parcel?._id}</DialogTitle>
                {stripePromise && (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm parcelId={parcel?._id} closeModal={closeModal} parcel={parcel} onPaymentSuccess={handlePaymentSuccess} />
                    </Elements>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
