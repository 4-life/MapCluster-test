import { Component } from '@angular/core';
import Supercluster from 'supercluster';

import * as geojson from '../portsmouth_markers.json';

declare var L: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  ionViewDidEnter() {
    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const index = new Supercluster ({
      log: true,
      radius: 60,
      extent: 256,
      maxZoom: 17
    }).load(geojson.features);

    const markers = L.geoJson(null, {
        pointToLayer: this.createClusterIcon
    }).addTo(map);

    function update() {
      const bounds = map.getBounds();
      markers.clearLayers();
      const clusters = index.getClusters([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()], map.getZoom());
      markers.addData(clusters);
    }

    update();

    const boundCluster = geojson.features.map(i => [i.geometry.coordinates[1], i.geometry.coordinates[0]]);
    map.fitBounds(boundCluster);

    markers.on('click', (e) => {
      if (e.layer.feature.properties.InnerId) {
        console.log(e.layer.feature.properties.InnerId);
      }
      if (e.layer.feature.properties.cluster_id) {
        map.flyTo(e.latlng, index.getClusterExpansionZoom(e.layer.feature.properties.cluster_id));
      }
    });

    map.on('moveend', update);
  }

  createClusterIcon(feature, latlng) {
    if (!feature.properties.cluster) {
      return L.marker(latlng);
    }

    const count = feature.properties.point_count;
    const size =
        count < 100 ? 'small' :
        count < 1000 ? 'medium' : 'large';
    const icon = L.divIcon({
        html: `<div><span>${  feature.properties.point_count_abbreviated  }</span></div>`,
        className: `marker-cluster marker-cluster-${  size}`,
        iconSize: L.point(40, 40)
    });

    return L.marker(latlng, {icon});
  }
}
