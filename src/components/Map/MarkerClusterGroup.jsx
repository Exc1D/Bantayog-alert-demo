import { createLayerComponent, createElementObject } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const MarkerClusterGroup = createLayerComponent(
  function createMarkerClusterGroup({ children: _c, eventHandlers: _eh, ...props }, ctx) {
    const instance = new L.MarkerClusterGroup(props);

    return createElementObject(instance, {
      ...ctx,
      layerContainer: instance,
    });
  }
);

export default MarkerClusterGroup;
