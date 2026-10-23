import * as THREE from "three";
import { GRID, COLORS } from "../config/constants.js";
import { getIslandPos } from "./grid.js";

export function buildBridges(scene, islandDataList) {
  const bridgeGroup = new THREE.Group();
  const deckMat = new THREE.MeshStandardMaterial({ color: COLORS.wood, roughness: 0.75 });
  const railMat = new THREE.MeshStandardMaterial({ color: COLORS.roofCoral, roughness: 0.6 });
  const postMat = new THREE.MeshStandardMaterial({ color: COLORS.woodDark, roughness: 0.7 });

  // 嚴格沿著 01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07 -> 08 -> 09 -> 10 建造 S 型拱橋
  for (let i = 0; i < islandDataList.length - 1; i++) {
    const a = islandDataList[i];
    const b = islandDataList[i + 1];

    const p1 = getIslandPos(a);
    const p2 = getIslandPos(b);

    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;
    const totalDist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const bridgeLen = Math.max(totalDist - (GRID.R * 1.52), 1.1);

    const holder = new THREE.Group();
    holder.position.set(midX, GRID.TOP + 0.02, midZ);
    holder.lookAt(p2.x, GRID.TOP + 0.02, p2.z);

    // 7 片微拱形橋面木板 (重現規格書 sin 拱高)
    const numPlanks = 7;
    const plankLen = bridgeLen / numPlanks;
    for (let k = 0; k < numPlanks; k++) {
      const t = (k + 0.5) / numPlanks;
      const archY = Math.sin(t * Math.PI) * 0.14;
      const zPos = (t - 0.5) * bridgeLen;

      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, plankLen * 0.92), deckMat);
      plank.position.set(0, archY, zPos);
      plank.castShadow = true;
      plank.receiveShadow = true;
      holder.add(plank);
    }

    // 兩側日式朱紅橋欄杆與橋柱
    for (let side of [-0.28, 0.28]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, bridgeLen), railMat);
      rail.position.set(side, 0.24, 0);
      holder.add(rail);

      for (let p of [-0.42, 0, 0.42]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 8), postMat);
        post.position.set(side, 0.13, p * bridgeLen);
        holder.add(post);
      }
    }

    bridgeGroup.add(holder);
  }

  scene.add(bridgeGroup);
}
