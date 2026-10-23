import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { getIslandPos } from "../island/grid.js";
import { GRID } from "../config/constants.js";

// 不需要任何外部 3D 模型！純程式內建「二頭身可愛黏土工匠範本」
function createChibiWorkerPrefab(suitColorHex, cargoColorHex) {
  const worker = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.75 });
  const suitMat = new THREE.MeshStandardMaterial({ color: suitColorHex, roughness: 0.75 });
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.5 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x211d1d });
  const cargoMat = new THREE.MeshStandardMaterial({ color: cargoColorHex, roughness: 0.55 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.85 });

  // 1. 圓潤二頭身大頭 (Head)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), skinMat);
  head.position.y = 0.52;
  head.castShadow = true;
  worker.add(head);

  // 2. 可愛豆豆雙眼 (Eyes)
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), eyeMat);
  eyeL.position.set(-0.065, 0.54, 0.16);
  worker.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.set(0.065, 0.54, 0.16);
  worker.add(eyeR);

  // 3. 工匠安全帽 / 日式頭巾帽 (Helmet)
  const hatDome = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hatMat);
  hatDome.position.y = 0.54;
  worker.add(hatDome);
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 14), hatMat);
  hatBrim.position.set(0, 0.55, 0.03);
  worker.add(hatBrim);

  // 4. 圓角黏土身體 (Torso)
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.26, 0.18, 2, 0.05), suitMat);
  body.position.y = 0.26;
  body.castShadow = true;
  worker.add(body);

  // 5. 雙手捧在胸前的工序物料箱/星珠桶 (Cargo)
  const cargo = new THREE.Mesh(new RoundedBoxGeometry(0.20, 0.16, 0.20, 2, 0.03), cargoMat);
  cargo.position.set(0, 0.30, 0.18);
  cargo.castShadow = true;
  worker.add(cargo);

  // 6. 左右手臂 (抱著貨物)
  const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8);
  const armL = new THREE.Mesh(armGeo, suitMat);
  armL.position.set(-0.14, 0.30, 0.09);
  armL.rotation.x = Math.PI / 3;
  worker.add(armL);
  const armR = armL.clone();
  armR.position.set(0.14, 0.30, 0.09);
  worker.add(armR);

  // 7. 可獨立前後擺動的左右小短腿 (Legs)
  const legGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.16, 8);
  const legL = new THREE.Mesh(legGeo, legMat);
  legL.position.set(-0.065, 0.08, 0);
  worker.add(legL);
  const legR = new THREE.Mesh(legGeo, legMat);
  legR.position.set(0.065, 0.08, 0);
  worker.add(legR);

  // 8. 腳底柔和圓形陰影
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.22, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.006;
  worker.add(shadow);

  worker.userData.legL = legL;
  worker.userData.legR = legR;
  worker.userData.cargo = cargo;

  return worker;
}

export class WorkerCrowd {
  constructor(scene, islandDataList) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.workers = [];

    const suitPalette = [0xe06d48, 0x3498db, 0x27ae60, 0x8e44ad, 0xd35400, 0x16a085];

    // 在每兩座相鄰的 S 型島嶼之間配置 2 位對向往返的工匠（共 18 位活潑工匠！）
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
          t: k * 0.5, // 錯開位置
          dir: k === 0 ? 1 : -1,
          speed: 0.22 + (i % 3) * 0.03,
          wait: 0,
          phase: (i * 2 + k) * 1.7
        });
      }
    }

    this.scene.add(this.group);
  }

  toggle(visible) {
    this.group.visible = visible;
  }

  update(time, dt = 0.016) {
    if (!this.group.visible) return;

    for (let i = 0; i < this.workers.length; i++) {
      const w = this.workers[i];

      if (w.wait > 0) {
        w.wait -= dt;
        // 在工島中心點頭交接動作
        w.mesh.rotation.x = Math.sin(w.wait * 8.0) * 0.15;
        w.mesh.userData.legL.rotation.x = 0;
        w.mesh.userData.legR.rotation.x = 0;
        continue;
      }

      w.mesh.rotation.x = 0;
      const dist = Math.hypot(w.pB.x - w.pA.x, w.pB.z - w.pA.z);
      w.t += (w.speed * dt * w.dir) / Math.max(dist, 1.0);

      if (w.t >= 0.85) {
        w.t = 0.85;
        w.dir = -1;
        w.wait = 1.2; // 到站交接停頓 1.2 秒
      } else if (w.t <= 0.15) {
        w.t = 0.15;
        w.dir = 1;
        w.wait = 1.2;
      }

      const x = THREE.MathUtils.lerp(w.pA.x, w.pB.x, w.t);
      const z = THREE.MathUtils.lerp(w.pA.z, w.pB.z, w.t);

      // 過橋時隨拱橋高度微微隆起
      let bridgeArch = 0;
      if (w.t > 0.35 && w.t < 0.65) {
        const bt = (w.t - 0.35) / 0.30;
        bridgeArch = Math.sin(bt * Math.PI) * 0.14;
      }

      // 邁步跳躍感
      const walkCycle = time * 10.0 + w.phase;
      const hop = Math.abs(Math.sin(walkCycle)) * 0.045;

      w.mesh.position.set(x, GRID.TOP + bridgeArch + hop, z);

      // 面向前進方向
      const targetX = w.dir > 0 ? w.pB.x : w.pA.x;
      const targetZ = w.dir > 0 ? w.pB.z : w.pA.z;
      w.mesh.lookAt(targetX, w.mesh.position.y, targetZ);

      // 雙腿前後擺動
      const swing = Math.sin(walkCycle) * 0.6;
      w.mesh.userData.legL.rotation.x = swing;
      w.mesh.userData.legR.rotation.x = -swing;
    }
  }
}
