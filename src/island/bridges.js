import * as THREE from "three";
import { GRID, COLORS } from "../config/constants.js";
import { getIslandPos } from "./grid.js";

export function buildBridges(scene, islandDataList) {
  const bridgeGroup = new THREE.Group();
  const deckMat = new THREE.MeshStandardMaterial({ color: COLORS.wood, roughness: 0.75 });
  const railMat = new THREE.MeshStandardMaterial({ color: COLORS.roofCoral, roughness: 0.6 });
  const postMat = new THREE.MeshStandardMaterial({ color: COLORS.woodDark, roughness: 0.7 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0xffe484, emissive: 0xff9d3b, emissiveIntensity: 2.0 });

  for (let i = 0; i < islandDataList.length - 1; i++) {
    const a = islandDataList[i];
    const b = islandDataList[i + 1];

    const p1 = getIslandPos(a);
    const p2 = getIslandPos(b);

    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;
    const totalDist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const bridgeLen = Math.max(totalDist - (GRID.R * 1.56), 1.6);

    const holder = new THREE.Group();
    holder.position.set(midX, GRID.TOP + 0.02, midZ);
    holder.lookAt(p2.x, GRID.TOP + 0.02, p2.z);

    // 9 片優雅弧形橋面木板
    const numPlanks = 9;
    const plankLen = bridgeLen / numPlanks;
    for (let k = 0; k < numPlanks; k++) {
      const t = (k + 0.5) / numPlanks;
      const archY = Math.sin(t * Math.PI) * 0.24;
      const zPos = (t - 0.5) * bridgeLen;

      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, plankLen * 0.92), deckMat);
      plank.position.set(0, archY, zPos);
      plank.castShadow = true;
      plank.receiveShadow = true;
      holder.add(plank);
    }

    // 兩側朱紅太鼓橋護欄與橋頭燈籠
    for (let side of [-0.38, 0.38]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, bridgeLen), railMat);
      rail.position.set(side, 0.34, 0);
      holder.add(rail);

      for (let p of [-0.46, 0, 0.46]) {
        const archOffset = p === 0 ? 0.22 : 0.04;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.34, 8), postMat);
        post.position.set(side, 0.17 + archOffset, p * bridgeLen);
        holder.add(post);

        if (p !== 0) {
          const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), glowMat);
          lantern.position.set(side, 0.38 + archOffset, p * bridgeLen);
          holder.add(lantern);
        }
      }
    }

    bridgeGroup.add(holder);
  }

  scene.add(bridgeGroup);
}
