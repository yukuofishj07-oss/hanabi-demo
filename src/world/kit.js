import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { WORLD, PALETTE, mulberry32 } from "../config/constants.js";
import { axialToWorld } from "./islands.js";

export class KitBuilder {
  constructor(scene, islandsData) {
    this.scene = scene;
    this.islandsData = islandsData;
    this.rng = mulberry32(556677);

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

    this.entries = [];
    this.instancedMeshes = {};
    this.ownerMap = {};
    this.itemPickMeshes = [];
    this.itemAnchors = {};

    this.dummy = new THREE.Object3D();
    this.composeAllIslands();
    this.finalizeInstancedMeshes();
  }

  addPart(kind, x, y, z, sx, sy, sz, rx, ry, rz, colorHex, ownerId = null) {
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

  // 高密度微縮模型組件：每個模型不只有主體，還附帶木棧底座、圍欄、原料木桶、側屋與發光小燈籠！
  buildModelArchetype(modelKind, cx, cy, cz, scale, ownerId, mainColor) {
    const s = scale;
    const add = (kind, ox, oy, oz, sx, sy, sz, col, rx = 0, ry = 0, rz = 0) => {
      this.addPart(kind, cx + ox * s, cy + oy * s, cz + oz * s, sx * s, sy * s, sz * s, rx, ry, rz, col, ownerId);
    };

    // 為每個微型園區鋪設精緻石板/木棧底墊與角落小木桶細節
    add("rbox", 0, 0.03, 0, 1.32, 0.06, 1.12, PALETTE.stone);
    add("cylinder", -0.52, 0.14, 0.42, 0.14, 0.18, 0.14, PALETTE.wood);
    add("cylinder", -0.36, 0.12, 0.45, 0.12, 0.14, 0.12, PALETTE.wood);

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
        // 複合式主工坊園區：中央雙層主屋 + 左翼偏廳 + 右翼高塔煙囪 + 前庭門廊 + 6扇發光窗 + 屋頂通風氣樓
        add("rbox", 0, 0.44, 0, 1.38, 0.82, 0.92, PALETTE.wallWarm);
        add("rbox", 0, 0.87, 0, 1.50, 0.08, 1.04, PALETTE.eaveRust);
        add("hip", 0, 1.22, 0, 1.56, 0.68, 1.12, mainColor);
        // 屋頂氣樓
        add("rbox", 0, 1.48, 0, 0.48, 0.28, 0.38, PALETTE.wallWarm);
        add("hip", 0, 1.72, 0, 0.62, 0.25, 0.52, PALETTE.ink);
        // 左翼附屬工坊
        add("rbox", -0.82, 0.30, 0.12, 0.56, 0.54, 0.68, PALETTE.wallWarm);
        add("hip", -0.82, 0.68, 0.12, 0.68, 0.34, 0.78, PALETTE.eaveRust);
        // 右翼鐘塔與儲料槽
        add("rbox", 0.75, 0.72, -0.18, 0.42, 1.38, 0.42, PALETTE.stone);
        add("cone", 0.75, 1.56, -0.18, 0.52, 0.45, 0.52, PALETTE.ink);
        add("glowsphere", 0.75, 1.15, 0.05, 0.16, 0.16, 0.08, PALETTE.glowGold);
        // 發光窗格與門廊
        for (let wx of [-0.38, 0, 0.38]) {
          add("glowbox", wx, 0.55, 0.47, 0.22, 0.22, 0.04, PALETTE.glowGold);
        }
        add("rbox", 0, 0.20, 0.52, 0.34, 0.36, 0.18, PALETTE.wood);
        add("glowsphere", -0.22, 0.34, 0.60, 0.10, 0.12, 0.10, PALETTE.glowGold);
        add("glowsphere", 0.22, 0.34, 0.60, 0.10, 0.12, 0.10, PALETTE.glowGold);
        break;
      }

      case "mortar_battery": {
        // 11號島重型迫擊砲陣地：雙層防爆掩體 + 8門高低口徑迫擊鋼砲 + 彈藥輸送軌
        add("rbox", 0, 0.24, 0, 1.75, 0.42, 0.96, PALETTE.stone);
        add("rbox", 0, 0.48, -0.22, 1.45, 0.24, 0.52, PALETTE.wood);
        for (let m = -3; m <= 3; m++) {
          add("cylinder", m * 0.22, 0.78, 0.14, 0.14, 0.88, 0.14, PALETTE.ink, 0.12, 0, 0);
          add("torus", m * 0.22, 1.22, 0.19, 0.17, 0.17, 0.17, PALETTE.yellow, Math.PI / 2, 0, 0);
        }
        break;
      }

      case "command_yagura": {
        // 12號島雙層朱紅日式觀禮指揮櫓 + 四角祭典燈籠柱
        add("rbox", 0, 0.38, 0, 1.42, 0.70, 1.08, PALETTE.wallWarm);
        add("hip", 0, 0.88, 0, 1.62, 0.46, 1.26, PALETTE.ink);
        add("rbox", 0, 1.22, 0, 0.96, 0.62, 0.76, PALETTE.wallWarm);
        add("hip", 0, 1.68, 0, 1.22, 0.48, 0.98, PALETTE.coral);
        for (let lx of [-0.62, 0.62]) {
          for (let lz of [-0.45, 0.45]) {
            add("glowsphere", lx, 0.68, lz, 0.13, 0.16, 0.13, PALETTE.glowGold);
          }
        }
        break;
      }

      case "watermill": {
        add("rbox", -0.22, 0.34, 0, 0.68, 0.60, 0.58, PALETTE.wallWarm);
        add("hip", -0.22, 0.76, 0, 0.82, 0.38, 0.72, PALETTE.coral);
        add("torus", 0.22, 0.40, 0, 0.62, 0.62, 0.32, PALETTE.wood, 0, Math.PI / 2, 0);
        add("cylinder", 0.44, 0.22, 0.18, 0.28, 0.36, 0.28, PALETTE.wood);
        add("cylinder", 0.44, 0.22, -0.18, 0.28, 0.36, 0.28, PALETTE.wood);
        add("cylinder", 0.44, 0.52, 0.18, 0.08, 0.42, 0.08, PALETTE.ink);
        add("cylinder", 0.44, 0.44, -0.18, 0.08, 0.42, 0.08, PALETTE.ink);
        break;
      }

      case "color_vats": {
        const cols = [0xdb6a41, 0x8db86f, 0x3e7c8c, 0xfcea8b, 0xf2b5c6];
        cols.forEach((c, idx) => {
          const ang = (idx / 5) * Math.PI * 2;
          const ox = Math.cos(ang) * 0.34;
          const oz = Math.sin(ang) * 0.30;
          add("cylinder", ox, 0.32, oz, 0.28, 0.50, 0.28, c);
          add("torus", ox, 0.56, oz, 0.30, 0.30, 0.20, PALETTE.ink, Math.PI / 2, 0, 0);
        });
        add("cylinder", 0, 0.45, 0, 0.18, 0.75, 0.18, PALETTE.stone);
        break;
      }

      case "rolling_drums": {
        for (let i = -1; i <= 1; i++) {
          add("rbox", i * 0.36, 0.16, 0, 0.26, 0.26, 0.36, PALETTE.wood);
          add("cylinder", i * 0.36, 0.42, 0, 0.30, 0.42, 0.30, PALETTE.yellow, 0, 0, Math.PI / 5);
          add("torus", i * 0.36, 0.42, 0, 0.32, 0.32, 0.25, PALETTE.ink, 0, Math.PI / 2, 0);
        }
        break;
      }

      case "drying_racks": {
        for (let r = -1; r <= 1; r++) {
          add("rbox", 0, 0.16 + (r + 1) * 0.12, r * 0.28, 0.98, 0.07, 0.24, PALETTE.wood);
          for (let c = -2; c <= 2; c++) {
            const col = [PALETTE.coral, PALETTE.yellow, PALETTE.teal, PALETTE.pastelPink, PALETTE.foliage1][(c + 2) % 5];
            add("sphere", c * 0.18, 0.23 + (r + 1) * 0.12, r * 0.28, 0.11, 0.08, 0.11, col);
          }
        }
        break;
      }

      case "windmill": {
        add("cone", 0, 0.48, 0, 0.52, 0.90, 0.52, PALETTE.wallWarm);
        add("cone", 0, 0.98, 0, 0.36, 0.32, 0.36, PALETTE.coral);
        add("box", 0, 0.72, 0.26, 0.82, 0.10, 0.04, PALETTE.wood);
        add("box", 0, 0.72, 0.26, 0.10, 0.82, 0.04, PALETTE.wood);
        break;
      }

      case "hydraulic_press": {
        add("rbox", -0.34, 0.50, 0, 0.16, 0.96, 0.42, PALETTE.ink);
        add("rbox", 0.34, 0.50, 0, 0.16, 0.96, 0.42, PALETTE.ink);
        add("rbox", 0, 0.92, 0, 0.90, 0.18, 0.48, PALETTE.coral);
        add("cylinder", 0, 0.60, 0, 0.32, 0.42, 0.32, PALETTE.yellow);
        add("dome", 0, 0.12, 0, 0.46, 0.38, 0.46, PALETTE.wood);
        add("dome", 0.48, 0.08, 0.32, 0.28, 0.24, 0.28, PALETTE.wood);
        break;
      }

      case "cutaway_shell": {
        add("cylinder", 0, 0.18, 0, 0.88, 0.30, 0.88, PALETTE.wood);
        add("torus", 0, 0.36, 0, 0.82, 0.82, 0.45, PALETTE.coral, Math.PI / 2, 0, 0);
        add("torus", 0, 0.38, 0, 0.52, 0.52, 0.45, PALETTE.yellow, Math.PI / 2, 0, 0);
        add("torus", 0, 0.40, 0, 0.28, 0.28, 0.45, PALETTE.teal, Math.PI / 2, 0, 0);
        add("sphere", 0, 0.40, 0, 0.18, 0.18, 0.18, PALETTE.ink);
        break;
      }

      case "winder_machine":
      case "hanging_rack": {
        add("rbox", -0.44, 0.48, 0, 0.10, 0.90, 0.10, PALETTE.wood);
        add("rbox", 0.44, 0.48, 0, 0.10, 0.90, 0.10, PALETTE.wood);
        add("rbox", 0, 0.88, 0, 1.02, 0.10, 0.10, PALETTE.wood);
        for (let b = -1; b <= 1; b++) {
          add("sphere", b * 0.28, 0.48, 0, 0.26, 0.26, 0.26, b === 0 ? PALETTE.coral : PALETTE.stone);
        }
        break;
      }

      case "hopper_tower": {
        add("rbox", -0.28, 0.35, 0, 0.08, 0.65, 0.48, PALETTE.ink);
        add("rbox", 0.28, 0.35, 0, 0.08, 0.65, 0.48, PALETTE.ink);
        add("cone", 0, 0.72, 0, 0.72, 0.78, 0.72, PALETTE.teal, Math.PI, 0, 0);
        add("sphere", 0, 0.22, 0, 0.28, 0.28, 0.28, PALETTE.coral);
        break;
      }

      case "xray_dome": {
        add("dome", 0, 0.06, 0, 0.88, 0.82, 0.88, PALETTE.wallWarm);
        add("torus", 0, 0.48, 0, 0.92, 0.92, 0.40, PALETTE.pastelCyan, Math.PI / 2, 0, 0);
        add("glowbox", 0, 0.34, 0.44, 0.40, 0.28, 0.08, PALETTE.glowGold);
        break;
      }

      case "mortar_tubes":
      case "multi_launcher": {
        add("rbox", 0, 0.12, 0, 1.02, 0.18, 0.64, PALETTE.wood);
        for (let k = -2; k <= 2; k++) {
          add("cylinder", k * 0.20, 0.48, 0, 0.16, 0.68, 0.16, PALETTE.ink, 0.1, 0, k * 0.06);
        }
        break;
      }

      case "classroom":
      case "clinic":
      case "sieve_shed":
      case "boxer_machine": {
        add("rbox", 0, 0.32, 0, 0.82, 0.56, 0.66, PALETTE.wallWarm);
        add("hip", 0, 0.72, 0, 0.98, 0.42, 0.82, PALETTE.coral);
        add("glowbox", -0.18, 0.34, 0.34, 0.20, 0.20, 0.04, PALETTE.glowGold);
        add("glowbox", 0.18, 0.34, 0.34, 0.20, 0.20, 0.04, PALETTE.glowGold);
        break;
      }

      case "pavilion":
      case "booth":
      case "vat_station": {
        add("rbox", 0, 0.18, 0, 0.78, 0.28, 0.62, PALETTE.wood);
        add("cylinder", -0.32, 0.42, 0.24, 0.06, 0.48, 0.06, PALETTE.wood);
        add("cylinder", 0.32, 0.42, 0.24, 0.06, 0.48, 0.06, PALETTE.wood);
        add("cone", 0, 0.72, 0, 0.94, 0.42, 0.94, PALETTE.yellow);
        break;
      }

      case "canal_bridge": {
        add("rbox", 0, 0.06, 0, 0.96, 0.08, 0.52, PALETTE.teal);
        add("rbox", 0, 0.20, 0, 0.40, 0.10, 0.74, PALETTE.coral);
        break;
      }

      case "bus_stop":
      case "bike_rack": {
        add("rbox", -0.24, 0.32, -0.18, 0.44, 0.56, 0.20, PALETTE.teal);
        add("rbox", 0.16, 0.22, 0.14, 0.54, 0.32, 0.32, PALETTE.coral);
        add("glowsphere", 0.44, 0.20, 0.14, 0.10, 0.10, 0.10, PALETTE.glowGold);
        break;
      }

      case "stage":
      case "court": {
        add("rbox", 0, 0.10, 0, 1.02, 0.16, 0.84, PALETTE.stone);
        add("rbox", 0, 0.44, -0.26, 0.84, 0.48, 0.12, PALETTE.coral);
        add("glowsphere", -0.34, 0.42, 0.24, 0.14, 0.14, 0.14, PALETTE.glowGold);
        add("glowsphere", 0.34, 0.42, 0.24, 0.14, 0.14, 0.14, PALETTE.glowGold);
        break;
      }

      default: {
        add("cylinder", 0, 0.14, 0, 0.64, 0.22, 0.64, PALETTE.stone);
        if (modelKind === "symbol_globe" || modelKind === "symbol_star") {
          add("sphere", 0, 0.58, 0, 0.52, 0.52, 0.52, PALETTE.coral);
          add("torus", 0, 0.58, 0, 0.72, 0.72, 0.32, PALETTE.yellow, 0.5, 0.3, 0);
        } else if (modelKind === "symbol_clock" || modelKind === "symbol_coin") {
          add("cylinder", 0, 0.58, 0, 0.56, 0.16, 0.56, PALETTE.yellow, Math.PI / 2, 0, 0);
        } else {
          add("rbox", 0, 0.48, 0, 0.56, 0.44, 0.38, mainColor);
        }
        break;
      }
    }
  }

  buildTree(treeType, x, y, z, scale) {
    const s = scale;
    this.addPart("cylinder", x, y + 0.26 * s, z, 0.14 * s, 0.52 * s, 0.14 * s, 0, 0, 0, PALETTE.wood);
    if (treeType === "pine") {
      this.addPart("cone", x, y + 0.68 * s, z, 0.68 * s, 0.72 * s, 0.68 * s, 0, 0, 0, PALETTE.foliage3);
      this.addPart("cone", x, y + 1.10 * s, z, 0.50 * s, 0.60 * s, 0.50 * s, 0, 0, 0, PALETTE.foliage2);
    } else if (treeType === "cherry") {
      this.addPart("sphere", x, y + 0.74 * s, z, 0.72 * s, 0.62 * s, 0.72 * s, 0, 0, 0, PALETTE.pastelPink);
      this.addPart("sphere", x + 0.20 * s, y + 0.64 * s, z + 0.14 * s, 0.48 * s, 0.44 * s, 0.48 * s, 0, 0, 0, PALETTE.pastelPink);
    } else if (treeType === "palm") {
      this.addPart("sphere", x, y + 0.80 * s, z, 0.76 * s, 0.28 * s, 0.76 * s, 0, 0, 0, PALETTE.foliage1);
    } else {
      this.addPart("ico", x, y + 0.74 * s, z, 0.70 * s, 0.66 * s, 0.70 * s, 0, 0, 0, PALETTE.foliage2);
    }
  }

  composeAllIslands() {
    const R = WORLD.R;       // 5.2
    const TOP = WORLD.TOP;   // 0.95
    const hitGeo = new THREE.BoxGeometry(1, 1, 1);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    // 大島上的 4 個寬敞園區交錯格子位置 (與中央主工坊拉開距離，不擁擠，細節清楚分明！)
    const slotOffsets = [
      { x: -2.25, z: -0.15 },
      { x: 2.25,  z: -0.15 },
      { x: -1.45, z: 1.95 },
      { x: 1.45,  z: 1.95 }
    ];

    this.islandsData.forEach((isl) => {
      const { x: ix, z: iz } = axialToWorld(isl.axial.q, isl.axial.r);

      // 1. 島嶼北側主工坊園區 (尺寸適中精緻 1.85，留出庭院與步道空間)
      this.buildModelArchetype(isl.mainModel, ix, TOP, iz - 1.85, 1.85, isl.id, isl.color);

      // 2. 島內 4 個細項獨立園區模型
      isl.items.forEach((item, idx) => {
        const slot = slotOffsets[idx % slotOffsets.length];
        const bx = ix + slot.x;
        const bz = iz + slot.z;
        const itemScale = 1.18;

        this.buildModelArchetype(item.model, bx, TOP, bz, itemScale, item.id, isl.color);

        const topY = TOP + itemScale * 1.25;
        this.itemAnchors[item.id] = { x: bx, y: topY, z: bz, item, island: isl, index: idx + 1 };

        const pick = new THREE.Mesh(hitGeo, hitMat);
        pick.position.set(bx, TOP + itemScale * 0.55, bz);
        pick.scale.set(itemScale * 1.35, itemScale * 1.35, itemScale * 1.35);
        pick.userData = { type: "item", item, island: isl };
        this.scene.add(pick);
        this.itemPickMeshes.push(pick);
      });

      // 3. 島內豐富微縮街道家具：長椅、花圃、石燈籠、8 棵外圈錯落大樹與 6 盞路燈
      for (let k = 0; k < 6; k++) {
        const ang = (k * Math.PI) / 3 + Math.PI / 6;
        const lx = ix + Math.cos(ang) * (R * 0.88);
        const lz = iz + Math.sin(ang) * (R * 0.88);

        // 精緻比例路燈 (不再巨大化)
        this.addPart("cylinder", lx, TOP + 0.42, lz, 0.06, 0.84, 0.06, 0, 0, 0, PALETTE.ink);
        this.addPart("glowsphere", lx, TOP + 0.86, lz, 0.18, 0.18, 0.18, 0, 0, 0, PALETTE.glowGold);

        // 步道內側花圃與長椅
        const bx = ix + Math.cos(ang + 0.5) * (R * 0.72);
        const bz = iz + Math.sin(ang + 0.5) * (R * 0.72);
        this.addPart("rbox", bx, TOP + 0.09, bz, 0.45, 0.14, 0.18, 0, -ang, 0, PALETTE.wood);

        // 外圈高低錯落樹群
        if (k !== 1) {
          const tx = ix + Math.cos(ang + 0.22) * (R * 0.76);
          const tz = iz + Math.sin(ang + 0.22) * (R * 0.76);
          this.buildTree(isl.treeType, tx, TOP, tz, 1.05);

          const tx2 = ix + Math.cos(ang - 0.18) * (R * 0.78);
          const tz2 = iz + Math.sin(ang - 0.18) * (R * 0.78);
          this.buildTree(k % 2 === 0 ? "cherry" : isl.treeType, tx2, TOP, tz2, 0.78);
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
    this.glowMat.emissiveIntensity = 0.4 + nightFactor * 2.8;
  }
}
