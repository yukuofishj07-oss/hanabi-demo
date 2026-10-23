import * as THREE from "three";
import { GRID } from "../config/constants.js";
import { axialToWorld } from "./grid.js";

export function buildBridges(scene, islandDataList) {
  const bridgeGroup = new THREE.Group();
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xb48560, roughness: 0.75 });

  for (let i = 0; i < islandDataList.length; i++) {
    for (let j = i + 1; j < islandDataList.length; j++) {
      const a = islandDataList[i];
      const b = islandDataList[j];
      const dq = a.axial.q - b.axial.q;
      const dr = a.axial.r - b.axial.r;

      if (Math.abs(dq) <= 1 && Math.abs(dr) <= 1 && Math.abs(dq + dr) <= 1) {
        const p1 = axialToWorld(a.axial.q, a.axial.r);
        const p2 = axialToWorld(b.axial.q, b.axial.r);

        const midX = (p1.x + p2.x) / 2;
        const midZ = (p1.z + p2.z) / 2;
        const length = Math.hypot(p2.x - p1.x, p2.z - p1.z) - (GRID.R * 1.55);

        if (length > 0) {
          const bridgeGeo = new THREE.BoxGeometry(0.35, 0.08, length);
          const bridge = new THREE.Mesh(bridgeGeo, deckMat);
          bridge.position.set(midX, GRID.TOP + 0.02, midZ);
          bridge.lookAt(p2.x, GRID.TOP + 0.02, p2.z);
          bridge.receiveShadow = true;
          bridgeGroup.add(bridge);
        }
      }
    }
  }

  scene.add(bridgeGroup);
}
