// // LocationModal.jsx
// 'use client';

// import React from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import LocationModal from './LocationModal.jsx';

// const ViewLocationModal = ({ isOpen, onClose, parcel }) => {
//     if (!parcel) return null;

//     const position = [parcel.latitude, parcel.longitude];

//     return (
//         <LocationModal isOpen={isOpen} onClose={onClose}>
//             <div style={{ height: '400px', width: '100%' }}>
//                 <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
//                     <TileLayer
//                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     />
//                     <Marker position={position} icon={L.icon({ iconUrl: '/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })}>
//                         <Popup>
//                             {parcel.recipientAddress}
//                         </Popup>
//                     </Marker>
//                 </MapContainer>
//             </div>
//         </LocationModal>
//     );
// };

// export default ViewLocationModal;
