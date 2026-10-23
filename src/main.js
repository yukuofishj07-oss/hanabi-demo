import * as THREE from "three";
import { SceneManager } from "./core/scene.js";
import { Environment } from "./core/environment.js";
import { DATA } from "./config/data.js";
import { buildHexIslands, getIslandPos } from "./island/grid.js";
import { buildBridges } from "./island/bridges.js";
import { BuildingsManager } from "./assets/buildings.js";
import { WorkerCrowd } from "./logistics/workers.js";
import { FireworksEngine } from "./fireworks/engine.js";

class App {
  constructor() {
    this.container = document.getElementById("canvas-container");
    this.currentIndex = 0;
    this.autoTour = true;
    this.tourTimer = 0;

    try {
      this.sceneMgr = new SceneManager(this.container);
      this.env = new Environment(this.sceneMgr.scene);

      // 1. 建立放大兩倍的六角島群與極簡 4 字小標籤
      const { islandMeshes } = buildHexIslands(
        this.sceneMgr.scene,
        DATA.islands,
        (island) => {
          this.stopAutoTour();
          this.selectIsland(island);
        }
      );
      this.islandMeshes = islandMeshes;

      // 2. 建立日式太鼓橋與橋頭燈籠
      buildBridges(this.sceneMgr.scene, DATA.islands);

      // 3. 建立 10 座動態微縮機關工坊與蓬鬆樹簇
      this.buildingsMgr = new BuildingsManager(this.sceneMgr.scene, DATA.islands);

      // 4. 建立二頭身黏土工匠群
      this.workerCrowd = new WorkerCrowd(this.sceneMgr.scene, DATA.islands);

      // 5. 建立流線型金絲拖尾煙火系統
      this.fireworks = new FireworksEngine(this.sceneMgr.scene);

      this.setupRaycast();
      this.setupUI();
      this.setupAutoFireworks();

      this.fpsBadge = document.getElementById("fps-badge");
      this.frameCount = 0;
      this.lastFpsUpdate = performance.now();

      // 開場聚焦第 01 站，並於背景夜空施放三枚迎賓流線煙火
      this.selectIsland(DATA.islands[0], false);
      this.fireworks.launch({ x: -5.1, z: -9.5 }, "chrysanthemum");
      setTimeout(() => this.fireworks.launch({ x: 5.1, z: -9.5 }, "willow"), 450);
      setTimeout(() => this.fireworks.launch({ x: 0.0, z: 9.5 }, "peony"), 900);

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
    setInterval(() => {
      this.fireworks.launch();
    }, 2200);
  }

  stopAutoTour() {
    this.autoTour = false;
    const btn = document.getElementById("btn-auto-tour");
    if (btn) {
      btn.classList.remove("active");
      btn.innerText = "🎬 自動巡覽: 關";
    }
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
        if (item) {
          this.stopAutoTour();
          this.selectIsland(item, true);
        }
      }
    });
  }

  selectIsland(island, showCard = true) {
    this.currentSelectedIsland = island;
    this.currentIndex = DATA.islands.findIndex((isl) => isl.id === island.id);

    const card = document.getElementById("detail-card");
    document.getElementById("card-step-badge").innerText = `標準作業程序 ． ${island.step}`;
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

    if (showCard) {
      card.classList.add("active");
    }

    const target = getIslandPos(island);
    this.sceneMgr.flyToIsland(target);

    // 在該站後方夜空施放專屬禮花
    this.fireworks.launch({ x: target.x, z: target.z - 2.5 });

    document.querySelectorAll(".island-label-pill").forEach((pill) => {
      pill.classList.toggle("selected", pill.dataset.islandId === island.id);
    });
  }

  setupUI() {
    document.getElementById("card-close-btn").addEventListener("click", () => {
      document.getElementById("detail-card").classList.remove("active");
    });

    document.getElementById("card-fire-btn").addEventListener("click", () => {
      if (this.currentSelectedIsland) {
        const p = getIslandPos(this.currentSelectedIsland);
        this.fireworks.launch({ x: p.x, z: p.z });
      }
    });

    // 上一站 / 下一站 導覽
    document.getElementById("btn-prev-island").addEventListener("click", () => {
      this.stopAutoTour();
      this.currentIndex = (this.currentIndex - 1 + DATA.islands.length) % DATA.islands.length;
      this.selectIsland(DATA.islands[this.currentIndex], true);
    });

    document.getElementById("btn-next-island").addEventListener("click", () => {
      this.stopAutoTour();
      this.currentIndex = (this.currentIndex + 1) % DATA.islands.length;
      this.selectIsland(DATA.islands[this.currentIndex], true);
    });

    // 自動巡島導覽開關
    const btnTour = document.getElementById("btn-auto-tour");
    btnTour.addEventListener("click", () => {
      this.autoTour = !this.autoTour;
      btnTour.classList.toggle("active", this.autoTour);
      btnTour.innerText = this.autoTour ? "🎬 自動巡覽: 開" : "🎬 自動巡覽: 關";
      this.tourTimer = 0;
    });

    // 全景俯瞰
    document.getElementById("btn-overview").addEventListener("click", () => {
      this.stopAutoTour();
      document.getElementById("detail-card").classList.remove("active");
      this.sceneMgr.setOverview();
    });

    // 時段切換
    document.querySelectorAll(".hud-btn[data-time]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".hud-btn[data-time]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const minutes = parseInt(btn.getAttribute("data-time"), 10);
        this.env.setTime(minutes);
      });
    });

    document.getElementById("btn-launch-firework").addEventListener("click", () => {
      const p = this.currentSelectedIsland ? getIslandPos(this.currentSelectedIsland) : { x: 0, z: 9.5 };
      this.fireworks.launch(p);
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

    // 方案 A 自動巡島導覽 (每 6.5 秒平滑飛往下一座工藝島)
    if (this.autoTour) {
      this.tourTimer += dt;
      if (this.tourTimer >= 6.5) {
        this.tourTimer = 0;
        this.currentIndex = (this.currentIndex + 1) % DATA.islands.length;
        this.selectIsland(DATA.islands[this.currentIndex], false);
      }
    }

    this.sceneMgr.update();
    this.env.update(time);
    this.buildingsMgr.update(time);
    this.workerCrowd.update(time, dt);
    this.fireworks.update();
    this.sceneMgr.render();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new App();
});
