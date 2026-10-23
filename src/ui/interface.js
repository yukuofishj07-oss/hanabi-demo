import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { WORLD, PALETTE } from "../config/constants.js";
import { axialToWorld } from "../world/islands.js";

const CIRCLED_NUMS = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];

export class UIController {
  constructor(scene, data, kitBuilder, callbacks) {
    this.scene = scene;
    this.data = data;
    this.kitBuilder = kitBuilder;
    this.callbacks = callbacks;

    this.islandPills = {};
    this.pinGroup = new THREE.Group();
    this.scene.add(this.pinGroup);
    this.activePins = [];

    this.initThumbnailRenderer();
    this.buildIslandPillLabels();
    this.populateRightSidebar();
    this.populateLogFilter();
    this.setupOnboarding();
  }

  initThumbnailRenderer() {
    this.thumbCanvas = document.createElement("canvas");
    this.thumbCanvas.width = 160;
    this.thumbCanvas.height = 160;
    this.thumbRenderer = new THREE.WebGLRenderer({ canvas: this.thumbCanvas, alpha: true, antialias: true });
    this.thumbRenderer.setSize(160, 160);
    this.thumbScene = new THREE.Scene();
    this.thumbCam = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
    this.thumbCam.position.set(2.1, 1.8, 2.4);
    this.thumbCam.lookAt(0, 0.35, 0);

    this.thumbScene.add(new THREE.HemisphereLight(0xfff8f4, 0x8f8270, 1.6));
    const dl = new THREE.DirectionalLight(0xfff1de, 2.2);
    dl.position.set(3, 5, 4);
    this.thumbScene.add(dl);

    this.thumbPivot = new THREE.Group();
    this.thumbScene.add(this.thumbPivot);
  }

