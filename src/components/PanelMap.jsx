import { useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  findTableLabelsForGeometry,
  TABLE_LAYER_DEFAULT_STYLE,
  TABLE_LAYER_HOVER_STYLE
} from "../lib/geoUtils.js";

export default function PanelMap({
  tableGeojson,
  labelGeojson,
  loading
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const tableLayerRef = useRef(null);
  const labelLayerRef = useRef(null);
  const boundsLockedRef = useRef(false);

  useEffect(() => {
    if (mapRef.current) {
      console.log("Leaflet map already initialized");
      return;
    }
    if (!containerRef.current) {
      console.error("Map container ref is not set");
      return;
    }
    console.log("Initializing Leaflet map", containerRef.current);
    console.log("Container dimensions:", containerRef.current.clientWidth, containerRef.current.clientHeight);
    const map = L.map(containerRef.current, {
      zoomControl: true,
      preferCanvas: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;
    console.log("Leaflet map initialized", map);

    return () => {
      map.remove();
      mapRef.current = null;
      console.log("Leaflet map destroyed");
    };
  }, []);

  const handleBounds = useCallback((layer) => {
    if (!layer) return;
    const bounds = layer.getBounds?.();
    if (bounds?.isValid()) {
      mapRef.current?.fitBounds(bounds.pad(1));
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (tableLayerRef.current) {
      tableLayerRef.current.remove();
      tableLayerRef.current = null;
    }
    if (!tableGeojson) return;

    const layer = L.geoJSON(tableGeojson, {
      style: () => TABLE_LAYER_DEFAULT_STYLE,
      onEachFeature: (feature, layerRef) => {
        layerRef.on("mouseover", () => {
          layerRef.setStyle(TABLE_LAYER_HOVER_STYLE);
        });
        layerRef.on("mouseout", () => {
          layerRef.setStyle(TABLE_LAYER_DEFAULT_STYLE);
        });
      }
    });

    layer.addTo(mapRef.current);
    tableLayerRef.current = layer;
    console.log("Table layer added", layer, "Bounds:", layer.getBounds());
    handleBounds(layer);
  }, [handleBounds, tableGeojson]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (labelLayerRef.current) {
      labelLayerRef.current.remove();
      labelLayerRef.current = null;
    }
    if (!labelGeojson) return;

    const layer = L.geoJSON(labelGeojson, {
      filter: (feature) => feature?.geometry?.type === "Point",
      pointToLayer: (feature, latlng) => {
        const text = feature?.properties?.text;
        if (!text) return null;
        const marker = L.marker(latlng, {
          icon: L.divIcon({
            className: "lv-label",
            html: `<span>${text}</span>`
          })
        });
        return marker;
      }
    });

    layer.addTo(mapRef.current);
    labelLayerRef.current = layer;
    console.log("Label layer added", layer, "Bounds:", layer.getBounds());
    handleBounds(layer);
  }, [labelGeojson, handleBounds]);

  return (
    <div className="lv-map-wrapper">
      {loading && <div className="lv-map__loading">Loading map</div>}
      <div ref={containerRef} className="lv-map" aria-label="Panel map" />
    </div>
  );
}
