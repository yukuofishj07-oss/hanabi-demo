import * as THREE from "three";
import { GRID } from "../config/constants.js";

export class WorkerCrowd {
  constructor(scene, islandDataList, flowDefs, graph, onHandoffCallback) {
    this.scene = scene;
    this.graph = graph;
    this.onHandoff = onHandoffCallback;

    this.workers = [];
    const totalWorkers = flowDefs.length;

    // 1. 工人軀體 InstancedMesh (大頭 + 身體)
    const bodyGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.32, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
    this.bodyMesh = new THREE.InstancedMesh(bodyGeo, bodyMat, totalWorkers);
    this.bodyMesh.castShadow = true;

    // 2. 搬運貨物 InstancedMesh (箱子/火藥桶/紙殼)
    const cargoGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const cargoMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
    this.cargoMesh = new THREE.InstancedMesh(cargoGeo, cargoMat, totalWorkers);
    this.cargoMesh.castShadow = true;

    // 3. 柔和假影子
    const shadowGeo = new THREE.CircleGeometry(0.16, 8);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    this.shadowMesh = new THREE.InstancedMesh(shadowGeo, shadowMat, totalWorkers);

    this.dummy = new THREE.Object3D();
    this.cargoDummy = new THREE.Object3D();

    const workerUniforms = [0xdb6a41, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6, 0xe67e22];

    flowDefs.forEach((flow, idx) => {
      const pathPoints = this.graph.findPath(flow.from, flow.to);

      this.workers.push({
        flow,
        path: pathPoints,
        pathIndex: 0,
        forward: true,
        progress: 0,
        speed: 0.018 + (idx % 3) * 0.003, // 符合速度規格
        state: "walking", // "walking" | "handoff"
        waitTimer: 0,
        x: pathPoints[0]?.x || 0,
        z: pathPoints[0]?.z || 0,
        facing: 0
      });

      this.bodyMesh.setColorAt(idx, new THREE.Color(workerUniforms[idx % workerUniforms.length]));
      this.cargoMesh.setColorAt(idx, new THREE.Color(flow.color));
    });

    if (this.bodyMesh.instanceColor) this.bodyMesh.instanceColor.needsUpdate = true;
    if (this.cargoMesh.instanceColor) this.cargoMesh.instanceColor.needsUpdate = true;

    this.scene.add(this.bodyMesh);
    this.scene.add(this.cargoMesh);
    this.scene.add(this.shadowMesh);
  }

  toggle(visible) {
    this.bodyMesh.visible = visible;
    this.cargoMesh.visible = visible;
    this.shadowMesh.visible = visible;
  }

  update(time) {
    if (!this.bodyMesh.visible) return;

    for (let i = 0; i < this.workers.length; i++) {
      const w = this.workers[i];
      if (!w.path || w.path.length < 2) continue;

      if (w.state === "handoff") {
        // 到達終點交接裝卸物料：停留 1.4 秒
        w.waitTimer -= 0.016;

        // 到站工作動作：微微點頭/彎腰
        const bow = Math.sin(w.waitTimer * 8.0) * 0.15;
        this.dummy.position.set(w.x, GRID.TOP + 0.16, w.z);
        this.dummy.rotation.set(bow, w.facing, 0);
        this.dummy.scale.set(1, 1, 1);
        this.dummy.updateMatrix();
        this.bodyMesh.setMatrixAt(i, this.dummy.matrix);

        // 貨物放在身前交接台上
        this.cargoDummy.position.set(
          w.x + Math.sin(w.facing) * 0.2,
          GRID.TOP + 0.08,
          w.z + Math.cos(w.facing) * 0.2
        );
        this.cargoDummy.rotation.set(0, w.facing, 0);
        this.cargoDummy.updateMatrix();
        this.cargoMesh.setMatrixAt(i, this.cargoDummy.matrix);

        if (w.waitTimer <= 0) {
          // 折返
          w.forward = !w.forward;
          w.state = "walking";
          w.pathIndex = w.forward ? 0 : w.path.length - 2;
          w.progress = 0;
          if (this.onHandoff) {
            this.onHandoff(w.flow, w.forward ? "出發" : "抵達");
          }
        }
      } else {
        // 正常沿路網行進
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
              w.waitTimer = 1.4; // 端點停 1.4 秒交接
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

        // 搬運時的小跳步步伐擺動
        const hop = Math.abs(Math.sin(time * 9.0 + i * 2)) * 0.04;
        this.dummy.position.set(w.x, GRID.TOP + 0.16 + hop, w.z);
        this.dummy.rotation.set(0, w.facing, 0);
        this.dummy.updateMatrix();
        this.bodyMesh.setMatrixAt(i, this.dummy.matrix);

        // 手上抱著或頭頂頂著物料貨物（隨步伐微晃）
        this.cargoDummy.position.set(
          w.x + Math.sin(w.facing) * 0.12,
          GRID.TOP + 0.38 + hop,
          w.z + Math.cos(w.facing) * 0.12
        );
        this.cargoDummy.rotation.set(0, w.facing, 0);
        this.cargoDummy.updateMatrix();
        this.cargoMesh.setMatrixAt(i, this.cargoDummy.matrix);
      }

      // 影子貼合島面
      this.dummy.position.set(w.x, GRID.TOP + 0.005, w.z);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.shadowMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.bodyMesh.instanceMatrix.needsUpdate = true;
    this.cargoMesh.instanceMatrix.needsUpdate = true;
    this.shadowMesh.instanceMatrix.needsUpdate = true;
  }
}
