import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { LatLngExpression } from "leaflet";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LiveMapProps {
  center?: LatLngExpression;
  zoom?: number;
}

export function LiveMap({ center = [28.6139, 77.2090], zoom = 12 }: LiveMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "300px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        <Popup>
          Device/Drone location (demo)
        </Popup>
      </Marker>
    </MapContainer>
  );
}