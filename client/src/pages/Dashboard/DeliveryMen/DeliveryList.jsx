import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, MapPin, Phone, Truck, X } from 'lucide-react';
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import useAuth from "@/hooks/useAuth.jsx";
import { calculateApproximateDeliveryDate, formatDate } from '@/api/utils/dateUtils.js';
import LocationModal from '@/components/Modal/LocationModal.jsx';
import ConfirmDialog from '@/components/Shared/ConfirmDialog.jsx';
import EmptyState from '@/components/Shared/EmptyState.jsx';
import LoadingSpinner from '@/components/Shared/LoadingSpinner.jsx';
import PageHeader from '@/components/Shared/PageHeader.jsx';
import StatCard from '@/components/Shared/StatCard.jsx';
import StatusBadge from '@/components/Shared/StatusBadge.jsx';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DeliveryList = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [mapParcel, setMapParcel] = useState(null);
    const [pending, setPending] = useState(null); // { parcel, status }

    const { data: parcels = [], isLoading, refetch } = useQuery({
        queryKey: ['delivery-list', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/my-delivery/${user?.email}`);
            return res.data;
        },
    });

    const { mutate: updateParcelStatus } = useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await axiosSecure.patch(`/parcel/${id}`, { status });
            return data;
        },
        onSuccess: (_data, { status }) => {
            toast.success(`Parcel marked as ${status}`);
            refetch();
        },
        onError: (error) => toast.error(error.message),
    });

    if (isLoading) return <LoadingSpinner />;

    const eta = (parcel) =>
        parcel.approximateDeliveryDate
            ? formatDate(parcel.approximateDeliveryDate)
            : calculateApproximateDeliveryDate(parcel.parcelType, parcel.deliveryDate);

    const renderActions = (parcel) => {
        const open = parcel.status !== 'delivered' && parcel.status !== 'cancelled';
        return (
            <>
                <Button size='sm' variant='outline' onClick={() => setMapParcel(parcel)}>
                    <MapPin className='h-4 w-4' /> Map
                </Button>
                {open && (
                    <>
                        <Button size='sm' onClick={() => setPending({ parcel, status: 'delivered' })}>
                            <CheckCircle2 className='h-4 w-4' /> Delivered
                        </Button>
                        <Button
                            size='sm'
                            variant='ghost'
                            className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                            onClick={() => setPending({ parcel, status: 'cancelled' })}
                            aria-label='Cancel delivery'
                        >
                            <X className='h-4 w-4' />
                        </Button>
                    </>
                )}
            </>
        );
    };

    const active = parcels.filter((p) => p.status === 'on the way' || p.status === 'pending').length;
    const delivered = parcels.filter((p) => p.status === 'delivered').length;

    return (
        <>
            <PageHeader title='My deliveries' description='Parcels assigned to you. Mark them delivered once handed over.' />

            <div className='mb-6 grid grid-cols-3 gap-3 sm:gap-4'>
                <StatCard label='Assigned' value={parcels.length} icon={Truck} />
                <StatCard label='In progress' value={active} icon={MapPin} />
                <StatCard label='Delivered' value={delivered} icon={CheckCircle2} />
            </div>

            <Card className='overflow-hidden'>
                {parcels.length === 0 ? (
                    <EmptyState
                        icon={Truck}
                        title='No deliveries assigned'
                        description='When an admin assigns you a parcel, it will appear here.'
                    />
                ) : (
                    <>
                    {/* Phones: one card per delivery */}
                    <ul className='divide-y md:hidden'>
                        {parcels.map((parcel) => (
                            <li key={parcel._id} className='space-y-3 p-4'>
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='min-w-0'>
                                        <p className='font-medium'>{parcel.recipientName}</p>
                                        <p className='text-sm text-muted-foreground'>{parcel.recipientAddress}</p>
                                    </div>
                                    <StatusBadge status={parcel.status} />
                                </div>
                                <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm'>
                                    <a href={`tel:${parcel.recipientPhoneNumber}`} className='flex items-center gap-1.5 font-medium text-primary'>
                                        <Phone className='h-3.5 w-3.5' /> Call recipient
                                    </a>
                                    <a href={`tel:${parcel.phoneNumber}`} className='flex items-center gap-1.5 text-muted-foreground'>
                                        <Phone className='h-3.5 w-3.5' /> Sender: {parcel.name || parcel.phoneNumber}
                                    </a>
                                </div>
                                <p className='text-xs text-muted-foreground'>
                                    Pickup {formatDate(parcel.deliveryDate)} · Deliver by {eta(parcel)}
                                </p>
                                <div className='flex gap-2 [&>button:not([aria-label])]:flex-1'>{renderActions(parcel)}</div>
                            </li>
                        ))}
                    </ul>
                    <Table className='hidden md:table'>
                        <TableHeader>
                            <TableRow className='hover:bg-transparent'>
                                <TableHead>Sender</TableHead>
                                <TableHead>Recipient</TableHead>
                                <TableHead>Pickup</TableHead>
                                <TableHead>Deliver by</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-right'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parcels.map((parcel) => (
                                <TableRow key={parcel._id}>
                                    <TableCell>
                                        <p className='font-medium'>{parcel.name || '—'}</p>
                                        <a href={`tel:${parcel.phoneNumber}`} className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'>
                                            <Phone className='h-3 w-3' /> {parcel.phoneNumber}
                                        </a>
                                    </TableCell>
                                    <TableCell className='min-w-[200px]'>
                                        <p className='font-medium'>{parcel.recipientName}</p>
                                        <p className='text-xs text-muted-foreground'>{parcel.recipientAddress}</p>
                                        <a href={`tel:${parcel.recipientPhoneNumber}`} className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'>
                                            <Phone className='h-3 w-3' /> {parcel.recipientPhoneNumber}
                                        </a>
                                    </TableCell>
                                    <TableCell className='whitespace-nowrap text-muted-foreground'>{formatDate(parcel.deliveryDate)}</TableCell>
                                    <TableCell className='whitespace-nowrap text-muted-foreground'>
                                        {eta(parcel)}
                                    </TableCell>
                                    <TableCell><StatusBadge status={parcel.status} /></TableCell>
                                    <TableCell>
                                        <div className='flex justify-end gap-2'>{renderActions(parcel)}</div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </>
                )}
            </Card>

            <LocationModal isOpen={!!mapParcel} onClose={() => setMapParcel(null)} parcel={mapParcel} />
            <ConfirmDialog
                open={!!pending}
                onOpenChange={(open) => !open && setPending(null)}
                title={pending?.status === 'delivered' ? 'Mark as delivered?' : 'Cancel this delivery?'}
                description={
                    pending?.status === 'delivered'
                        ? `Confirm the parcel was handed to ${pending?.parcel?.recipientName || 'the recipient'}.`
                        : 'The customer will see this parcel as cancelled.'
                }
                confirmLabel={pending?.status === 'delivered' ? 'Mark delivered' : 'Cancel delivery'}
                cancelLabel='Go back'
                destructive={pending?.status === 'cancelled'}
                onConfirm={() => updateParcelStatus({ id: pending.parcel._id, status: pending.status })}
            />
        </>
    );
};

export default DeliveryList;
