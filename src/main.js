import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { WORLD } from "./config/constants.js";
import { DATA } from "./config/data.js";
import { EnvironmentManager } from "./world/environment.js";
import { IslandsBuilder, axialToWorld } from "./world/islands.js";
import { KitBuilder } from "./world/kit.js";
import { WalkersAndFlowsManager } from "./entities/walkers.js";
import { FireworksShow } from "./entities/fireworks.js";
import { UIController } from "./ui/interface.js";

class HanabiPolicyIslandApp {
  constructor() {
    try {
      this.container = document.getElementById("canvas-container");
      this.minutes = 600; // 從白天 10:00 開始自動走
      this.isPaused = false;
      this.isTopDown = false;
      this.selectedOwnerId = null;

      this.initRendererAndCamera();
      this.env = new EnvironmentManager(this.scene);
      this.islandsBuilder = new IslandsBuilder(this.scene, DATA.islands);
      this.kitBuilder = new KitBuilder(this.scene, DATA.islands);

      this.walkersMgr = new WalkersAndFlowsManager(
        this.scene,
        DATA.flows,
        this.islandsBuilder,
        (ev, flow) => {
          if (this.ui) this.ui.pushLiveLog(ev, flow);
        }
      );

      this.fireworks = new FireworksShow(this.scene, DATA.islands);

      this.ui = new UIController(this.scene, DATA, this.kitBuilder, {
        onSelectIsland: (isl) => this.selectIsland(isl),
        onSelectItem: (item, isl) => this.selectItem(item, isl),
        onSelectFlow: (flow) => this.selectFlow(flow)
      });

      // 初始推播 3 筆日誌
      this.ui.pushLiveLog("depart", DATA.flows[0]);
      this.ui.pushLiveLog("handoff", DATA.flows[5]);
      this.ui.pushLiveLog("handoff", DATA.flows[9]);

      this.bindEvents();
      this.setPanoramaView(false);

      // 定期施放煙火 (於 11 號迫擊砲陣地與 12 號觀禮台)
      setInterval(() => {
        if (!this.isPaused) {
          this.fireworks.launchFromIsland(DATA.islands[10]);
        }
      }, 3200);

      document.getElementById("loading-overlay").classList.add("hidden");

      this.clock = new THREE.Clock();
      this.animate();
    } catch (err) {
      console.error(err);
      const title = document.getElementById("loading-title");
      const sub = document.getElementById("loading-sub");
      if (title) title.innerText = "載入失敗：" + err.message;
      if (sub) sub.innerText = "請確認您的瀏覽器支援 WebGL2 與網路連線正常。";
    }
  }

  initRendererAndCamera() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();

    // 規格書第 3 節：PerspectiveCamera fov 32（窄視角做出微縮模型城市感）
    this.camera = new THREE.PerspectiveCamera(32, this.width / this.height, 0.5, 650);

