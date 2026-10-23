import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export class AssetKit {
  constructor() {
    this.geometries = {
      box: new THREE.BoxGeometry(1, 1, 1),
      rbox: new RoundedBoxGeometry(1, 1, 1, 2, 0.12),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
      cone: new THREE.ConeGeometry(0.5, 1, 16),
      sphere: new THREE.SphereGeometry(0.5, 16, 12)
    };

    this.solidMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.78,
      metalness: 0.0,
      vertexColors: true
    });

    this.instances = [];
  }

  push(kind, matrix, colorHex) {
    this.instances.push({ kind, matrix: matrix.clone(), color: new THREE.Color(colorHex) });
  }

  build(scene) {
    const grouped = {};
    this.instances.forEach((inst) => {
      if (!grouped[inst.kind]) grouped[inst.kind] = [];
      grouped[inst.kind].push(inst);
    });

    Object.keys(grouped).forEach((kind) => {
      const list = grouped[kind];
      const geo = this.geometries[kind] || this.geometries.box;
      const imesh = new THREE.InstancedMesh(geo, this.solidMaterial, list.length);
      imesh.castShadow = true;
      imesh.receiveShadow = true;

      list.forEach((item, idx) => {
        imesh.setMatrixAt(idx, item.matrix);
        imesh.setColorAt(idx, item.color);
      });

      imesh.instanceMatrix.needsUpdate = true;
      if (imesh.instanceColor) imesh.instanceColor.needsUpdate = true;
      scene.add(imesh);
    });
  }
}
