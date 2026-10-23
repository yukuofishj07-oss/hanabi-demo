import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { WORLD, PALETTE, mulberry32 } from "../config/constants.js";
import { axialToWorld } from "./islands.js";

export class KitBuilder {
  constructor(scene, islandsData) {
    this.scene = scene;
    this.islandsData = islandsData;
    this.rng = mulberry32(556677);

    // 規格書第 5 節：基本幾何種類
    const hipGeo = new THREE.ConeGeometry(0.75, 0.6, 4);
    hipGeo.rotateY(Math.PI / 4);

    const domeGeo = new THREE.SphereGeometry(0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);

    this.geometries = {
      box: new THREE.BoxGeometry(1, 1, 1),
      rbox: new RoundedBoxGeometry(1, 1, 1, 2, 0.12),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 14),
      cone: new THREE.ConeGeometry(0.5, 1, 14),
      sphere: new THREE.SphereGeometry(0.5, 16, 12),
      ico: new THREE.IcosahedronGeometry(0.5, 1),
      dome: domeGeo,
      torus: new THREE.TorusGeometry(0.4, 0.12, 10, 20),
      hip: hipGeo,
      glowbox: new THREE.BoxGeometry(1, 1, 1),
      glowsphere: new THREE.SphereGeometry(0.5, 12, 10)
    };

