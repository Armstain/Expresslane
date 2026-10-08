import PropTypes from 'prop-types';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmptyState from '@/components/Shared/EmptyState.jsx';

const LocationModal = ({ isOpen, onClose, parcel }) => {
    const lat = parseFloat(parcel?.latitude);
    const lng = parseFloat(parcel?.longitude);
    const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Delivery location</DialogTitle>
                    <DialogDescription>{parcel?.recipientAddress || 'No address provided'}</DialogDescription>
                </DialogHeader>
                {hasLocation ? (
                    <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom={false} className="h-[360px] w-full">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <CircleMarker
                            center={[lat, lng]}
                            radius={10}
                            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#5144e4', fillOpacity: 1 }}
                        >
                            <Popup>{parcel?.recipientName || 'Recipient'}</Popup>
                        </CircleMarker>
                    </MapContainer>
                ) : (
                    <EmptyState
                        icon={MapPinOff}
                        title="No map pin for this parcel"
                        description="The sender didn't add coordinates. Use the address above and the recipient's phone number."
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

LocationModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    parcel: PropTypes.object,
};

export default LocationModal;
