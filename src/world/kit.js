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

  buildModelArchetype(modelKind, cx, cy, cz, scale, ownerId, mainColor) {
    const s = scale;
    const add = (kind, ox, oy, oz, sx, sy, sz, col, rx = 0, ry = 0, rz = 0) => {
      this.addPart(kind, cx + ox * s, cy + oy * s, cz + oz * s, sx * s, sy * s, sz * s, rx, ry, rz, col, ownerId);
    };

    add("rbox", 0, 0.03, 0, 1.65, 0.06, 1.45, PALETTE.stone);
    add("rbox", 0, 0.07, 0, 1.42, 0.04, 1.22, PALETTE.wallWarm);

    add("rbox", -0.76, 0.14, -0.66, 0.06, 0.22, 0.45, PALETTE.wood);
    add("rbox", 0.76, 0.14, -0.66, 0.06, 0.22, 0.45, PALETTE.wood);
    add("cylinder", -0.72, 0.18, 0.62, 0.10, 0.32, 0.10, PALETTE.stone);
    add("glowsphere", -0.72, 0.36, 0.62, 0.12, 0.12, 0.12, PALETTE.glowGold);

    add("cylinder", 0.62, 0.15, 0.52, 0.14, 0.20, 0.14, PALETTE.wood);
    add("cylinder", 0.46, 0.15, 0.56, 0.14, 0.20, 0.14, PALETTE.wood);
    add("cylinder", 0.54, 0.32, 0.54, 0.13, 0.18, 0.13, PALETTE.coral);
    add("rbox", -0.52, 0.11, 0.54, 0.22, 0.10, 0.16, PALETTE.stone);
    add("rbox", -0.30, 0.11, 0.54, 0.22, 0.10, 0.16, PALETTE.stone);
    add("rbox", -0.41, 0.20, 0.54, 0.20, 0.10, 0.15, PALETTE.yellow);

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
        add("rbox", 0, 0.46, 0, 1.45, 0.84, 0.96, PALETTE.wallWarm);
        add("rbox", 0, 0.90, 0, 1.58, 0.08, 1.08, PALETTE.eaveRust);
        add("hip", 0, 1.26, 0, 1.65, 0.70, 1.18, mainColor);
        add("rbox", 0, 1.54, 0, 0.56, 0.30, 0.42, PALETTE.wallWarm);
        add("hip", 0, 1.80, 0, 0.72, 0.28, 0.56, PALETTE.ink);
        for (let side of [-1, 1]) {
          add("rbox", side * 0.92, 0.32, 0.10, 0.58, 0.56, 0.72, PALETTE.wallWarm);
          add("hip", side * 0.92, 0.72, 0.10, 0.72, 0.36, 0.84, PALETTE.eaveRust);
          add("glowbox", side * 0.92, 0.34, 0.47, 0.22, 0.20, 0.04, PALETTE.glowGold);
        }
        add("rbox", 0.65, 0.78, -0.42, 0.38, 1.48, 0.38, PALETTE.stone);
        add("cone", 0.65, 1.68, -0.42, 0.48, 0.45, 0.48, PALETTE.ink);
        add("cylinder", -0.65, 0.68, -0.42, 0.32, 1.28, 0.32, PALETTE.teal);
        add("dome", -0.65, 1.32, -0.42, 0.34, 0.30, 0.34, PALETTE.yellow);
        for (let wx of [-0.44, -0.15, 0.15, 0.44]) {
          add("glowbox", wx, 0.58, 0.49, 0.18, 0.24, 0.04, PALETTE.glowGold);
        }
        add("rbox", 0, 0.22, 0.56, 0.42, 0.38, 0.22, PALETTE.wood);
        add("glowsphere", -0.26, 0.36, 0.68, 0.11, 0.14, 0.11, PALETTE.glowGold);
        add("glowsphere", 0.26, 0.36, 0.68, 0.11, 0.14, 0.11, PALETTE.glowGold);
        break;
      }

      case "mortar_battery": {
        add("rbox", 0, 0.24, 0, 1.85, 0.42, 1.05, PALETTE.stone);
        add("rbox", 0, 0.48, -0.25, 1.55, 0.26, 0.55, PALETTE.wood);
        for (let m = -4; m <= 4; m++) {
          add("cylinder", m * 0.19, 0.80, 0.16, 0.13, 0.92, 0.13, PALETTE.ink, 0.10, 0, 0);
          add("torus", m * 0.19, 1.26, 0.20, 0.16, 0.16, 0.16, PALETTE.yellow, Math.PI / 2, 0, 0);
        }
        break;
      }

      case "command_yagura": {
        add("rbox", 0, 0.38, 0, 1.52, 0.72, 1.16, PALETTE.wallWarm);
        add("hip", 0, 0.90, 0, 1.72, 0.48, 1.34, PALETTE.ink);
        add("rbox", 0, 1.26, 0, 1.04, 0.64, 0.84, PALETTE.wallWarm);
        add("hip", 0, 1.74, 0, 1.32, 0.50, 1.06, PALETTE.coral);
        for (let lx of [-0.68, 0.68]) {
          for (let lz of [-0.48, 0.48]) {
            add("glowsphere", lx, 0.70, lz, 0.13, 0.16, 0.13, PALETTE.glowGold);
          }
        }
        break;
      }

      case "watermill": {
        add("rbox", -0.25, 0.36, 0, 0.72, 0.64, 0.62, PALETTE.wallWarm);
        add("hip", -0.25, 0.80, 0, 0.88, 0.40, 0.76, PALETTE.coral);
        add("torus", 0.20, 0.42, 0, 0.65, 0.65, 0.34, PALETTE.wood, 0, Math.PI / 2, 0);
        for (let m = -1; m <= 1; m++) {
          add("cylinder", 0.48, 0.22, m * 0.25, 0.24, 0.34, 0.24, PALETTE.wood);
          add("cylinder", 0.48, 0.52, m * 0.25, 0.07, 0.44, 0.07, PALETTE.ink);
        }
        break;
      }

      case "color_vats": {
        const cols = [0xdb6a41, 0x8db86f, 0x3e7c8c, 0xfcea8b, 0xf2b5c6, 0x6f7fb5];
        cols.forEach((c, idx) => {
          const ang = (idx / 6) * Math.PI * 2;
          const ox = Math.cos(ang) * 0.40;
          const oz = Math.sin(ang) * 0.34;
          add("cylinder", ox, 0.32, oz, 0.26, 0.52, 0.26, c);
          add("torus", ox, 0.58, oz, 0.28, 0.28, 0.20, PALETTE.ink, Math.PI / 2, 0, 0);
        });
        add("cylinder", 0, 0.48, 0, 0.22, 0.82, 0.22, PALETTE.stone);
        break;
      }

      case "rolling_drums": {
        for (let i = -1; i <= 1; i++) {
          add("rbox", i * 0.38, 0.16, -0.08, 0.28, 0.26, 0.38, PALETTE.wood);
          add("cylinder", i * 0.38, 0.44, -0.08, 0.32, 0.44, 0.32, PALETTE.yellow, 0, 0, Math.PI / 5);
          add("torus", i * 0.38, 0.44, -0.08, 0.34, 0.34, 0.25, PALETTE.ink, 0, Math.PI / 2, 0);
        }
        break;
      }

      case "drying_racks": {
        for (let r = -1; r <= 1; r++) {
          add("rbox", 0, 0.16 + (r + 1) * 0.12, r * 0.30, 1.06, 0.07, 0.26, PALETTE.wood);
          for (let c = -3; c <= 3; c++) {
            const col = [PALETTE.coral, PALETTE.yellow, PALETTE.teal, PALETTE.pastelPink, PALETTE.foliage1][(c + 3) % 5];
            add("sphere", c * 0.14, 0.23 + (r + 1) * 0.12, r * 0.30, 0.10, 0.08, 0.10, col);
          }
        }
        break;
      }

      case "windmill": {
        add("cone", 0, 0.50, 0, 0.54, 0.92, 0.54, PALETTE.wallWarm);
        add("cone", 0, 1.02, 0, 0.38, 0.34, 0.38, PALETTE.coral);
        add("box", 0, 0.74, 0.28, 0.88, 0.10, 0.04, PALETTE.wood);
        add("box", 0, 0.74, 0.28, 0.10, 0.88, 0.04, PALETTE.wood);
        break;
      }

      case "hydraulic_press": {
        add("rbox", -0.36, 0.52, 0, 0.16, 0.98, 0.44, PALETTE.ink);
        add("rbox", 0.36, 0.52, 0, 0.16, 0.98, 0.44, PALETTE.ink);
        add("rbox", 0, 0.96, 0, 0.94, 0.18, 0.50, PALETTE.coral);
        add("cylinder", 0, 0.62, 0, 0.34, 0.44, 0.34, PALETTE.yellow);
        for (let s = -1; s <= 1; s++) {
          add("dome", s * 0.32, 0.10, 0.32, 0.28, 0.24, 0.28, PALETTE.wood);
        }
        break;
      }

      case "cutaway_shell": {
        add("cylinder", 0, 0.18, 0, 0.92, 0.30, 0.92, PALETTE.wood);
        add("torus", 0, 0.36, 0, 0.86, 0.86, 0.45, PALETTE.coral, Math.PI / 2, 0, 0);
        add("torus", 0, 0.38, 0, 0.56, 0.56, 0.45, PALETTE.yellow, Math.PI / 2, 0, 0);
        add("torus", 0, 0.40, 0, 0.30, 0.30, 0.45, PALETTE.teal, Math.PI / 2, 0, 0);
        add("sphere", 0, 0.40, 0, 0.18, 0.18, 0.18, PALETTE.ink);
        break;
      }

      case "winder_machine":
      case "hanging_rack": {
        add("rbox", -0.48, 0.48, 0, 0.10, 0.92, 0.10, PALETTE.wood);
        add("rbox", 0.48, 0.48, 0, 0.10, 0.92, 0.10, PALETTE.wood);
        add("rbox", 0, 0.90, 0, 1.08, 0.10, 0.10, PALETTE.wood);
        for (let b = -1; b <= 1; b++) {
          add("sphere", b * 0.30, 0.50, 0, 0.26, 0.26, 0.26, b === 0 ? PALETTE.coral : PALETTE.stone);
        }
        break;
      }

      case "hopper_tower": {
        add("rbox", -0.30, 0.36, 0, 0.08, 0.68, 0.48, PALETTE.ink);
        add("rbox", 0.30, 0.36, 0, 0.08, 0.68, 0.48, PALETTE.ink);
        add("cone", 0, 0.74, 0, 0.74, 0.80, 0.74, PALETTE.teal, Math.PI, 0, 0);
        add("sphere", 0, 0.22, 0, 0.28, 0.28, 0.28, PALETTE.coral);
        break;
      }

      case "xray_dome": {
        add("dome", 0, 0.08, 0, 0.90, 0.84, 0.90, PALETTE.wallWarm);
        add("torus", 0, 0.50, 0, 0.94, 0.94, 0.40, PALETTE.pastelCyan, Math.PI / 2, 0, 0);
        add("glowbox", 0, 0.36, 0.46, 0.42, 0.28, 0.08, PALETTE.glowGold);
        break;
      }

      case "mortar_tubes":
      case "multi_launcher": {
        add("rbox", 0, 0.12, 0, 1.08, 0.18, 0.66, PALETTE.wood);
        for (let k = -3; k <= 3; k++) {
          add("cylinder", k * 0.15, 0.48, 0, 0.14, 0.68, 0.14, PALETTE.ink, 0.1, 0, k * 0.05);
        }
        break;
      }

      case "classroom":
      case "clinic":
      case "sieve_shed":
      case "boxer_machine": {
        add("rbox", 0, 0.34, 0, 0.86, 0.58, 0.68, PALETTE.wallWarm);
        add("hip", 0, 0.74, 0, 1.02, 0.44, 0.84, PALETTE.coral);
        add("glowbox", -0.20, 0.36, 0.35, 0.20, 0.20, 0.04, PALETTE.glowGold);
        add("glowbox", 0.20, 0.36, 0.35, 0.20, 0.20, 0.04, PALETTE.glowGold);
        break;
      }

      case "pavilion":
      case "booth":
      case "vat_station": {
        add("rbox", 0, 0.18, 0, 0.82, 0.28, 0.64, PALETTE.wood);
        add("cylinder", -0.34, 0.44, 0.24, 0.06, 0.48, 0.06, PALETTE.wood);
        add("cylinder", 0.34, 0.44, 0.24, 0.06, 0.48, 0.06, PALETTE.wood);
        add("cone", 0, 0.74, 0, 0.98, 0.44, 0.98, PALETTE.yellow);
        break;
      }

      case "canal_bridge": {
        add("rbox", 0, 0.08, 0, 1.02, 0.08, 0.54, PALETTE.teal);
        add("rbox", 0, 0.22, 0, 0.42, 0.10, 0.76, PALETTE.coral);
        break;
      }

      case "bus_stop":
      case "bike_rack": {
        add("rbox", -0.24, 0.34, -0.18, 0.46, 0.58, 0.20, PALETTE.teal);
        add("rbox", 0.18, 0.24, 0.14, 0.56, 0.34, 0.32, PALETTE.coral);
        add("glowsphere", 0.46, 0.22, 0.14, 0.10, 0.10, 0.10, PALETTE.glowGold);
        break;
      }

      case "stage":
      case "court": {
        add("rbox", 0, 0.12, 0, 1.06, 0.16, 0.86, PALETTE.stone);
        add("rbox", 0, 0.46, -0.28, 0.86, 0.48, 0.12, PALETTE.coral);
        add("glowsphere", -0.36, 0.44, 0.24, 0.14, 0.14, 0.14, PALETTE.glowGold);
        add("glowsphere", 0.36, 0.44, 0.24, 0.14, 0.14, 0.14, PALETTE.glowGold);
        break;
      }

      default: {
        add("cylinder", 0, 0.14, 0, 0.66, 0.22, 0.66, PALETTE.stone);
        if (modelKind === "symbol_globe" || modelKind === "symbol_star") {
          add("sphere", 0, 0.60, 0, 0.54, 0.54, 0.54, PALETTE.coral);
          add("torus", 0, 0.60, 0, 0.74, 0.74, 0.32, PALETTE.yellow, 0.5, 0.3, 0);
        } else if (modelKind === "symbol_clock" || modelKind === "symbol_coin") {
          add("cylinder", 0, 0.60, 0, 0.58, 0.16, 0.58, PALETTE.yellow, Math.PI / 2, 0, 0);
        } else {
          add("rbox", 0, 0.50, 0, 0.58, 0.44, 0.38, mainColor);
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
    const R = WORLD.R;       // 10.0
    const TOP = WORLD.TOP;   // 1.25
    const hitGeo = new THREE.BoxGeometry(1, 1, 1);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    const slotOffsets = [
      { x: -4.2, z: -0.4 },
      { x: 4.2,  z: -0.4 },
      { x: -2.8, z: 3.6 },
      { x: 2.8,  z: 3.6 }
    ];

    const extraMicroZones = [
      { x: -3.6, z: -3.6, model: "pavilion" },
      { x: 3.6,  z: -3.6, model: "sieve_shed" },
      { x: 0.0,  z: 1.4,  model: "canal_bridge" },
      { x: -5.4, z: 2.0,  model: "bus_stop" },
      { x: 5.4,  z: 2.0,  model: "booth" },
      { x: 0.0,  z: 5.2,  model: "court" }
    ];

    this.islandsData.forEach((isl) => {
      const { x: ix, z: iz } = axialToWorld(isl.axial.q, isl.axial.r);

      this.buildModelArchetype(isl.mainModel, ix, TOP, iz - 3.6, 2.4, isl.id, isl.color);

      isl.items.forEach((item, idx) => {
        const slot = slotOffsets[idx % slotOffsets.length];
        const bx = ix + slot.x;
        const bz = iz + slot.z;
        const itemScale = 1.65;

        this.buildModelArchetype(item.model, bx, TOP, bz, itemScale, item.id, isl.color);

        const topY = TOP + itemScale * 1.25;
        this.itemAnchors[item.id] = { x: bx, y: topY, z: bz, item, island: isl, index: idx + 1 };

        const pick = new THREE.Mesh(hitGeo, hitMat);
        pick.position.set(bx, TOP + itemScale * 0.55, bz);
        pick.scale.set(itemScale * 1.5, itemScale * 1.4, itemScale * 1.5);
        pick.userData = { type: "item", item, island: isl };
        this.scene.add(pick);
        this.itemPickMeshes.push(pick);
      });

      extraMicroZones.forEach((ez) => {
        this.buildModelArchetype(ez.model, ix + ez.x, TOP, iz + ez.z, 1.05, isl.id, isl.color);
      });

      for (let k = 0; k < 6; k++) {
        const ang = (k * Math.PI) / 3 + Math.PI / 6;

        for (let rRatio of [0.88, 0.45]) {
          const lx = ix + Math.cos(ang) * (R * rRatio);
          const lz = iz + Math.sin(ang) * (R * rRatio);
          this.addPart("cylinder", lx, TOP + 0.48, lz, 0.07, 0.96, 0.07, 0, 0, 0, PALETTE.ink);
          this.addPart("glowsphere", lx, TOP + 0.98, lz, 0.20, 0.20, 0.20, 0, 0, 0, PALETTE.glowGold);
        }

        const bx = ix + Math.cos(ang + 0.45) * (R * 0.74);
        const bz = iz + Math.sin(ang + 0.45) * (R * 0.74);
        this.addPart("rbox", bx, TOP + 0.11, bz, 0.58, 0.16, 0.22, 0, -ang, 0, PALETTE.wood);
        this.addPart("rbox", bx + Math.cos(ang) * 0.55, TOP + 0.12, bz + Math.sin(ang) * 0.55, 0.42, 0.18, 0.42, 0, 0, 0, PALETTE.stone);
        this.addPart("sphere", bx + Math.cos(ang) * 0.55, TOP + 0.26, bz + Math.sin(ang) * 0.55, 0.34, 0.22, 0.34, 0, 0, 0, PALETTE.pastelPink);

        if (k !== 1) {
          const tAngles = [ang + 0.16, ang - 0.16, ang + 0.32];
          const tRadii = [R * 0.76, R * 0.79, R * 0.64];
          const tScales = [1.28, 0.96, 0.82];
          tAngles.forEach((ta, ti) => {
            const tx = ix + Math.cos(ta) * tRadii[ti];
            const tz = iz + Math.sin(ta) * tRadii[ti];
            this.buildTree(ti === 1 ? "cherry" : isl.treeType, tx, TOP, tz, tScales[ti]);
          });
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
