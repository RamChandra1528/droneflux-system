import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react"; // <-- Use MapPin
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { createRoot } from "react-dom/client";

// Custom React marker icon using Lucide
function createReactDivIcon() {
  const div = document.createElement("div");
  // Render the Lucide icon into the div
  createRoot(div).render(
    <MapPin style={{ color: "red", width: 32, height: 32 }} /> // <-- Red color
  );
  return L.divIcon({
    html: div,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

interface MapProps {
  className?: string;
  center?: LatLngExpression;
  zoom?: number;
}

export function Map({ className, center = [28.6139, 77.2090], zoom = 12 }: MapProps) {
  // Only create the icon once (avoid SSR issues)
  const customIcon = typeof window !== "undefined" ? createReactDivIcon() : undefined;

  return (
    <Card className={className} >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Delivery Map</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            Live
          </Badge>
        </div>
        <CardDescription>
          Track drone deliveries in real-time
        </CardDescription>
        
      </CardHeader>

      <CardContent className="p-0 aspect-video relative ">
        <div className="w-full h-full" style={{ height: "400px" }}>
          <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {customIcon && (
              <Marker position={center} icon={customIcon}>
                <Popup>
                  Device/Drone location (demo)
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </CardContent>

    </Card>
  );
}
