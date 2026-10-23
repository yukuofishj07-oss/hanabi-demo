import * as THREE from "three";
import { GRID, COLORS } from "../config/constants.js";
import { axialToWorld } from "./grid.js";

export function buildBridges(scene, islandDataList) {
  const bridgeGroup = new THREE.Group();
  const deckMat = new THREE.MeshStandardMaterial({ color: COLORS.wood, roughness: 0.7 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x8a5231, roughness: 0.6 });

  for (let i = 0; i < islandDataList.length - 1; i++) {
    const a = islandDataList[i];
    const b = islandDataList[i + 1];

    const p1 = axialToWorld(a.axial.q, a.axial.r);
    const p2 = axialToWorld(b.axial.q, b.axial.r);

    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;
    const totalDist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const bridgeLen = Math.max(totalDist - (GRID.R * 1.55), 0.75);

    // 拱橋甲板
    const bridgeGeo = new THREE.BoxGeometry(0.40, 0.09, bridgeLen);
    const bridge = new THREE.Mesh(bridgeGeo, deckMat);
    bridge.position.set(midX, GRID.TOP + 0.03, midZ);
    bridge.lookAt(p2.x, GRID.TOP + 0.03, p2.z);
    bridge.receiveShadow = true;
    bridge.castShadow = true;
    bridgeGroup.add(bridge);

    // 兩側木護欄
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, bridgeLen), railMat);
    railL.position.set(-0.18, 0.09, 0);
    bridge.add(railL);

    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, bridgeLen), railMat);
    railR.position.set(0.18, 0.09, 0);
    bridge.add(railR);
  }

  scene.add(bridgeGroup);
}
