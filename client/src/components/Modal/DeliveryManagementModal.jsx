import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DeliveryManagementModal = ({ isOpen, onClose, parcel, onStatusUpdate }) => {
    if (!parcel) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Parcel</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <p>Booking ID: {parcel._id}</p>
                    <p>Customer Name: {parcel.name}</p>
                    <p>Recipient Name: {parcel.recipientName}</p>
                    {/* ... Add more details as needed */}
                    <Button onClick={() => onStatusUpdate(parcel._id, 'delivered')}>
                        Mark as Delivered
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeliveryManagementModal;
