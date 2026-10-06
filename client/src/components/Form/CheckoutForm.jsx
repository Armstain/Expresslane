import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import useAxiosSecure from '@/hooks/useAxiosSecure.jsx';
import useAuth from '@/hooks/useAuth.jsx';
import { useTheme } from '@/components/theme-provider.jsx';
import { formatPrice } from '@/lib/parcel.js';

const CheckoutForm = ({ parcel, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const { theme } = useTheme();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [clientSecret, setClientSecret] = useState('');
    const [cardError, setCardError] = useState('');
    const [processing, setProcessing] = useState(false);

    // The API looks up the amount from the parcel itself
    useEffect(() => {
        if (!parcel?._id) return;
        axiosSecure
            .post('/create-payment-intent', { parcelId: parcel._id })
            .then(({ data }) => setClientSecret(data?.clientSecret))
            .catch((err) =>
                setCardError(err.response?.data?.message || 'Could not start the payment. Please try again later.')
            );
    }, [parcel?._id, axiosSecure]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements || !clientSecret) return;

        const card = elements.getElement(CardElement);
        if (!card) return;

        setProcessing(true);
        setCardError('');

        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card,
                billing_details: {
                    name: user?.displayName || undefined,
                    email: user?.email,
                },
            },
        });

        setProcessing(false);

        if (error) {
            setCardError(error.message);
            return;
        }

        if (paymentIntent?.status === 'succeeded') {
            // Let the API confirm the payment with Stripe and mark the parcel paid
            try {
                await axiosSecure.post('/payments', { paymentIntentId: paymentIntent.id });
            } catch {
                toast.error('Payment went through, but we could not update your parcel yet. Please refresh shortly.');
            }
            queryClient.invalidateQueries({ queryKey: ['my-parcel'] });
            toast.success('Payment successful — thank you!');
            onPaymentSuccess();
        }
    };

    const dark = theme === 'dark';

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='rounded-lg border border-input bg-card px-3 py-3.5 shadow-sm focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15'>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '15px',
                                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                                color: dark ? '#f1f3f8' : '#141a2e',
                                '::placeholder': { color: dark ? '#9aa1b2' : '#6b7280' },
                            },
                            invalid: { color: dark ? '#f87171' : '#dc2626' },
                        },
                    }}
                />
            </div>
            {cardError && <p className='text-sm text-destructive'>{cardError}</p>}
            <Button disabled={!stripe || !clientSecret || processing} className='w-full' size='lg' type='submit'>
                {processing ? <Loader2 className='h-4 w-4 animate-spin' /> : <Lock className='h-4 w-4' />}
                Pay {formatPrice(parcel?.price)}
            </Button>
            <p className='text-center text-xs text-muted-foreground'>Payments are processed securely by Stripe.</p>
        </form>
    );
};

CheckoutForm.propTypes = {
    parcel: PropTypes.object,
    onPaymentSuccess: PropTypes.func.isRequired,
};

export default CheckoutForm;
