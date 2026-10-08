import { add, format, isValid } from 'date-fns';

const TRANSIT_DAYS = { Express: 1, Regular: 3, International: 7 };

export const calculateApproximateDeliveryDate = (parcelType, deliveryDate) => {
    const base = new Date(deliveryDate);
    if (!deliveryDate || !isValid(base)) return 'N/A';
    const days = TRANSIT_DAYS[parcelType] ?? 3;
    return format(add(base, { days }), 'MMM d, yyyy');
};

export const formatDate = (value, pattern = 'MMM d, yyyy') => {
    const date = new Date(value);
    return value && isValid(date) ? format(date, pattern) : '—';
};
