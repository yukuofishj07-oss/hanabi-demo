import * as THREE from "three";
import { SceneManager } from "./core/scene.js";
import { Environment } from "./core/environment.js";
import { DATA } from "./config/data.js";
import { buildHexIslands, getIslandPos } from "./island/grid.js";
import { buildBridges } from "./island/bridges.js";
import { buildAllBuildings } from "./assets/buildings.js";
import { WorkerCrowd } from "./logistics/workers.js";
import { FireworksEngine } from "./fireworks/engine.js";

class App {
  constructor() {
    this.container = document.getElementById("canvas-container");

    try {
      this.sceneMgr = new SceneManager(this.container);
      this.env = new Environment(this.sceneMgr.scene);

      // 1. 建立 4-4-2 標準 S 型放大版六角島
      const { islandMeshes } = buildHexIslands(
        this.sceneMgr.scene,
        DATA.islands,
        (island) => this.selectIsland(island)
      );
      this.islandMeshes = islandMeshes;

      // 2. 建立 S 型日式朱紅欄杆拱橋
      buildBridges(this.sceneMgr.scene, DATA.islands);

      // 3. 建立 10 座高細緻度專屬工坊建築與樹木景觀
      buildAllBuildings(this.sceneMgr.scene, DATA.islands);

      // 4. 建立內建二頭身黏土工匠範本群 (沿 S 型路線搬運物料)
      this.workerCrowd = new WorkerCrowd(this.sceneMgr.scene, DATA.islands);

      // 5. 建立 100% 必現 3D 實體發光煙火引擎
      this.fireworks = new FireworksEngine(this.sceneMgr.scene);

      this.setupRaycast();
      this.setupUI();
      this.setupAutoFireworks();

      this.fpsBadge = document.getElementById("fps-badge");
      this.frameCount = 0;
      this.lastFpsUpdate = performance.now();

      // 一進入畫面立刻施放第一波迎賓煙火，讓使用者馬上看到！
      this.fireworks.launch({ x: 0.0, z: 6.2 }, "chrysanthemum");
      setTimeout(() => this.fireworks.launch({ x: -3.4, z: 0.0 }, "peony"), 400);
      setTimeout(() => this.fireworks.launch({ x: 3.4, z: 0.0 }, "willow"), 800);

      document.getElementById("loading-overlay").classList.add("hidden");

      this.clock = new THREE.Clock();
      this.animate();
    } catch (err) {
      console.error("Initialization Failed:", err);
      const errBox = document.createElement("div");
      errBox.style.cssText = "color:red;padding:20px;position:absolute;top:0;z-index:9999;background:#fff;";
      errBox.innerText = "無法載入 3D 渲染系統：" + err.message;
      document.body.appendChild(errBox);
    }
  }

  setupAutoFireworks() {
    // 每 2.2 秒自動發射，保持夜空熱鬧璀璨
    setInterval(() => {
      this.fireworks.launch();
    }, 2200);
  }

  setupRaycast() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };

    window.addEventListener("pointerdown", (e) => {
      downPos.x = e.clientX;
      downPos.y = e.clientY;
    });

    window.addEventListener("pointerup", (e) => {
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) return;

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.sceneMgr.camera);
      const intersects = raycaster.intersectObjects(this.islandMeshes);

      if (intersects.length > 0) {
        const item = intersects[0].object.userData.data;
        if (item) this.selectIsland(item);
      }
    });
  }

  selectIsland(island) {
    this.currentSelectedIsland = island;
    const card = document.getElementById("detail-card");

    document.getElementById("card-step-badge").innerText = `第 ${island.step} 道工序 ． 傳統尺玉古法`;
    document.getElementById("card-title").innerText = island.name;
    document.getElementById("card-purpose").innerText = island.purpose;
    document.getElementById("card-process").innerText = island.process;
    document.getElementById("card-standard").innerText = island.standard;

    const statsGrid = document.getElementById("card-stats");
    statsGrid.innerHTML = "";
    island.items.forEach((it) => {
      const box = document.createElement("div");
      box.className = "stat-box";
      box.innerHTML = `
        <div class="stat-label">${it.name}</div>
        <div class="stat-value">${it.spec}</div>
      `;
      statsGrid.appendChild(box);
    });

    card.classList.add("active");

    const target = getIslandPos(island);
    this.sceneMgr.flyTo(new THREE.Vector3(target.x, 1.8, target.z), new THREE.Vector3(3.2, 6.5, 11.5));

    // 點選島嶼時，順便在該島上方放一顆慶祝煙火！
    this.fireworks.launch({ x: target.x, z: target.z });

    document.querySelectorAll(".island-label-pill").forEach((pill) => {
      if (pill.innerText === island.name) {
        pill.classList.add("selected");
      } else {
        pill.classList.remove("selected");
      }
    });
  }

  setupUI() {
    document.getElementById("card-close-btn").addEventListener("click", () => {
      document.getElementById("detail-card").classList.remove("active");
      document.querySelectorAll(".island-label-pill").forEach((p) => p.classList.remove("selected"));
    });

    document.getElementById("card-fire-btn").addEventListener("click", () => {
      if (this.currentSelectedIsland) {
        const p = getIslandPos(this.currentSelectedIsland);
        this.fireworks.launch({ x: p.x, z: p.z });
      }
    });

    document.querySelectorAll(".hud-btn[data-time]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".hud-btn[data-time]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const minutes = parseInt(btn.getAttribute("data-time"), 10);
        this.env.setTime(minutes);
      });
    });

    let workersOn = true;
    document.getElementById("toggle-workers").addEventListener("click", (e) => {
      workersOn = !workersOn;
      e.target.classList.toggle("active", workersOn);
      e.target.innerText = workersOn ? "👷 工匠: 開" : "👷 工匠: 關";
      this.workerCrowd.toggle(workersOn);
    });

    document.getElementById("btn-reset-cam").addEventListener("click", () => {
      this.sceneMgr.resetOverview();
    });

    document.getElementById("btn-launch-firework").addEventListener("click", () => {
      this.fireworks.launch({ x: 0.0, z: 6.2 });
    });

    document.getElementById("btn-launch-barrage").addEventListener("click", () => {
      this.fireworks.launchBarrage();
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      if (this.fpsBadge) {
        this.fpsBadge.innerText = `${this.frameCount} FPS`;
      }
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.getElapsedTime();

    this.sceneMgr.update();
    this.env.update(time);
    this.workerCrowd.update(time, dt);
    this.fireworks.update();
    this.sceneMgr.render();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new App();
});