    // 霧面黏土感材質 (roughness .78, metalness 0)
    this.solidMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.0
    });

    this.glowMat = new THREE.MeshStandardMaterial({
      color: PALETTE.glowGold,
      emissive: new THREE.Color(PALETTE.glowGold),
      emissiveIntensity: 0.8,
      roughness: 0.5
    });

    this.entries = []; // { kind, matrix, baseColor, ownerId }
    this.instancedMeshes = {};
    this.ownerMap = {}; // ownerId -> [{ kind, instanceId, baseColor }]
    this.itemPickMeshes = [];
    this.itemAnchors = {}; // itemId -> { x, y, z, item, island }
    this.lodObjects = [];

    this.dummy = new THREE.Object3D();
    this.composeAllIslands();
    this.finalizeInstancedMeshes();
  }

  addPart(kind, x, y, z, sx, sy, sz, rx, ry, rz, colorHex, ownerId = null) {
    // 規格書第 5 節：每個 instance 縮放乘上 1 ± 0.0072 隨機抖動，防 z-fighting
    const j1 = 1 + (this.rng() - 0.5) * 0.0144;
    const j2 = 1 + (this.rng() - 0.5) * 0.0144;
    const j3 = 1 + (this.rng() - 0.5) * 0.0144;

    this.dummy.position.set(x, y, z);
    this.dummy.rotation.set(rx, ry, rz);
    this.dummy.scale.set(sx * j1, sy * j2, sz * j3);
    this.dummy.updateMatrix();

    this.entries.push({
      kind,
      matrix: this.dummy.matrix.clone(),
      baseColor: new THREE.Color(colorHex),
      ownerId
    });
  }

  // 在單位空間設計 15+ 種微縮場景模型，再依 scale 放到格子上
  buildModelArchetype(modelKind, cx, cy, cz, scale, ownerId, mainColor) {
    const s = scale;
    const add = (kind, ox, oy, oz, sx, sy, sz, col, rx = 0, ry = 0, rz = 0) => {
      this.addPart(kind, cx + ox * s, cy + oy * s, cz + oz * s, sx * s, sy * s, sz * s, rx, ry, rz, col, ownerId);
    };

    switch (modelKind) {
      case "mill_hall":
      case "lab_hall":
      case "drum_factory":
      case "drying_hall":
      case "press_hall":
      case "assembly_hall":
      case "wrapping_hall":
      case "hopper_hall":
      case "scanner_hall":
      case "logistics_hall": {
        // 島嶼後方主工坊建物 + 鐘塔/煙囪 + 發光窗
        add("rbox", 0, 0.42, 0, 1.35, 0.84, 0.95, PALETTE.wallWarm);
        add("rbox", 0, 0.86, 0, 1.48, 0.08, 1.06, PALETTE.eaveRust);
        add("hip", 0, 1.22, 0, 1.55, 0.72, 1.15, mainColor);
        add("glowbox", -0.35, 0.45, 0.48, 0.28, 0.26, 0.05, PALETTE.glowGold);
        add("glowbox", 0.35, 0.45, 0.48, 0.28, 0.26, 0.05, PALETTE.glowGold);
        add("rbox", 0, 0.22, 0.48, 0.24, 0.42, 0.06, PALETTE.wood);
        // 側塔
        add("rbox", 0.52, 0.75, -0.2, 0.38, 1.5, 0.38, PALETTE.stone);
        add("cone", 0.52, 1.65, -0.2, 0.48, 0.45, 0.48, PALETTE.ink);
        break;
      }

      case "mortar_battery": {
        // 11號島主模型：防爆指揮堡壘 + 巨型迫擊砲排陣
        add("rbox", 0, 0.28, 0, 1.65, 0.56, 0.95, PALETTE.stone);
        for (let m = -2; m <= 2; m++) {
          add("cylinder", m * 0.28, 0.78, 0.1, 0.18, 0.95, 0.18, PALETTE.ink, 0.12, 0, 0);
          add("torus", m * 0.28, 1.25, 0.15, 0.22, 0.22, 0.22, PALETTE.yellow, Math.PI / 2, 0, 0);
        }
        break;
      }

      case "command_yagura": {
        // 12號島主模型：雙層朱紅日式觀禮指揮櫓
        add("rbox", 0, 0.38, 0, 1.4, 0.76, 1.1, PALETTE.wallWarm);
        add("hip", 0, 0.92, 0, 1.6, 0.5, 1.25, PALETTE.ink);
        add("rbox", 0, 1.25, 0, 0.95, 0.65, 0.78, PALETTE.wallWarm);
        add("hip", 0, 1.75, 0, 1.2, 0.52, 0.98, PALETTE.coral);
        add("glowsphere", -0.55, 0.72, 0.55, 0.16, 0.2, 0.16, PALETTE.glowGold);
        add("glowsphere", 0.55, 0.72, 0.55, 0.16, 0.2, 0.16, PALETTE.glowGold);
        break;
      }

      case "watermill": {
        add("rbox", -0.2, 0.32, 0, 0.7, 0.64, 0.6, PALETTE.wallWarm);
        add("hip", -0.2, 0.78, 0, 0.85, 0.42, 0.75, PALETTE.coral);
        add("torus", 0.25, 0.38, 0, 0.65, 0.65, 0.35, PALETTE.wood, 0, Math.PI / 2, 0);
        add("cylinder", 0.48, 0.22, 0.2, 0.34, 0.42, 0.34, PALETTE.wood);
        break;
      }

      case "color_vats": {
        add("rbox", 0, 0.08, 0, 1.05, 0.16, 0.85, PALETTE.stone);
        const cols = [0xdb6a41, 0x8db86f, 0x3e7c8c, 0xfcea8b];
        cols.forEach((c, idx) => {
          const ox = (idx % 2 === 0 ? -0.26 : 0.26);
          const oz = (idx < 2 ? -0.22 : 0.22);
          add("cylinder", ox, 0.36, oz, 0.36, 0.48, 0.36, c);
        });
        break;
      }

      case "rolling_drums": {
        for (let i = -1; i <= 1; i++) {
          add("rbox", i * 0.36, 0.16, 0, 0.28, 0.32, 0.38, PALETTE.wood);
          add("cylinder", i * 0.36, 0.44, 0, 0.34, 0.46, 0.34, PALETTE.yellow, 0, 0, Math.PI / 5);
        }
        break;
      }

      case "drying_racks": {
        for (let r = -1; r <= 1; r++) {
          add("rbox", 0, 0.18 + (r + 1) * 0.12, r * 0.28, 0.95, 0.08, 0.24, PALETTE.wood);
          add("sphere", -0.25, 0.25 + (r + 1) * 0.12, r * 0.28, 0.14, 0.08, 0.14, PALETTE.coral);
          add("sphere", 0, 0.25 + (r + 1) * 0.12, r * 0.28, 0.14, 0.08, 0.14, PALETTE.yellow);
          add("sphere", 0.25, 0.25 + (r + 1) * 0.12, r * 0.28, 0.14, 0.08, 0.14, PALETTE.teal);
        }
        break;
      }

      case "windmill": {
        add("cone", 0, 0.48, 0, 0.55, 0.96, 0.55, PALETTE.wallWarm);
        add("box", 0, 0.72, 0.28, 0.78, 0.12, 0.05, PALETTE.wood);
        add("box", 0, 0.72, 0.28, 0.12, 0.78, 0.05, PALETTE.wood);
        break;
      }

      case "hydraulic_press": {
        add("rbox", -0.32, 0.52, 0, 0.18, 1.04, 0.45, PALETTE.ink);
        add("rbox", 0.32, 0.52, 0, 0.18, 1.04, 0.45, PALETTE.ink);
        add("rbox", 0, 0.96, 0, 0.88, 0.20, 0.52, PALETTE.coral);
        add("cylinder", 0, 0.62, 0, 0.36, 0.45, 0.36, PALETTE.yellow);
        add("dome", 0, 0.12, 0, 0.48, 0.42, 0.48, PALETTE.wood);
        break;
      }

      case "cutaway_shell": {
        // 同心圓剖面花火球工作檯
        add("cylinder", 0, 0.18, 0, 0.92, 0.36, 0.92, PALETTE.wood);
        add("torus", 0, 0.40, 0, 0.85, 0.85, 0.5, PALETTE.coral, Math.PI / 2, 0, 0);
        add("torus", 0, 0.42, 0, 0.52, 0.52, 0.5, PALETTE.yellow, Math.PI / 2, 0, 0);
        add("sphere", 0, 0.42, 0, 0.26, 0.26, 0.26, PALETTE.ink);
        break;
      }

      case "winder_machine":
      case "hanging_rack": {
        add("rbox", -0.42, 0.48, 0, 0.12, 0.96, 0.12, PALETTE.wood);
        add("rbox", 0.42, 0.48, 0, 0.12, 0.96, 0.12, PALETTE.wood);
        add("rbox", 0, 0.92, 0, 1.0, 0.12, 0.12, PALETTE.wood);
        add("sphere", -0.2, 0.52, 0, 0.34, 0.34, 0.34, PALETTE.stone);
        add("sphere", 0.2, 0.52, 0, 0.34, 0.34, 0.34, PALETTE.coral);
        break;
      }

      case "hopper_tower": {
        add("rbox", 0, 0.25, 0, 0.65, 0.5, 0.65, PALETTE.stone);
        add("cone", 0, 0.82, 0, 0.78, 0.85, 0.78, PALETTE.teal, Math.PI, 0, 0);
        break;
      }

      case "xray_dome": {
        add("dome", 0, 0.05, 0, 0.95, 0.88, 0.95, PALETTE.wallWarm);
        add("torus", 0, 0.52, 0, 0.98, 0.98, 0.45, PALETTE.pastelCyan, Math.PI / 2, 0, 0);
        add("glowbox", 0, 0.35, 0.48, 0.42, 0.32, 0.08, PALETTE.glowGold);
        break;
      }

      case "mortar_tubes":
      case "multi_launcher": {
        add("rbox", 0, 0.12, 0, 1.05, 0.24, 0.68, PALETTE.wood);
        for (let k = -1; k <= 1; k++) {
          add("cylinder", k * 0.3, 0.52, 0, 0.22, 0.72, 0.22, PALETTE.ink, 0.1, 0, k * 0.08);
        }
        break;
      }

      case "classroom":
      case "clinic":
      case "sieve_shed":
      case "boxer_machine": {
        // 小屋 archetype：牆 #f4ebdd、coral 四坡屋頂、窗 #a8c4c2
        add("rbox", 0, 0.32, 0, 0.86, 0.64, 0.72, PALETTE.wallWarm);
        add("hip", 0, 0.78, 0, 1.02, 0.46, 0.88, PALETTE.coral);
        add("glowbox", 0, 0.35, 0.37, 0.38, 0.24, 0.04, PALETTE.glowGold);
        break;
      }

      case "pavilion":
      case "booth":
      case "vat_station": {
        // 亭子或攤位 archetype
        add("rbox", 0, 0.18, 0, 0.82, 0.36, 0.65, PALETTE.wood);
        add("cone", 0, 0.72, 0, 0.98, 0.45, 0.98, PALETTE.yellow);
        break;
      }

      case "canal_bridge": {
        // 河道加小橋 archetype
        add("rbox", 0, 0.06, 0, 0.98, 0.12, 0.55, PALETTE.teal);
        add("rbox", 0, 0.22, 0, 0.42, 0.12, 0.78, PALETTE.coral);
        break;
      }

      case "bus_stop":
      case "bike_rack": {
        // 車站加小車 archetype
        add("rbox", -0.22, 0.32, -0.18, 0.48, 0.64, 0.22, PALETTE.teal);
        add("rbox", 0.18, 0.22, 0.15, 0.58, 0.36, 0.34, PALETTE.coral);
        add("Glowsphere", 0.46, 0.20, 0.15, 0.12, 0.12, 0.12, PALETTE.glowGold);
        break;
      }

      case "stage":
      case "court": {
        // 舞台與廣場 archetype
        add("rbox", 0, 0.12, 0, 1.05, 0.24, 0.88, PALETTE.stone);
        add("rbox", 0, 0.48, -0.28, 0.88, 0.52, 0.12, PALETTE.coral);
        add("glowsphere", -0.35, 0.45, 0.25, 0.18, 0.18, 0.18, PALETTE.glowGold);
        add("glowsphere", 0.35, 0.45, 0.25, 0.18, 0.18, 0.18, PALETTE.glowGold);
        break;
      }

      default: {
        // 巨大符號物件：書、硬幣、時鐘、地球儀、星珠
        add("cylinder", 0, 0.14, 0, 0.68, 0.28, 0.68, PALETTE.stone);
        if (modelKind === "symbol_globe" || modelKind === "symbol_star") {
          add("sphere", 0, 0.62, 0, 0.58, 0.58, 0.58, PALETTE.coral);
          add("torus", 0, 0.62, 0, 0.78, 0.78, 0.35, PALETTE.yellow, 0.5, 0.3, 0);
        } else if (modelKind === "symbol_clock" || modelKind === "symbol_coin") {
          add("cylinder", 0, 0.62, 0, 0.62, 0.18, 0.62, PALETTE.yellow, Math.PI / 2, 0, 0);
        } else {
          add("rbox", 0, 0.52, 0, 0.62, 0.48, 0.42, mainColor);
        }
        break;
      }
    }
  }

  buildTree(treeType, x, y, z, scale) {
    const s = scale;
    this.addPart("cylinder", x, y + 0.28 * s, z, 0.16 * s, 0.56 * s, 0.16 * s, 0, 0, 0, PALETTE.wood);
    if (treeType === "pine") {
      this.addPart("cone", x, y + 0.72 * s, z, 0.75 * s, 0.78 * s, 0.75 * s, 0, 0, 0, PALETTE.foliage3);
      this.addPart("cone", x, y + 1.15 * s, z, 0.56 * s, 0.65 * s, 0.56 * s, 0, 0, 0, PALETTE.foliage2);
    } else if (treeType === "cherry") {
      this.addPart("sphere", x, y + 0.78 * s, z, 0.78 * s, 0.68 * s, 0.78 * s, 0, 0, 0, PALETTE.pastelPink);
      this.addPart("sphere", x + 0.22 * s, y + 0.68 * s, z + 0.15 * s, 0.52 * s, 0.48 * s, 0.52 * s, 0, 0, 0, PALETTE.pastelPink);
    } else if (treeType === "palm") {
      this.addPart("sphere", x, y + 0.85 * s, z, 0.82 * s, 0.32 * s, 0.82 * s, 0, 0, 0, PALETTE.foliage1);
    } else {
      this.addPart("ico", x, y + 0.78 * s, z, 0.76 * s, 0.72 * s, 0.76 * s, 0, 0, 0, PALETTE.foliage2);
    }
  }

  composeAllIslands() {
    const S = WORLD.SCALE;
    const TOP = WORLD.TOP;
    const hitGeo = new THREE.BoxGeometry(1, 1, 1);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    // 交錯格子位置 (規格書第 2 節：內切半徑 1.36 * S 以內)
    const slotOffsets = [
      { x: -0.78 * S, z: 0.15 * S },
      { x: 0.78 * S, z: 0.15 * S },
      { x: -0.45 * S, z: 0.88 * S },
      { x: 0.45 * S, z: 0.88 * S }
    ];

    this.islandsData.forEach((isl) => {
      const { x: ix, z: iz } = axialToWorld(isl.axial.q, isl.axial.r);

      // 1. 主建物放在 (0, -0.58 * S)、尺寸約 1.15 * S
      const mainScale = 1.12 * S;
      this.buildModelArchetype(isl.mainModel, ix, TOP, iz - 0.58 * S, mainScale, isl.id, isl.color);

      // 2. 島內 4 個細項模型放在交錯格子上
      isl.items.forEach((item, idx) => {
        const slot = slotOffsets[idx % slotOffsets.length];
        const bx = ix + slot.x;
        const bz = iz + slot.z;
        const itemScale = 0.56 * S;

        this.buildModelArchetype(item.model, bx, TOP, bz, itemScale, item.id, isl.color);

        const topY = TOP + itemScale * 1.25;
        this.itemAnchors[item.id] = { x: bx, y: topY, z: bz, item, island: isl, index: idx + 1 };

        // 隱形 Raycast 碰撞盒
        const pick = new THREE.Mesh(hitGeo, hitMat);
        pick.position.set(bx, TOP + itemScale * 0.5, bz);
        pick.scale.set(itemScale * 1.15, itemScale * 1.2, itemScale * 1.15);
        pick.userData = { type: "item", item, island: isl };
        this.scene.add(pick);
        this.itemPickMeshes.push(pick);
      });

      // 3. 每島外圈：六角形頂點放路燈、外圈 5 棵大樹
      for (let k = 0; k < 6; k++) {
        const ang = (k * Math.PI) / 3 + Math.PI / 6;
        const lx = ix + Math.cos(ang) * (1.88 * S);
        const lz = iz + Math.sin(ang) * (1.88 * S);

        // 路燈柱與發光燈頭
        this.addPart("cylinder", lx, TOP + 0.35 * S, lz, 0.05 * S, 0.7 * S, 0.05 * S, 0, 0, 0, PALETTE.ink);
        this.addPart("glowsphere", lx, TOP + 0.72 * S, lz, 0.14 * S, 0.14 * S, 0.14 * S, 0, 0, 0, PALETTE.glowGold);

        // 外圈大樹 (避開前側標籤區)
        if (k !== 1 && k !== 2) {
          const tx = ix + Math.cos(ang + 0.25) * (1.55 * S);
          const tz = iz + Math.sin(ang + 0.25) * (1.55 * S);
          this.buildTree(isl.treeType, tx, TOP, tz, 0.75 * S);
        }
      }
    });
  }

  finalizeInstancedMeshes() {
    const grouped = {};
    this.entries.forEach((e) => {
      const k = e.kind.toLowerCase();
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(e);
    });

    Object.keys(grouped).forEach((kind) => {
      const list = grouped[kind];
      const geo = this.geometries[kind] || this.geometries.box;
      const isGlow = kind.startsWith("glow");
      const mat = isGlow ? this.glowMat : this.solidMat;

      const imesh = new THREE.InstancedMesh(geo, mat, list.length);
      imesh.castShadow = !isGlow;
      imesh.receiveShadow = true;

      list.forEach((item, idx) => {
        imesh.setMatrixAt(idx, item.matrix);
        imesh.setColorAt(idx, item.baseColor);
        if (item.ownerId) {
          if (!this.ownerMap[item.ownerId]) this.ownerMap[item.ownerId] = [];
          this.ownerMap[item.ownerId].push({
            mesh: imesh,
            instanceId: idx,
            baseColor: item.baseColor.clone()
          });
        }
      });

      imesh.instanceMatrix.needsUpdate = true;
      if (imesh.instanceColor) imesh.instanceColor.needsUpdate = true;
      this.instancedMeshes[kind] = imesh;
      this.scene.add(imesh);
    });
  }

  // 規格書第 8 節：高亮用 setColorAt 把該建物所有零件往 coral 混 22%；當前時段 dayCycle 亮起的細項往 yellow 混 22%
  updateHighlights(selectedOwnerId, dayCycleActiveIds = []) {
    const coral = new THREE.Color(PALETTE.coral);
    const yellow = new THREE.Color(PALETTE.yellow);
    const tmp = new THREE.Color();
    const touchedMeshes = new Set();

    Object.keys(this.ownerMap).forEach((ownerId) => {
      const isSelected = ownerId === selectedOwnerId;
      const isCycleActive = dayCycleActiveIds.includes(ownerId);

      this.ownerMap[ownerId].forEach((part) => {
        tmp.copy(part.baseColor);
        if (isSelected) {
          tmp.lerp(coral, 0.28);
        } else if (isCycleActive) {
          tmp.lerp(yellow, 0.25);
        }
        part.mesh.setColorAt(part.instanceId, tmp);
        touchedMeshes.add(part.mesh);
      });
    });

    touchedMeshes.forEach((m) => {
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  }

  updateNightGlow(nightFactor) {
    // 規格書第 4 節：夜晚窗戶與燈的 emissive (#ffc777) 強度 = night * 3.2 (白天保持微溫光 0.4)
    this.glowMat.emissiveIntensity = 0.4 + nightFactor * 2.8;
  }
}
