import * as THREE from "three";
import { axialToWorld } from "../island/grid.js";
import { GRID } from "../config/constants.js";

export class WorkerCrowd {
  constructor(scene, islandDataList) {
    this.scene = scene;
    this.workers = [];
    this.group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3, roughness: 0.8 });
    const vestColors = [0xdb6a41, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6];

    islandDataList.forEach((isl, i) => {
      const { x, z } = axialToWorld(isl.axial.q, isl.axial.r);
      // 每島配置 1-2 位巡邏與搬運的小工匠
      for (let k = 0; k < 2; k++) {
        const worker = new THREE.Group();

        // 圓圓大頭 (佔比 40%)
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), skinMat);
        head.position.y = 0.38;
        head.castShadow = true;
        worker.add(head);

        // 工匠工作帽 / 護目鏡
        const hatMat = new THREE.MeshStandardMaterial({ color: vestColors[(i + k) % vestColors.length], roughness: 0.6 });
        const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 12), hatMat);
        hat.position.y = 0.49;
        worker.add(hat);

        // 身體 (膠囊背心)
        const bodyMat = new THREE.MeshStandardMaterial({ color: vestColors[(i + k) % vestColors.length], roughness: 0.8 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.2, 10), bodyMat);
        body.position.y = 0.22;
        body.castShadow = true;
        worker.add(body);

        // 雙腳
        const legMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.9 });
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.06), legMat);
        legL.position.set(-0.05, 0.06, 0);
        const legR = legL.clone();
        legR.position.set(0.05, 0.06, 0);
        worker.add(legL);
        worker.add(legR);

        // 假圓形柔和投影 (黏土模型必備)
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
        const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.005;
        worker.add(shadow);

        const angle = Math.random() * Math.PI * 2;
        const radius = 0.6 + Math.random() * 0.8;
        worker.position.set(x + Math.cos(angle) * radius, GRID.TOP, z + Math.sin(angle) * radius);

        worker.userData = {
          cx: x,
          cz: z,
          radius,
          angle,
          speed: 0.015 + Math.random() * 0.015,
          legL,
          legR,
          phase: Math.random() * 10
        };

        this.workers.push(worker);
        this.group.add(worker);
      }
    });

    this.scene.add(this.group);
  }

  toggle(visible) {
    this.group.visible = visible;
  }

  update(time) {
    this.workers.forEach((w) => {
      const ud = w.userData;
      ud.angle += ud.speed;
      const nx = ud.cx + Math.cos(ud.angle) * ud.radius;
      const nz = ud.cz + Math.sin(ud.angle) * ud.radius;

      // 面向移動方向
      w.lookAt(nx, w.position.y, nz);
      w.position.set(nx, GRID.TOP, nz);

      // 走路步伐擺動與身體起伏小跳步
      const step = Math.sin(time * 9.0 + ud.phase);
      ud.legL.rotation.x = step * 0.65;
      ud.legR.rotation.x = -step * 0.65;
      w.position.y = GRID.TOP + Math.abs(step) * 0.035;
    });
  }
}