    const isMobile = this.width <= 800;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.4 : 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.width, this.height);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.inset = "0";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    this.container.appendChild(this.labelRenderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(18);
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(70);
    this.controls.minDistance = 12;
    this.controls.maxDistance = 195;

    this.flyState = { active: false, t0: 0, dur: 800, sPos: new THREE.Vector3(), ePos: new THREE.Vector3(), sTar: new THREE.Vector3(), eTar: new THREE.Vector3() };

    this.renderer.domElement.addEventListener("pointerdown", () => {
      this.flyState.active = false;
    });

    const ro = new ResizeObserver(() => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.labelRenderer.setSize(this.width, this.height);
    });
    ro.observe(document.body);
  }

  flyTo(targetVec, offsetVec) {
    this.flyState.sPos.copy(this.camera.position);
    this.flyState.sTar.copy(this.controls.target);
    this.flyState.eTar.copy(targetVec);
    this.flyState.ePos.copy(targetVec).add(offsetVec);
    this.flyState.t0 = performance.now();
    this.flyState.active = true;
  }

  setPanoramaView(animate = true) {
    const dir = new THREE.Vector3(0.24, 0.36, 0.87).normalize();
    const dist = this.width / this.height > 1.3 ? 105 : 135;
    const center = new THREE.Vector3(-4, 0, 0);

    if (!animate) {
      this.controls.target.copy(center);
      this.camera.position.copy(center).addScaledVector(dir, dist);
      this.controls.update();
    } else {
      this.flyTo(center, dir.multiplyScalar(dist));
    }
  }

  selectIsland(island) {
    const S = WORLD.SCALE;
    this.selectedOwnerId = island.id;
    this.ui.renderIslandCard(island);
    this.walkersMgr.highlightRelatedFlows(island.id, null);

    const { x, z } = axialToWorld(island.axial.q, island.axial.r);
    const deskShift = this.width > 860 ? 1.5 * S : 0;
    this.flyTo(
      new THREE.Vector3(x + deskShift * 0.25, WORLD.TOP, z),
      new THREE.Vector3(2.75 * S, 5.3 * S, 6.2 * S)
    );
    this.fireworks.launchFromIsland(island);
  }

  selectItem(item, island) {
    const S = WORLD.SCALE;
    this.selectedOwnerId = item.id;
    this.ui.renderItemCard(item, island);
    this.walkersMgr.highlightRelatedFlows(island.id, null);

    const anchor = this.kitBuilder.itemAnchors[item.id];
    if (anchor) {
      this.flyTo(
        new THREE.Vector3(anchor.x, WORLD.TOP + 0.5, anchor.z),
        new THREE.Vector3(1.6 * S, 2.5 * S, 3.2 * S)
      );
    }
  }

  selectFlow(flow) {
    const S = WORLD.SCALE;
    this.selectedOwnerId = null;
    this.ui.clearItemPins();
    this.ui.updatePillSelection(null);
    this.ui.renderFlowCard(flow);
    this.walkersMgr.highlightRelatedFlows(null, flow.id);

    const islA = DATA.islands.find((i) => i.id === flow.from);
    const islB = DATA.islands.find((i) => i.id === flow.to);
    if (islA && islB) {
      const pA = axialToWorld(islA.axial.q, islA.axial.r);
      const pB = axialToWorld(islB.axial.q, islB.axial.r);
      this.flyTo(
        new THREE.Vector3((pA.x + pB.x) * 0.5, WORLD.TOP, (pA.z + pB.z) * 0.5),
        new THREE.Vector3(3.2 * S, 6.8 * S, 8.2 * S)
      );
    }
  }

  clearSelection() {
    this.selectedOwnerId = null;
    this.ui.clearItemPins();
    this.ui.updatePillSelection(null);
    document.getElementById("detail-card").classList.remove("active");
    this.walkersMgr.highlightRelatedFlows(null, null);
  }

  bindEvents() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPt = { x: 0, y: 0 };

    this.renderer.domElement.addEventListener("pointerdown", (e) => {
      downPt = { x: e.clientX, y: e.clientY };
    });

    this.renderer.domElement.addEventListener("pointerup", (e) => {
      if (Math.hypot(e.clientX - downPt.x, e.clientY - downPt.y) > 6) return;

      mouse.x = (e.clientX / this.width) * 2 - 1;
      mouse.y = -(e.clientY / this.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);

      // 優先拾取細項 -> 小人 -> 協作線 -> 島嶼
      const itemHits = raycaster.intersectObjects(this.kitBuilder.itemPickMeshes, false);
      if (itemHits.length > 0) {
        const { item, island } = itemHits[0].object.userData;
        this.selectItem(item, island);
        return;
      }

      const walkerHits = raycaster.intersectObjects(this.walkersMgr.walkerPickMeshes, true);
      if (walkerHits.length > 0) {
        let obj = walkerHits[0].object;
        while (obj && !obj.userData?.flow) obj = obj.parent;
        if (obj && obj.userData?.flow) {
          this.selectFlow(obj.userData.flow);
          return;
        }
      }

      const islHits = raycaster.intersectObjects(this.islandsBuilder.islandMeshes, false);
      if (islHits.length > 0) {
        this.selectIsland(islHits[0].object.userData.island);
      }
    });

    document.getElementById("card-close-btn").addEventListener("click", () => this.clearSelection());
    document.getElementById("btn-panorama").addEventListener("click", () => {
      this.clearSelection();
      this.setPanoramaView(true);
    });
    document.getElementById("btn-toggle-sidebar").addEventListener("click", () => {
      document.body.classList.toggle("sidebar-closed");
    });
    document.getElementById("btn-fire-now").addEventListener("click", () => {
      this.fireworks.launchSalvo();
    });

    // 時段四鈕
    document.querySelectorAll(".time-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".time-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.minutes = parseInt(btn.getAttribute("data-min"), 10);
        if (this.minutes >= 1080) {
          this.fireworks.launchSalvo();
        }
      });
    });

    // 六個 HUD 開關
    const bindSwitch = (id, fn) => {
      const el = document.getElementById(id);
      el.addEventListener("click", () => {
        const active = el.classList.toggle("active");
        fn(active);
      });
    };

    bindSwitch("sw-badges", (v) => this.walkersMgr.setSwitches({ badges: v }));
    bindSwitch("sw-cargo", (v) => this.walkersMgr.setSwitches({ cargo: v }));
    bindSwitch("sw-flows", (v) => {
      this.walkersMgr.setSwitches({ flows: v });
      document.getElementById("flow-legend").classList.toggle("hidden", !v);
    });
    bindSwitch("sw-pause", (v) => { this.isPaused = v; });
    bindSwitch("sw-topdown", (v) => {
      this.isTopDown = v;
      if (v) {
        this.flyTo(new THREE.Vector3(-4, 0, 0), new THREE.Vector3(0.05, 145, 18));
      } else {
        this.setPanoramaView(true);
      }
    });
    bindSwitch("sw-log", (v) => {
      document.getElementById("live-log-panel").style.display = v ? "block" : "none";
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.clearSelection();
    });
  }

  formatClock(min) {
    const m = Math.floor(((min % 1440) + 1440) % 1440);
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  getActiveDayCycleItems(min) {
    const m = ((min % 1440) + 1440) % 1440;
    for (let dc of DATA.dayCycle) {
      if (m >= dc.start && m < dc.end) return dc.activeItems;
    }
    return [];
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.08);
    const elapsed = this.clock.getElapsedTime();

    if (!this.isPaused) {
      // 時鐘：每秒 10 分鐘 (一天 144 秒)
      this.minutes = (this.minutes + dt * 10) % 1440;
      document.getElementById("clock-display").innerText = this.formatClock(this.minutes);
    }

    // 相機 800ms easeInOutCubic 飛行插值
    if (this.flyState.active) {
      const p = Math.min((performance.now() - this.flyState.t0) / this.flyState.dur, 1.0);
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      this.camera.position.lerpVectors(this.flyState.sPos, this.flyState.ePos, ease);
      this.controls.target.lerpVectors(this.flyState.sTar, this.flyState.eTar, ease);
      if (p >= 1.0) this.flyState.active = false;
    }

    this.controls.update();

    const nightFactor = this.env.updateByMinutes(this.minutes, elapsed);
    this.kitBuilder.updateNightGlow(nightFactor);

    const cycleItems = this.getActiveDayCycleItems(this.minutes);
    this.kitBuilder.updateHighlights(this.selectedOwnerId, cycleItems);

    if (!this.isPaused) {
      this.walkersMgr.update(elapsed, dt, this.camera.position);
      this.fireworks.update();
    }

    this.ui.updateThumbAnimation();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new HanabiPolicyIslandApp();
});