  populateThumbModel(modelKind, colorHex) {
    while (this.thumbPivot.children.length > 0) {
      this.thumbPivot.remove(this.thumbPivot.children[0]);
    }
    const wallMat = new THREE.MeshStandardMaterial({ color: PALETTE.wallWarm, roughness: 0.78 });
    const mainMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.75 });
    const woodMat = new THREE.MeshStandardMaterial({ color: PALETTE.wood, roughness: 0.8 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.14, 6), woodMat);
    this.thumbPivot.add(base);

    if (modelKind.includes("drum") || modelKind.includes("vat")) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.65, 16), mainMat);
      m.position.y = 0.42;
      m.rotation.z = 0.35;
      this.thumbPivot.add(m);
    } else if (modelKind.includes("mortar") || modelKind.includes("launcher")) {
      for (let i = -1; i <= 1; i++) {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.78, 12), new THREE.MeshStandardMaterial({ color: PALETTE.ink }));
        tube.position.set(i * 0.28, 0.45, 0);
        this.thumbPivot.add(tube);
      }
    } else {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.55, 0.68), wallMat);
      box.position.y = 0.34;
      this.thumbPivot.add(box);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.45, 4), mainMat);
      roof.position.y = 0.82;
      roof.rotation.y = Math.PI / 4;
      this.thumbPivot.add(roof);
    }
  }

  buildIslandPillLabels() {
    this.data.islands.forEach((isl) => {
      const { x, z } = axialToWorld(isl.axial.q, isl.axial.r);
      const div = document.createElement("div");
      div.className = "island-pill-tag";
      div.innerHTML = `<span class="num-prefix">${isl.num}</span>${isl.name}`;
      div.addEventListener("click", (e) => {
        e.stopPropagation();
        this.callbacks.onSelectIsland(isl);
      });

      const obj = new CSS2DObject(div);
      obj.position.set(x, WORLD.TOP + 0.35, z + WORLD.R * 0.88);
      this.scene.add(obj);
      this.islandPills[isl.id] = div;
    });
  }

  showItemPinsForIsland(island) {
    this.clearItemPins();
    if (!island) return;

    const lineMat = new THREE.LineBasicMaterial({ color: PALETTE.coral, depthTest: false, transparent: true, opacity: 0.9 });

    island.items.forEach((item, idx) => {
      const anchor = this.kitBuilder.itemAnchors[item.id];
      if (!anchor) return;

      const pinY = anchor.y + 1.85;
      const pts = [new THREE.Vector3(anchor.x, anchor.y, anchor.z), new THREE.Vector3(anchor.x, pinY, anchor.z)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(lineGeo, lineMat);
      line.renderOrder = 999;
      this.pinGroup.add(line);

      const pinDiv = document.createElement("div");
      pinDiv.className = "item-pin-tag";
      pinDiv.innerText = CIRCLED_NUMS[idx] || String(idx + 1);
      pinDiv.title = item.name;
      pinDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        this.callbacks.onSelectItem(item, island);
      });

      const pinObj = new CSS2DObject(pinDiv);
      pinObj.position.set(anchor.x, pinY, anchor.z);
      this.pinGroup.add(pinObj);
      this.activePins.push(pinObj);
    });
  }

  clearItemPins() {
    this.activePins.forEach((p) => {
      if (p.element && p.element.parentNode) {
        p.element.parentNode.removeChild(p.element);
      }
    });
    this.activePins = [];
    while (this.pinGroup.children.length > 0) {
      this.pinGroup.remove(this.pinGroup.children[0]);
    }
  }

  updatePillSelection(selectedIslandId) {
    Object.keys(this.islandPills).forEach((id) => {
      const el = this.islandPills[id];
      if (!selectedIslandId) {
        el.classList.remove("selected", "dimmed");
      } else if (id === selectedIslandId) {
        el.classList.add("selected");
        el.classList.remove("dimmed");
      } else {
        el.classList.remove("selected");
        el.classList.add("dimmed");
      }
    });
  }

  renderIslandCard(island) {
    this.updatePillSelection(island.id);
    this.showItemPinsForIsland(island);

    const relatedFlows = this.data.flows.filter((f) => f.from === island.id || f.to === island.id);

    const card = document.getElementById("detail-card");
    const body = document.getElementById("detail-card-body");

    body.innerHTML = `
      <div class="eyebrow">ISLAND ${island.num} ． ${island.enName}</div>
      <div class="card-title">${island.num} ${island.name}</div>
      <p class="card-summary">${island.summary}</p>
      <div class="eyebrow">工序細項設備 (${island.items.length})</div>
      <div class="item-pill-list" id="card-item-list"></div>
      <div class="eyebrow">上下游協作運送線</div>
      <div class="chips-wrap" id="card-flow-chips"></div>
    `;

    const listEl = body.querySelector("#card-item-list");
    island.items.forEach((it, idx) => {
      const btn = document.createElement("button");
      btn.className = "item-row-btn";
      btn.innerHTML = `<span class="pin-cir">${idx + 1}</span><span>${it.name}</span>`;
      btn.addEventListener("click", () => this.callbacks.onSelectItem(it, island));
      listEl.appendChild(btn);
    });

    const chipsEl = body.querySelector("#card-flow-chips");
    relatedFlows.forEach((f) => {
      const ch = document.createElement("span");
      ch.className = "chip";
      ch.innerText = `📦 ${f.cargo}`;
      ch.addEventListener("click", () => this.callbacks.onSelectFlow(f));
      chipsEl.appendChild(ch);
    });

    card.classList.add("active");
  }

  renderItemCard(item, island) {
    this.updatePillSelection(island.id);
    this.showItemPinsForIsland(island);
    this.populateThumbModel(item.model, island.color);

    const card = document.getElementById("detail-card");
    const body = document.getElementById("detail-card-body");

    const phases = ["第 1 階段", "第 2 階段", "第 3 階段", "第 4 階段"];

    body.innerHTML = `
      <div class="eyebrow">${island.num} ${island.name} ▸ 設備細項</div>
      <div class="card-title">${item.name}</div>
      <div class="thumb-stage-wrap" id="thumb-mount"></div>
      <p class="card-summary">${item.desc}</p>
      <div class="eyebrow">關鍵量化指標</div>
      <div class="big-stats-row">
        ${item.facts.map((f) => {
          const parts = f.split(" ");
          const num = parts.find((p) => /[0-9]/.test(p)) || parts[0];
          const lbl = f.replace(num, "").trim() || "標準規格";
          return `<div class="stat-brick"><span class="num">${num}</span><span class="lbl">${lbl}</span></div>`;
        }).join("")}
      </div>
      <div class="eyebrow">製程階段時程軸</div>
      <div class="timeline-bar">
        ${phases.map((p) => `<div class="tl-step ${p === item.phase ? "current" : ""}">${p}</div>`).join("")}
      </div>
      <div class="chips-wrap">
        <span class="chip" id="back-to-island-btn">⬅ 返回 ${island.num} ${island.name}</span>
      </div>
    `;

    body.querySelector("#thumb-mount").appendChild(this.thumbCanvas);
    body.querySelector("#back-to-island-btn").addEventListener("click", () => {
      this.callbacks.onSelectIsland(island);
    });

    card.classList.add("active");
  }

  renderFlowCard(flow) {
    const fromIsl = this.data.islands.find((i) => i.id === flow.from);
    const toIsl = this.data.islands.find((i) => i.id === flow.to);

    const card = document.getElementById("detail-card");
    const body = document.getElementById("detail-card-body");

    const levelNames = {
      official: "主幹製程專線 (實線)",
      thematic: "跨排轉折調配 (虛線)",
      pending: "外海環繞回流 12➔01 (點線)"
    };

    body.innerHTML = `
      <div class="eyebrow">LOGISTICS FLOW ． 協作運送線</div>
      <div class="card-title">📦 ${flow.cargo}</div>
      <p class="card-summary">${flow.desc}</p>
      <div class="big-stats-row">
        <div class="stat-brick"><span class="num">${fromIsl ? fromIsl.num : ""}</span><span class="lbl">起點：${fromIsl ? fromIsl.name : ""}</span></div>
        <div class="stat-brick"><span class="num">➔</span><span class="lbl">${levelNames[flow.level]}</span></div>
        <div class="stat-brick"><span class="num">${toIsl ? toIsl.num : ""}</span><span class="lbl">終點：${toIsl ? toIsl.name : ""}</span></div>
      </div>
    `;
    card.classList.add("active");
  }

  populateRightSidebar() {
    const islContainer = document.getElementById("tab-islands");
    const flowContainer = document.getElementById("tab-flows");

    const renderList = (query = "") => {
      const q = query.trim().toLowerCase();
      islContainer.innerHTML = "";

      this.data.islands.forEach((isl) => {
        const matchIsl = isl.name.toLowerCase().includes(q) || isl.summary.toLowerCase().includes(q);
        const matchedItems = isl.items.filter((it) => it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q));
        if (q && !matchIsl && matchedItems.length === 0) return;

        const det = document.createElement("details");
        det.className = "island-acc";
        if (q) det.open = true;

        const sum = document.createElement("summary");
        sum.innerHTML = `<span><strong style="color:#db6a41">${isl.num}</strong> ${isl.name}</span><span style="font-size:11px;color:#7a6a6a">${isl.items.length} 細項 ▾</span>`;
        sum.addEventListener("click", () => {
          this.callbacks.onSelectIsland(isl);
        });
        det.appendChild(sum);

        const subWrap = document.createElement("div");
        subWrap.className = "acc-items";
        isl.items.forEach((it, idx) => {
          const b = document.createElement("button");
          b.className = "acc-sub-btn";
          b.innerHTML = `<span style="color:#db6a41;font-weight:800">${CIRCLED_NUMS[idx]}</span><span>${it.name}</span>`;
          b.addEventListener("click", () => this.callbacks.onSelectItem(it, isl));
          subWrap.appendChild(b);
        });
        det.appendChild(subWrap);
        islContainer.appendChild(det);
      });

      flowContainer.innerHTML = "";
      this.data.flows.forEach((f) => {
        if (q && !f.cargo.toLowerCase().includes(q) && !f.desc.toLowerCase().includes(q)) return;
        const fromIsl = this.data.islands.find((i) => i.id === f.from);
        const toIsl = this.data.islands.find((i) => i.id === f.to);
        const btn = document.createElement("button");
        btn.className = "item-row-btn";
        btn.innerHTML = `<span class="pin-cir">📦</span><div><div>${f.cargo}</div><div style="font-size:11px;color:#7a6a6a">${fromIsl?.num} ${fromIsl?.name} ➔ ${toIsl?.num} ${toIsl?.name}</div></div>`;
        btn.addEventListener("click", () => this.callbacks.onSelectFlow(f));
        flowContainer.appendChild(btn);
      });
    };

    renderList("");

    document.getElementById("search-input").addEventListener("input", (e) => {
      renderList(e.target.value);
    });

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const targetId = btn.getAttribute("data-tab");
        islContainer.classList.toggle("hidden", targetId !== "tab-islands");
        flowContainer.classList.toggle("hidden", targetId !== "tab-flows");
      });
    });
  }

  populateLogFilter() {
    const sel = document.getElementById("log-filter");
    this.data.flows.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.innerText = f.cargo;
      sel.appendChild(opt);
    });
  }

  pushLiveLog(eventType, flow) {
    const filterVal = document.getElementById("log-filter").value;
    if (filterVal !== "all" && filterVal !== flow.id) return;

    const fromIsl = this.data.islands.find((i) => i.id === flow.from);
    const toIsl = this.data.islands.find((i) => i.id === flow.to);
    const list = document.getElementById("log-list");

    const row = document.createElement("div");
    row.className = "log-entry";
    if (eventType === "handoff") {
      row.innerText = `✅ 交接完成：[${flow.cargo}] 抵達 ${toIsl?.num} ${toIsl?.name}`;
    } else {
      row.innerText = `🚚 啟程運送：[${flow.cargo}] 由 ${fromIsl?.num} 發往 ${toIsl?.num}`;
    }
    row.addEventListener("click", () => this.callbacks.onSelectFlow(flow));

    list.prepend(row);
    while (list.children.length > 4) {
      list.removeChild(list.lastChild);
    }
  }

  setupOnboarding() {
    const modal = document.getElementById("onboarding-modal");
    try {
      if (!localStorage.getItem("hanabi_seen_guide")) {
        modal.classList.remove("hidden");
      }
    } catch (e) {}

    document.getElementById("btn-close-onboarding").addEventListener("click", () => {
      modal.classList.add("hidden");
      try {
        localStorage.setItem("hanabi_seen_guide", "1");
      } catch (e) {}
    });

    document.getElementById("btn-help").addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
  }

  updateThumbAnimation() {
    if (this.thumbPivot && document.getElementById("detail-card").classList.contains("active")) {
      this.thumbPivot.rotation.y += 0.018;
      this.thumbRenderer.render(this.thumbScene, this.thumbCam);
    }
  }
}
