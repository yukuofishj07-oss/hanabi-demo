import * as THREE from "three";
import { GRID } from "../config/constants.js";
import { axialToWorld } from "./grid.js";

export function buildBridges(scene, islandDataList) {
  const bridgeGroup = new THREE.Group();
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xb48560, roughness: 0.75 });

  // 依照 01 -> 02 -> ... -> 10 的工序順序建置小拱橋
  for (let i = 0; i < islandDataList.length - 1; i++) {
    const a = islandDataList[i];
    const b = islandDataList[i + 1];

    const p1 = axialToWorld(a.axial.q, a.axial.r);
    const p2 = axialToWorld(b.axial.q, b.axial.r);

    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;
    const totalDist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const bridgeLen = Math.max(totalDist - (GRID.R * 1.5), 0.75);

    // 防爆木造小拱橋
    const bridgeGeo = new THREE.BoxGeometry(0.38, 0.08, bridgeLen);
    const bridge = new THREE.Mesh(bridgeGeo, deckMat);
    bridge.position.set(midX, GRID.TOP + 0.02, midZ);
    bridge.lookAt(p2.x, GRID.TOP + 0.02, p2.z);
    bridge.receiveShadow = true;
    bridgeGroup.add(bridge);
  }

  scene.add(bridgeGroup);
}
