import * as THREE from "three";
import { GRID } from "../config/constants.js";

export class WorkerCrowd {
  constructor(scene, islandDataList, flowDefs, graph, onHandoffCallback) {
    this.scene = scene;
    this.graph = graph;
    this.onHandoff = onHandoffCallback;

    this.workers = [];
    const totalWorkers = flowDefs.length;

    // 1. 人偶軀幹 (Capsule 工裝身軀)
    const bodyGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.22, 10);
    const bodyMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
    this.bodyMesh = new THREE.InstancedMesh(bodyGeo, bodyMat, totalWorkers);
    this.bodyMesh.castShadow = true;

    // 2. 圓圓 Chibi 大頭 (直徑 0.2)
    const headGeo = new THREE.SphereGeometry(0.11, 10, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3, roughness: 0.75 });
    this.headMesh = new THREE.InstancedMesh(headGeo, headMat, totalWorkers);
    this.headMesh.castShadow = true;

    // 3. 工作安全帽
    const hatGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.07, 10);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.5 });
    this.hatMesh = new THREE.InstancedMesh(hatGeo, hatMat, totalWorkers);
    this.hatMesh.castShadow = true;

    // 4. 左腿與右腿 (各一組 InstancedMesh 模擬跨步動作)
    const legGeo = new THREE.BoxGeometry(0.05, 0.12, 0.06);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.8 });
    this.leftLegMesh = new THREE.InstancedMesh(legGeo, legMat, totalWorkers);
    this.rightLegMesh = new THREE.InstancedMesh(legGeo, legMat, totalWorkers);

    // 5. 搬運之貨物托盤/火藥箱
    const cargoGeo = new THREE.BoxGeometry(0.16, 0.10, 0.16);
    const cargoMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
    this.cargoMesh = new THREE.InstancedMesh(cargoGeo, cargoMat, totalWorkers);
    this.cargoMesh.castShadow = true;

    // 6. 柔和貼地假陰影
    const shadowGeo = new THREE.CircleGeometry(0.18, 10);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    this.shadowMesh = new THREE.InstancedMesh(shadowGeo, shadowMat, totalWorkers);

    this.dummy = new THREE.Object3D();
    const workerUniforms = [0xdb6a41, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6, 0xe67e22];

    flowDefs.forEach((flow, idx) => {
      const pathPoints = this.graph.findPath(flow.from, flow.to);

      this.workers.push({
        flow,
        path: pathPoints,
        pathIndex: 0,
        forward: true,
        progress: 0,
        speed: 0.016 + (idx % 3) * 0.003,
        state: "walking",
        waitTimer: 0,
        x: pathPoints[0]?.x || 0,
        z: pathPoints[0]?.z || 0,
        facing: 0,
        walkPhase: Math.random() * 10
      });

      this.bodyMesh.setColorAt(idx, new THREE.Color(workerUniforms[idx % workerUniforms.length]));
      this.cargoMesh.setColorAt(idx, new THREE.Color(flow.color));
    });

    if (this.bodyMesh.instanceColor) this.bodyMesh.instanceColor.needsUpdate = true;
    if (this.cargoMesh.instanceColor) this.cargoMesh.instanceColor.needsUpdate = true;

    this.scene.add(this.bodyMesh);
    this.scene.add(this.headMesh);
    this.scene.add(this.hatMesh);
    this.scene.add(this.leftLegMesh);
    this.scene.add(this.rightLegMesh);
    this.scene.add(this.cargoMesh);
    this.scene.add(this.shadowMesh);
  }

  toggle(visible) {
    this.bodyMesh.visible = visible;
    this.headMesh.visible = visible;
    this.hatMesh.visible = visible;
    this.leftLegMesh.visible = visible;
    this.rightLegMesh.visible = visible;
    this.cargoMesh.visible = visible;
    this.shadowMesh.visible = visible;
  }

  update(time) {
    if (!this.bodyMesh.visible) return;

    for (let i = 0; i < this.workers.length; i++) {
      const w = this.workers[i];
      if (!w.path || w.path.length < 2) continue;

      let hop = 0;
      let legSwing = 0;

      if (w.state === "handoff") {
        w.waitTimer -= 0.016;
        const bow = Math.sin(w.waitTimer * 7.0) * 0.18;

        // 卸貨交接點頭動作
        this.dummy.position.set(w.x, GRID.TOP + 0.18, w.z);
        this.dummy.rotation.set(bow, w.facing, 0);
        this.dummy.scale.set(1, 1, 1);
        this.dummy.updateMatrix();
        this.bodyMesh.setMatrixAt(i, this.dummy.matrix);

        this.dummy.position.set(w.x, GRID.TOP + 0.33, w.z);
        this.dummy.updateMatrix();
        this.headMesh.setMatrixAt(i, this.dummy.matrix);

        this.dummy.position.set(w.x, GRID.TOP + 0.43, w.z);
        this.dummy.updateMatrix();
        this.hatMesh.setMatrixAt(i, this.dummy.matrix);

        // 貨物置於工島交接台上
        this.dummy.position.set(
          w.x + Math.sin(w.facing) * 0.22,
          GRID.TOP + 0.06,
          w.z + Math.cos(w.facing) * 0.22
        );
        this.dummy.updateMatrix();
        this.cargoMesh.setMatrixAt(i, this.dummy.matrix);

        // 雙腳直立
        this.dummy.position.set(w.x - 0.04, GRID.TOP + 0.06, w.z);
        this.dummy.rotation.set(0, w.facing, 0);
        this.dummy.updateMatrix();
        this.leftLegMesh.setMatrixAt(i, this.dummy.matrix);
        this.dummy.position.set(w.x + 0.04, GRID.TOP + 0.06, w.z);
        this.dummy.updateMatrix();
        this.rightLegMesh.setMatrixAt(i, this.dummy.matrix);

        if (w.waitTimer <= 0) {
          w.forward = !w.forward;
          w.state = "walking";
          w.pathIndex = w.forward ? 0 : w.path.length - 2;
          w.progress = 0;
          if (this.onHandoff) {
            this.onHandoff(w.flow, w.forward ? "出發" : "抵達");
          }
        }
      } else {
        // 正常步行
        const p1 = w.forward ? w.path[w.pathIndex] : w.path[w.pathIndex + 1];
        const p2 = w.forward ? w.path[w.pathIndex + 1] : w.path[w.pathIndex];

        const segDist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
        w.progress += w.speed / Math.max(segDist, 0.1);

        if (w.progress >= 1.0) {
          w.progress = 0;
          if (w.forward) {
            w.pathIndex++;
            if (w.pathIndex >= w.path.length - 1) {
              w.state = "handoff";
              w.waitTimer = 1.4;
            }
          } else {
            w.pathIndex--;
            if (w.pathIndex < 0) {
              w.state = "handoff";
              w.waitTimer = 1.4;
            }
          }
        }

        w.x = THREE.MathUtils.lerp(p1.x, p2.x, Math.min(w.progress, 1.0));
        w.z = THREE.MathUtils.lerp(p1.z, p2.z, Math.min(w.progress, 1.0));
        w.facing = Math.atan2(p2.x - p1.x, p2.z - p1.z);

        // 邁步與小跳步步伐
        legSwing = Math.sin(time * 9.0 + w.walkPhase) * 0.55;
        hop = Math.abs(Math.sin(time * 9.0 + w.walkPhase)) * 0.04;

        // 軀幹
        this.dummy.position.set(w.x, GRID.TOP + 0.18 + hop, w.z);
        this.dummy.rotation.set(0, w.facing, 0);
        this.dummy.scale.set(1, 1, 1);
        this.dummy.updateMatrix();
        this.bodyMesh.setMatrixAt(i, this.dummy.matrix);

        // 大頭
        this.dummy.position.set(w.x, GRID.TOP + 0.33 + hop, w.z);
        this.dummy.updateMatrix();
        this.headMesh.setMatrixAt(i, this.dummy.matrix);

        // 安全帽
        this.dummy.position.set(w.x, GRID.TOP + 0.43 + hop, w.z);
        this.dummy.updateMatrix();
        this.hatMesh.setMatrixAt(i, this.dummy.matrix);

        // 左腿邁前、右腿邁後
        this.dummy.position.set(w.x - Math.cos(w.facing) * 0.04, GRID.TOP + 0.06 + hop, w.z + Math.sin(w.facing) * 0.04);
        this.dummy.rotation.set(legSwing, w.facing, 0);
        this.dummy.updateMatrix();
        this.leftLegMesh.setMatrixAt(i, this.dummy.matrix);

        this.dummy.position.set(w.x + Math.cos(w.facing) * 0.04, GRID.TOP + 0.06 + hop, w.z - Math.sin(w.facing) * 0.04);
        this.dummy.rotation.set(-legSwing, w.facing, 0);
        this.dummy.updateMatrix();
        this.rightLegMesh.setMatrixAt(i, this.dummy.matrix);

        // 雙手端在胸前的貨物托盤
        this.dummy.position.set(
          w.x + Math.sin(w.facing) * 0.14,
          GRID.TOP + 0.22 + hop,
          w.z + Math.cos(w.facing) * 0.14
        );
        this.dummy.rotation.set(0, w.facing, 0);
        this.dummy.updateMatrix();
        this.cargoMesh.setMatrixAt(i, this.dummy.matrix);
      }

      // 影子貼地
      this.dummy.position.set(w.x, GRID.TOP + 0.005, w.z);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.shadowMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.bodyMesh.instanceMatrix.needsUpdate = true;
    this.headMesh.instanceMatrix.needsUpdate = true;
    this.hatMesh.instanceMatrix.needsUpdate = true;
    this.leftLegMesh.instanceMatrix.needsUpdate = true;
    this.rightLegMesh.instanceMatrix.needsUpdate = true;
    this.cargoMesh.instanceMatrix.needsUpdate = true;
    this.shadowMesh.instanceMatrix.needsUpdate = true;
  }
}
