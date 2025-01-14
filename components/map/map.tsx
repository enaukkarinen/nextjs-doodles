"use client";
import React, { FC, useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

export interface MapProps {
  id: string;
}

export const Map: FC<MapProps> = (props) => {
  const mapContainerRef = useRef(null);
  const [zoom, setZoom] = useState(11);
  const [lng, setLng] = useState(-0.126659);
  const [lt, setLt] = useState(51.506754);

  const [coords, setCoords] = useState("");

  useEffect(() => {
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lt],
      zoom,
    });

    // map.on("click", (e) => {
    //   setCoords(JSON.stringify(e.lngLat.wrap()));
    // });

    return () => map.remove();
  }, []);

  return (
    <div>
      <h4>{coords}</h4>
      <div id={props.id} ref={mapContainerRef} />
    </div>
  );
};
