import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [fileGeo, setFileGeo] = useState(null);
  const [textGeo, setTextGeo] = useState(null);

  useEffect(() => {
    fetch("/file.geojson")
      .then((r) => r.json())
      .then((data) => setFileGeo(data));

    fetch("/text.geojson")
      .then((r) => r.json())
      .then((data) => setTextGeo(data));
  }, []);

  const lineStyle = { color: "red", weight: 3 };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[52.68767, -1.64427]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Kırmızı fiber çizgisi */}
        {fileGeo && <GeoJSON data={fileGeo} style={() => lineStyle} />}

        {/* YAZILAR (arka plan YOK, yalnızca text) */}
        {textGeo &&
          textGeo.features.map((feature, i) => {
            const [lng, lat] = feature.geometry.coordinates;
            const label =
              feature.properties.text ||
              feature.properties.name ||
              "undefined";

            const icon = L.divIcon({
              className: "text-label",
              html: `<span>${label}</span>`,
              iconSize: [0, 0],
            });

            return <Marker key={i} position={[lat, lng]} icon={icon} />;
          })}
      </MapContainer>
    </div>
  );
}
