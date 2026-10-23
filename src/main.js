import * as THREE from "three";
import { SceneManager } from "./core/scene.js";
import { Environment } from "./core/environment.js";
import { DATA } from "./config/data.js";
import { buildHexIslands, axialToWorld } from "./island/grid.js";
import { buildBridges } from "./island/bridges.js";
import { AssetKit } from "./assets/kit.js";
import { buildAllBuildings } from "./assets/buildings.js";
import { FlowLinesManager } from "./logistics/flows.js";
import { FireworksEngine } from "./fireworks/engine.js";

class App {
  constructor() {
    this.container = document.getElementById("canvas-container");

    try {
      this.sceneMgr = new SceneManager(this.container);
      this.env = new Environment(this.sceneMgr.scene);
      this.kit = new AssetKit();

      // 1. 六角島 (S 型蛇狀佈局)
      const { islandMeshes } = buildHexIslands(
        this.sceneMgr.scene,
        DATA.islands,
        (island) => this.selectIsland(island)
      );
      this.islandMeshes = islandMeshes;

      // 2. S 型小拱橋
      buildBridges(this.sceneMgr.scene, DATA.islands);

      // 3. 實例化工坊、植栽樹木、長椅與路燈
      buildAllBuildings(this.sceneMgr.scene, this.kit, DATA.islands);

      // 4. 工藝流光帶
      this.flowMgr = new FlowLinesManager(this.sceneMgr.scene, DATA.islands, DATA.flowLines);

      // 5. 璀璨煙火引擎 (無音效干擾)
      this.fireworks = new FireworksEngine(this.sceneMgr.scene);

      this.setupRaycast();
      this.setupUI();
      this.setupAutoFireworks();

      this.fpsBadge = document.getElementById("fps-badge");
      this.frameCount = 0;
      this.lastFpsUpdate = performance.now();

      // 進入畫面
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
    // 每隔 2.5 秒自動由發射陣地升空一枚璀璨煙火
    setInterval(() => {
      this.fireworks.launch();
    }, 2500);
  }

  setupRaycast() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener("pointerup", (e) => {
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
    document.getElementById("card-type").innerText = `第 ${island.step} 道工序`;
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

    const target = axialToWorld(island.axial.q, island.axial.r);
    this.sceneMgr.flyTo(new THREE.Vector3(target.x, 0.65, target.z));

    document.querySelectorAll(".island-label-pill").forEach((pill) => {
      if (pill.innerText.includes(island.name.split(" ")[1])) {
        pill.classList.add("selected");
      } else {
        pill.classList.remove("selected");
      }
    });

    this.addLiveLog(`🔍 檢視工藝工序：${island.name}`);
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
    document.getElementById("card-close-btn").addEventListener("click", () => {
      document.getElementById("detail-card").classList.remove("active");
      document.querySelectorAll(".island-label-pill").forEach((p) => p.classList.remove("selected"));
    });

    // 於指定島嶼上空發射
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

    // 流光開關
    let flowActive = true;
    document.getElementById("toggle-flow").addEventListener("click", (e) => {
      flowActive = !flowActive;
      e.target.classList.toggle("active", flowActive);
      this.flowMgr.toggle(flowActive);
    });

    // 鳥瞰模式切換
    let topdown = false;
    document.getElementById("btn-topdown").addEventListener("click", () => {
      topdown = !topdown;
      if (topdown) {
        this.sceneMgr.setTopdownView();
      } else {
        this.sceneMgr.flyTo(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 26, 44));
      }
    });

    // 單發發射
    document.getElementById("btn-launch-firework").addEventListener("click", () => {
      this.fireworks.launch();
      this.addLiveLog("💥 10號砲陣地發射 10吋尺玉錦冠煙火");
    });

    // 萬彈齊發
    document.getElementById("btn-launch-barrage").addEventListener("click", () => {
      this.fireworks.launchBarrage();
      this.addLiveLog("🎆 10號砲陣地啟動連發矩陣盛典齊射！");
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

    const time = this.clock.getElapsedTime();

    this.sceneMgr.update();
    this.env.update(time);
    this.flowMgr.update(time);
    this.fireworks.update();
    this.sceneMgr.render();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new App();
});
