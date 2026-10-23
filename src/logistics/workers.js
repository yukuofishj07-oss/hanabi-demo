import * as THREE from "three";
import { axialToWorld } from "../island/grid.js";
import { GRID } from "../config/constants.js";

export class WorkerCrowd {
  constructor(scene, islandDataList) {
    this.scene = scene;
    this.workerData = [];

    // 總工匠數量
    const totalWorkers = islandDataList.length * 2;

    // 單一 InstancedMesh 繪製大頭、身體
    const bodyGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.32, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdb6a41, roughness: 0.7 });
    this.bodyMesh = new THREE.InstancedMesh(bodyGeo, bodyMat, totalWorkers);
    this.bodyMesh.castShadow = true;

    // 工匠影子
    const shadowGeo = new THREE.CircleGeometry(0.15, 8);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    this.shadowMesh = new THREE.InstancedMesh(shadowGeo, shadowMat, totalWorkers);

    this.dummy = new THREE.Object3D();
    const colors = [0xdb6a41, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6];

    let idx = 0;
    islandDataList.forEach((isl, i) => {
      const { x, z } = axialToWorld(isl.axial.q, isl.axial.r);
      for (let k = 0; k < 2; k++) {
        const radius = 0.65 + (k * 0.4);
        const angle = Math.random() * Math.PI * 2;
        this.workerData.push({
          cx: x,
          cz: z,
          radius,
          angle,
          speed: 0.016 + Math.random() * 0.012,
          phase: Math.random() * 10
        });

        this.bodyMesh.setColorAt(idx, new THREE.Color(colors[(i + k) % colors.length]));
        idx++;
      }
    });

    if (this.bodyMesh.instanceColor) this.bodyMesh.instanceColor.needsUpdate = true;

    this.scene.add(this.bodyMesh);
    this.scene.add(this.shadowMesh);
  }

  toggle(visible) {
    this.bodyMesh.visible = visible;
    this.shadowMesh.visible = visible;
  }

  update(time) {
    if (!this.bodyMesh.visible) return;

    for (let i = 0; i < this.workerData.length; i++) {
      const d = this.workerData[i];
      d.angle += d.speed;

      const px = d.cx + Math.cos(d.angle) * d.radius;
      const pz = d.cz + Math.sin(d.angle) * d.radius;

      // 小跳步起伏
      const hop = Math.abs(Math.sin(time * 8.0 + d.phase)) * 0.05;

      this.dummy.position.set(px, GRID.TOP + 0.16 + hop, pz);
      this.dummy.scale.set(1, 1, 1);
      this.dummy.rotation.set(0, -d.angle + Math.PI / 2, 0);
      this.dummy.updateMatrix();
      this.bodyMesh.setMatrixAt(i, this.dummy.matrix);

      // 影子貼地
      this.dummy.position.set(px, GRID.TOP + 0.005, pz);
      this.dummy.updateMatrix();
      this.shadowMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.bodyMesh.instanceMatrix.needsUpdate = true;
    this.shadowMesh.instanceMatrix.needsUpdate = true;
  }
}
