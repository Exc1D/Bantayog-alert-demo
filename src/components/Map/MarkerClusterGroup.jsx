import { createPathComponent, createElementObject } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const MarkerClusterGroup = createPathComponent(
  function createMarkerClusterGroup({ children: _c, ...props }, ctx) {
    const clusterProps = {};
    const clusterEvents = {};

    Object.entries(props).forEach(([key, val]) => {
      if (key.startsWith('on')) {
        clusterEvents[key] = val;
      } else {
        clusterProps[key] = val;
      }
    });

    const instance = new L.MarkerClusterGroup(clusterProps);

    Object.entries(clusterEvents).forEach(([key, cb]) => {
      const event = `cluster${key.substring(2).toLowerCase()}`;
      instance.on(event, cb);
    });

    return createElementObject(instance, {
      ...ctx,
      layerContainer: instance,
    });
  }
);

export default MarkerClusterGroup;
