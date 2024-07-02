import React, { useEffect, useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import './CheckoutForm.css';
import { Button } from '../ui/button.jsx';
import useAxiosSecure from '@/hooks/useAxiosSecure.jsx';
import useAuth from '@/hooks/useAuth.jsx';

const CheckoutForm = ({ parcelId, parcel, closeModal, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [clientSecret, setClientSecret] = useState("");
    const [cardError, setCardError] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (parcel?.price && parcel?.price > 1) {
            getClientSecret({ price: parcel?.price });
        }
    }, [parcel?.price]);

    const getClientSecret = async (price) => {
        try {
            const { data } = await axiosSecure.post(`/create-payment-intent`, price);
            console.log(data);
            setClientSecret(data?.clientSecret);
        } catch (error) {
            console.error('Error getting client secret:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) {
            return;
        }

        const card = elements.getElement(CardElement);

        if (card == null) {
            return;
        }


        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card,
        });

        if (error) {
            console.log('[error]', error);
            setCardError(error.message);
            setProcessing(false);
            return;
        } else {
            console.log('[PaymentMethod]', paymentMethod);
            setCardError("");
        }

        // confirm card payment
        const { paymentIntent, error: intentError } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    name: user?.name,
                    email: user?.email
                },
            }
        });

        if (intentError) {
            console.log('[error]', intentError);
            setCardError(intentError.message);
            setProcessing(false);
            return;
        }

        if (paymentIntent.status === 'succeeded') {
            console.log('Payment succeeded, paymentIntent:', paymentIntent);
            const paymentInfo = {
                email: user?.email,
                transactionId: paymentIntent.id,
                price: parcel?.price,
                date: new Date(),
                status: 'pending',
                name: parcel?.recipientName,
                phoneNumber: parcel?.recipientPhoneNumber,
                address: parcel?.recipientAddress,
                parcelType: parcel?.parcelType,
            }
            console.log(paymentInfo);

            onPaymentSuccess();


        }
        setProcessing(false);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
                <Button disabled={!stripe || !clientSecret || processing} className='w-full' type="submit">
                    Pay ${parcel?.price}
                </Button>
            </form>
            {cardError && <p className="text-red-500">{cardError}</p>}
        </>
    );
};

export default CheckoutForm;
