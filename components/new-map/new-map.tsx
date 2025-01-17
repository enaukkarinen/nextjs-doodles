"use client";

import React, { Component } from "react";

import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { DataFilterExtension } from "@deck.gl/extensions";
import { MapView } from "@deck.gl/core";
import { CSVLoader } from "@loaders.gl/csv";
import { load } from "@loaders.gl/core";

import type { MapViewState } from "@deck.gl/core";
import type { DataFilterExtensionProps } from "@deck.gl/extensions";

// Source data GeoJSON
const DATA_URL =
  "https://raw.githubusercontent.com/uber-web/kepler.gl-data/master/earthquakes/data.csv"; // eslint-disable-line

const MAP_VIEW = new MapView({
  repeat: true,
  // 1 is the distance between the camera and the ground
  farZMultiplier: 100,
});

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -0.11718156674463255,
  latitude: 51.511008437014695,
  zoom: 10,
  pitch: 0,
  bearing: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

type Earthquake = {
  timestamp: number;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
};

const dataFilter = new DataFilterExtension({
  filterSize: 1,
  // Enable for higher precision, e.g. 1 second granularity
  // See DataFilterExtension documentation for how to pick precision
  fp64: false,
});

// function getTooltip({ object }: PickingInfo<Earthquake>) {
//   return (
//     object &&
//     `\
//     Time: ${new Date(object.timestamp).toUTCString()}
//     Magnitude: ${object.magnitude}
//     Depth: ${object.depth}
//     `
//   );
// }

interface NewMapState {
  earthquakes: Earthquake[];
  layers?: ScatterplotLayer<Earthquake, DataFilterExtensionProps<Earthquake>>[];
  loading: boolean;
  error: any;
}

interface NewMapProps {}

export class NewMap extends Component<NewMapProps, NewMapState> {
  constructor(props: NewMapProps) {
    super(props);
    this.state = {
      earthquakes: [],
      loading: true,
      error: null,
    };
  }

  async componentDidMount() {
    try {
      const rawData = await load(DATA_URL, CSVLoader);
      const earthquakes: Earthquake[] = rawData.data.map((row: any) => ({
        timestamp: new Date(`${row.DateTime} UTC`).getTime(),
        latitude: row.Latitude,
        longitude: row.Longitude,
        depth: row.Depth,
        magnitude: row.Magnitude,
      }));
      this.setState({
        earthquakes,
        layers: [this.toLayer(earthquakes)],
        loading: false,
      });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  render(): React.ReactNode {
    // console.log(this.state.layers?.length);
    return this.state.loading ? (
      <div>loading...</div>
    ) : (
      <>
        <DeckGL
          views={MAP_VIEW}
          layers={this.state.layers}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
        >
          <Map
            reuseMaps
            mapStyle={MAP_STYLE}
            mapboxAccessToken={process.env.MAPBOX_API_KEY}
          />
        </DeckGL>
      </>
    );
  }

  private toLayer(earthquakes: Earthquake[]) {
    return new ScatterplotLayer<
      Earthquake,
      DataFilterExtensionProps<Earthquake>
    >({
      id: "earthquakes",
      data: earthquakes,
      opacity: 0.8,
      radiusScale: 100,
      radiusMinPixels: 1,
      wrapLongitude: true,

      getPosition: (d) => [d.longitude, d.latitude, -d.depth * 1000],
      getRadius: (d) => Math.pow(2, d.magnitude),
      getFillColor: (d) => {
        const r = Math.sqrt(Math.max(d.depth, 0));
        return [255 - r * 15, r * 5, r * 10];
      },

      getFilterValue: (d) => d.timestamp,
      // filterRange: [filterValue[0], filterValue[1]],
      // filterSoftRange: [
      //   filterValue[0] * 0.9 + filterValue[1] * 0.1,
      //   filterValue[0] * 0.1 + filterValue[1] * 0.9,
      // ],
      extensions: [dataFilter],

      pickable: true,
    });
  }
}
