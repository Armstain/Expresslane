import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AllParcelModal = ({
    isOpen,
    onClose,
    parcel,
    deliveryMen,
    deliveryManId,
    setDeliveryManId,
    approximateDeliveryDate,
    setApproximateDeliveryDate,
    onAssign,
    saving,
}) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Assign a rider</DialogTitle>
                <DialogDescription>
                    {parcel?.parcelType} parcel from {parcel?.name || parcel?.email} to {parcel?.recipientName}.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="delivery-man">Delivery man</Label>
                    <Select value={deliveryManId || undefined} onValueChange={setDeliveryManId}>
                        <SelectTrigger id="delivery-man">
                            <SelectValue placeholder={deliveryMen.length ? "Select a delivery man" : "No delivery men yet"} />
                        </SelectTrigger>
                        <SelectContent>
                            {deliveryMen.map((man) => (
                                <SelectItem key={man._id} value={man._id}>
                                    {man.displayName || man.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="delivery-date">Approximate delivery date</Label>
                    <Input
                        id="delivery-date"
                        type="date"
                        value={approximateDeliveryDate || ''}
                        onChange={(e) => setApproximateDeliveryDate(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={onAssign} disabled={!deliveryManId || !approximateDeliveryDate || saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />} Assign
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

AllParcelModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    parcel: PropTypes.object,
    deliveryMen: PropTypes.array.isRequired,
    deliveryManId: PropTypes.string,
    setDeliveryManId: PropTypes.func.isRequired,
    approximateDeliveryDate: PropTypes.string,
    setApproximateDeliveryDate: PropTypes.func.isRequired,
    onAssign: PropTypes.func.isRequired,
    saving: PropTypes.bool,
};

export default AllParcelModal;
