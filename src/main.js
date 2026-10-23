import * as THREE from "three";
import { SceneManager } from "./core/scene.js";
import { Environment } from "./core/environment.js";
import { DATA } from "./config/data.js";
import { buildHexIslands, axialToWorld } from "./island/grid.js";
import { buildBridges } from "./island/bridges.js";
import { AssetKit } from "./assets/kit.js";
import { buildAllBuildings } from "./assets/buildings.js";
import { FireworksEngine } from "./fireworks/engine.js";

class App {
  constructor() {
    this.container = document.getElementById("canvas-container");

    try {
      this.sceneMgr = new SceneManager(this.container);
      this.env = new Environment(this.sceneMgr.scene);
      this.kit = new AssetKit();

      const { islandMeshes } = buildHexIslands(this.sceneMgr.scene, DATA.islands);
      this.islandMeshes = islandMeshes;

      buildBridges(this.sceneMgr.scene, DATA.islands);
      buildAllBuildings(this.sceneMgr.scene, this.kit, DATA.islands);

      this.fireworks = new FireworksEngine(this.sceneMgr.scene);

      this.setupRaycast();
      this.setupUI();

      // 定期自動施放煙火
      setInterval(() => {
        this.fireworks.launch();
      }, 3500);

      document.getElementById("loading-overlay").classList.add("hidden");
      this.animate();
    } catch (err) {
      console.error("Initialization Failed:", err);
      const errBox = document.createElement("div");
      errBox.style.cssText = "color:red;padding:20px;position:absolute;top:0;z-index:9999;";
      errBox.innerText = "無法載入 3D 渲染系統：" + err.message;
      document.body.appendChild(errBox);
    }
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
        if (item) this.showIslandCard(item);
      }
    });
  }

  showIslandCard(island) {
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

    // 相機緩動對焦
    const target = axialToWorld(island.axial.q, island.axial.r);
    this.sceneMgr.controls.target.set(target.x, 0, target.z);
  }

  setupUI() {
    document.getElementById("card-close-btn").addEventListener("click", () => {
      document.getElementById("detail-card").classList.remove("active");
    });

    document.querySelectorAll(".hud-btn[data-time]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".hud-btn[data-time]").forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        const minutes = parseInt(e.target.getAttribute("data-time"), 10);
        this.env.setTime(minutes);
      });
    });

    document.getElementById("btn-launch-firework").addEventListener("click", () => {
      this.fireworks.launch();
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.sceneMgr.update();
    this.fireworks.update();
    this.sceneMgr.render();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new App();
});
