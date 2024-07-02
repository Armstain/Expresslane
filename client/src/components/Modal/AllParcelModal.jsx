import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AllParcelModal = ({ isOpen, onClose, parcelToUpdate, allDeliveryMen, setSelectedDeliveryMan, setApproximateDeliveryDate, handleAssignParcel, selectedDeliveryMan, approximateDeliveryDate }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose} className="w-[450px]">

            <DialogContent className="p-4">
                <div className="mb-4">
                    <Label htmlFor="delivery-man" className="mb-1 block font-medium text-gray-700">Delivery Man</Label>
                    <Select
                        id="delivery-man"
                        value={selectedDeliveryMan}
                        onValueChange={setSelectedDeliveryMan}
                        className="w-full"
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a delivery man" />
                        </SelectTrigger>
                        <SelectContent>
                            {allDeliveryMen.map((man) => (
                                <SelectItem key={man._id} value={man._id}>
                                    {man.displayName || man.email || 'Unknown Name'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="delivery-date" className="mb-1 block font-medium text-gray-700">Approximate Delivery Date</Label>
                    <Input
                        id="delivery-date"
                        type="date"
                        value={approximateDeliveryDate}
                        onChange={(e) => setApproximateDeliveryDate(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => handleAssignParcel(parcelToUpdate)} className="bg-blue-500 hover:bg-blue-600 text-white">Assign</Button>
                    <Button onClick={onClose} className="ml-2">Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AllParcelModal;
