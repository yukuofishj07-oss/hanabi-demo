import * as THREE from "three";
import { SceneManager } from "./core/scene.js";
import { Environment } from "./core/environment.js";
import { DATA } from "./config/data.js";
import { buildHexIslands, axialToWorld } from "./island/grid.js";
import { buildBridges } from "./island/bridges.js";
import { AssetKit } from "./assets/kit.js";
import { buildAllBuildings } from "./assets/buildings.js";
import { FlowLinesManager } from "./logistics/flows.js";
import { WorkerCrowd } from "./logistics/workers.js";
import { FireworksEngine } from "./fireworks/engine.js";

class App {
  constructor() {
    this.container = document.getElementById("canvas-container");

    try {
      this.sceneMgr = new SceneManager(this.container);
      this.env = new Environment(this.sceneMgr.scene);
      this.kit = new AssetKit();

      // 六角島與標籤
      const { islandMeshes } = buildHexIslands(
        this.sceneMgr.scene,
        DATA.islands,
        (island) => this.selectIsland(island)
      );
      this.islandMeshes = islandMeshes;

      // 橋樑、建築、輸送流光線、小人工匠、煙火物理引擎
      buildBridges(this.sceneMgr.scene, DATA.islands);
      buildAllBuildings(this.sceneMgr.scene, this.kit, DATA.islands);

      this.flowMgr = new FlowLinesManager(this.sceneMgr.scene, DATA.islands, DATA.flowLines);
      this.workerCrowd = new WorkerCrowd(this.sceneMgr.scene, DATA.islands);
      this.fireworks = new FireworksEngine(this.sceneMgr.scene);

      this.setupRaycast();
      this.setupUI();
      this.setupAutoFireworks();

      document.getElementById("loading-overlay").classList.add("hidden");
      this.clock = new THREE.Clock();
      this.animate();
    } catch (err) {
      console.error("Initialization Failed:", err);
      const errBox = document.createElement("div");
      errBox.style.cssText = "color:red;padding:20px;position:absolute;top:0;z-index:9999;";
      errBox.innerText = "無法載入 3D 渲染系統：" + err.message;
      document.body.appendChild(errBox);
    }
  }

  setupAutoFireworks() {
    // 預設每隔 4 秒由發射陣地隨機升空一枚煙火
    setInterval(() => {
      this.fireworks.launch();
    }, 4000);
  }

  setupRaycast() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener("pointerup", (e) => {
      // 避免拖曳視角時誤觸點選
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
    document.getElementById("card-type").innerText = "花火工藝流程島";
    document.getElementById("card-title").innerText = island.name;
    document.getElementById("card-desc").innerText = island.desc;

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

    // 相機平滑飛行聚焦（800ms easeInOutCubic）
    const target = axialToWorld(island.axial.q, island.axial.r);
    this.sceneMgr.flyTo(new THREE.Vector3(target.x, 0.65, target.z));

    // 高亮 UI Pill
    document.querySelectorAll(".island-label-pill").forEach((pill) => {
      if (pill.innerText.includes(island.name)) {
        pill.classList.add("selected");
      } else {
        pill.classList.remove("selected");
      }
    });

    // 推播日誌
    this.addLiveLog(`🔍 檢視中：${island.name}（工序執行狀態正常）`);
  }

  addLiveLog(msg) {
    const list = document.getElementById("log-list");
    const item = document.createElement("div");
    item.className = "log-item";
    item.innerText = msg;
    list.prepend(item);
    if (list.children.length > 4) {
      list.removeChild(list.lastChild);
    }
  }

  setupUI() {
    // 關閉卡片
    document.getElementById("card-close-btn").addEventListener("click", () => {
      document.getElementById("detail-card").classList.remove("active");
      document.querySelectorAll(".island-label-pill").forEach((p) => p.classList.remove("selected"));
    });

    // 從目前選取的島嶼發射專屬煙火
    document.getElementById("card-fire-btn").addEventListener("click", () => {
      if (this.currentSelectedIsland) {
        const p = axialToWorld(this.currentSelectedIsland.axial.q, this.currentSelectedIsland.axial.r);
        this.fireworks.launch(new THREE.Vector3(p.x, 0.65, p.z));
        this.addLiveLog(`🚀 ${this.currentSelectedIsland.name} 現場直接升空試射！`);
      }
    });

    // 時段切換
    document.querySelectorAll(".hud-btn[data-time]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".hud-btn[data-time]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const minutes = parseInt(btn.getAttribute("data-time"), 10);
        this.env.setTime(minutes);
        this.addLiveLog(`🕒 時段變更至 ${btn.innerText.trim()}`);
      });
    });

    // 輸送管線開關
    let flowActive = true;
    document.getElementById("toggle-flow").addEventListener("click", (e) => {
      flowActive = !flowActive;
      e.target.classList.toggle("active", flowActive);
      this.flowMgr.toggle(flowActive);
    });

    // 工匠小人開關
    let workersActive = true;
    document.getElementById("toggle-workers").addEventListener("click", (e) => {
      workersActive = !workersActive;
      e.target.classList.toggle("active", workersActive);
      this.workerCrowd.toggle(workersActive);
    });

    // 鳥瞰視角切換
    let topdown = false;
    document.getElementById("btn-topdown").addEventListener("click", () => {
      topdown = !topdown;
      if (topdown) {
        this.sceneMgr.setTopdownView();
      } else {
        this.sceneMgr.flyTo(new THREE.Vector3(0, 0, 0), new THREE.Vector3(22, 28, 44));
      }
    });

    // 單發發射
    document.getElementById("btn-launch-firework").addEventListener("click", () => {
      this.fireworks.launch();
      this.addLiveLog("💥 11號陣地發射 10吋尺玉錦冠煙火");
    });

    // 連發多發齊射
    document.getElementById("btn-launch-barrage").addEventListener("click", () => {
      this.fireworks.launchBarrage();
      this.addLiveLog("🎆 11號陣地啟動 32 連發矩陣花火速射盛典！");
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = this.clock.getElapsedTime();

    this.sceneMgr.update();
    this.env.update(time);
    this.flowMgr.update(time);
    this.workerCrowd.update(time);
    this.fireworks.update();
    this.sceneMgr.render();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new App();
});
