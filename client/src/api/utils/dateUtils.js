import { add, format } from 'date-fns';

export const calculateApproximateDeliveryDate = (parcelType, deliveryDate) => {
    let baseDays = 3;
    if (parcelType === 'Express') {
        baseDays = 1;
    } else if (parcelType === 'International') {
        baseDays = 7;
    }
    return format(add(new Date(deliveryDate), { days: baseDays }), 'dd/MM/yyyy');
};
