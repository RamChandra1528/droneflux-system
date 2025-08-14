import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocateFixed } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";

// Use ?url to ensure Vite returns the correct URL for the images
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png?url";
import markerIconUrl from "leaflet/dist/images/marker-icon.png?url";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png?url";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

interface MapProps {
  className?: string;
  center?: LatLngExpression;
  zoom?: number;
}

export function Map({ className, center = [28.6139, 77.2090], zoom = 12 }: MapProps) {
  return (
    <Card className={className} >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Delivery Map</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <LocateFixed className="h-3.5 w-3.5 mr-1" />
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
            <Marker position={center}>
              <Popup>
                Device/Drone location (demo)
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>

    </Card>
  );
}
