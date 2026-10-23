import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { getIslandPos } from "../island/grid.js";
import { GRID } from "../config/constants.js";

function createChibiWorkerPrefab(suitColorHex, cargoColorHex) {
  const worker = new THREE.Group();
  worker.scale.set(1.25, 1.25, 1.25); // 配合放大兩倍的島嶼，工匠同步放大更清晰

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.75 });
  const suitMat = new THREE.MeshStandardMaterial({ color: suitColorHex, roughness: 0.75 });
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.5 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  const cargoMat = new THREE.MeshStandardMaterial({ color: cargoColorHex, roughness: 0.5 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.85 });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), skinMat);
  head.position.y = 0.52;
  head.castShadow = true;
  worker.add(head);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), eyeMat);
  eyeL.position.set(-0.065, 0.54, 0.16);
  worker.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.set(0.065, 0.54, 0.16);
  worker.add(eyeR);

  const hatDome = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hatMat);
  hatDome.position.y = 0.54;
  worker.add(hatDome);
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 14), hatMat);
  hatBrim.position.set(0, 0.55, 0.03);
  worker.add(hatBrim);

  const body = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.26, 0.18, 2, 0.05), suitMat);
  body.position.y = 0.26;
  body.castShadow = true;
  worker.add(body);

  const cargo = new THREE.Mesh(new RoundedBoxGeometry(0.20, 0.16, 0.20, 2, 0.03), cargoMat);
  cargo.position.set(0, 0.30, 0.18);
  cargo.castShadow = true;
  worker.add(cargo);

  const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8);
  const armL = new THREE.Mesh(armGeo, suitMat);
  armL.position.set(-0.14, 0.30, 0.09);
  armL.rotation.x = Math.PI / 3;
  worker.add(armL);
  const armR = armL.clone();
  armR.position.set(0.14, 0.30, 0.09);
  worker.add(armR);

  const legGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.16, 8);
  const legL = new THREE.Mesh(legGeo, legMat);
  legL.position.set(-0.065, 0.08, 0);
  worker.add(legL);
  const legR = new THREE.Mesh(legGeo, legMat);
  legR.position.set(0.065, 0.08, 0);
  worker.add(legR);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.22, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.006;
  worker.add(shadow);

  worker.userData.legL = legL;
  worker.userData.legR = legR;

  return worker;
}

export class WorkerCrowd {
  constructor(scene, islandDataList) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.workers = [];

    const suitPalette = [0xd95a32, 0x2980b9, 0x27ae60, 0x8e44ad, 0xd35400, 0x16a085];

    for (let i = 0; i < islandDataList.length - 1; i++) {
      const islA = islandDataList[i];
      const islB = islandDataList[i + 1];
      const pA = getIslandPos(islA);
      const pB = getIslandPos(islB);

      for (let k = 0; k < 2; k++) {
        const mesh = createChibiWorkerPrefab(
          suitPalette[(i + k) % suitPalette.length],
          islA.cargoColor
        );

        this.group.add(mesh);

        this.workers.push({
          mesh,
          pA,
          pB,
          t: 0.2 + k * 0.5,
          dir: k === 0 ? 1 : -1,
          speed: 0.28 + (i % 3) * 0.04,
          wait: 0,
          phase: (i * 2 + k) * 1.7
        });
      }
    }

    this.scene.add(this.group);
  }

  update(time, dt = 0.016) {
    for (let i = 0; i < this.workers.length; i++) {
      const w = this.workers[i];

      if (w.wait > 0) {
        w.wait -= dt;
        w.mesh.rotation.x = Math.sin(w.wait * 7.0) * 0.16;
        w.mesh.userData.legL.rotation.x = 0;
        w.mesh.userData.legR.rotation.x = 0;
        continue;
      }

      w.mesh.rotation.x = 0;
      const dist = Math.hypot(w.pB.x - w.pA.x, w.pB.z - w.pA.z);
      w.t += (w.speed * dt * w.dir) / Math.max(dist, 1.0);

      if (w.t >= 0.82) {
        w.t = 0.82;
        w.dir = -1;
        w.wait = 1.2;
      } else if (w.t <= 0.18) {
        w.t = 0.18;
        w.dir = 1;
        w.wait = 1.2;
      }

      const x = THREE.MathUtils.lerp(w.pA.x, w.pB.x, w.t);
      const z = THREE.MathUtils.lerp(w.pA.z, w.pB.z, w.t);

      // 太鼓橋拱高貼合
      let bridgeArch = 0;
      if (w.t > 0.35 && w.t < 0.65) {
        const bt = (w.t - 0.35) / 0.30;
        bridgeArch = Math.sin(bt * Math.PI) * 0.24;
      }

      const walkCycle = time * 10.0 + w.phase;
      const hop = Math.abs(Math.sin(walkCycle)) * 0.05;

      w.mesh.position.set(x, GRID.TOP + bridgeArch + hop, z);

      const targetX = w.dir > 0 ? w.pB.x : w.pA.x;
      const targetZ = w.dir > 0 ? w.pB.z : w.pA.z;
      w.mesh.lookAt(targetX, w.mesh.position.y, targetZ);

      const swing = Math.sin(walkCycle) * 0.65;
      w.mesh.userData.legL.rotation.x = swing;
      w.mesh.userData.legR.rotation.x = -swing;
    }
  }
}
