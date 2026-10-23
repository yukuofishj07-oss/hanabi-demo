import * as THREE from "three";
import { WORLD, PALETTE } from "../config/constants.js";

export function axialToWorld(q, r) {
  const x = Math.sqrt(3) * WORLD.SPACING * (q + r / 2);
  const z = 1.5 * WORLD.SPACING * r;
  return { x, z };
}

function createPatternTexture(kind) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f2e7d8";
  ctx.fillRect(0, 0, 256, 256);

  if (kind === "brick") {
    ctx.strokeStyle = "rgba(180, 155, 130, 0.38)";
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      const offset = (y / 24) % 2 === 0 ? 0 : 24;
      for (let x = offset; x < 256; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 24);
        ctx.stroke();
      }
    }
  } else if (kind === "dots") {
    ctx.fillStyle = "rgba(190, 165, 140, 0.42)";
    for (let y = 12; y < 256; y += 24) {
      for (let x = 12; x < 256; x += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    ctx.fillStyle = "rgba(195, 172, 148, 0.30)";
    for (let x = 0; x < 256; x += 24) {
      ctx.fillRect(x, 0, 10, 256);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function createRimBandTexture(hexColor) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  const c = new THREE.Color(hexColor);
  ctx.fillStyle = `#${c.getHexString()}`;
  ctx.fillRect(0, 0, 256, 64);

  ctx.fillStyle = "rgba(255, 248, 244, 0.45)";
  for (let x = 0; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x + 16, 10);
    ctx.lineTo(x + 28, 32);
    ctx.lineTo(x + 16, 54);
    ctx.lineTo(x + 4, 32);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 1);
  return tex;
}

export class IslandsBuilder {
  constructor(scene, islandsData) {
    this.scene = scene;
    this.islandsData = islandsData;
    this.islandMeshes = [];
    this.islandCenters = {};
    this.nodes = {};
    this.adj = {};

    this.textures = {
      brick: createPatternTexture("brick"),
      dots: createPatternTexture("dots"),
      stripes: createPatternTexture("stripes")
    };

    this.buildIslands();
    this.buildSBridgesAndOuterPerimeterReturn();
  }

  addNode(id, x, z) {
    this.nodes[id] = { id, x, z };
    if (!this.adj[id]) this.adj[id] = [];
  }

  addEdge(a, b) {
    const na = this.nodes[a];
    const nb = this.nodes[b];
    if (!na || !nb) return;
    const w = Math.hypot(na.x - nb.x, na.z - nb.z);
    this.adj[a].push({ to: b, w });
    this.adj[b].push({ to: a, w });
  }

  buildIslands() {
    const R = WORLD.R;       // 10.0
    const TOP = WORLD.TOP;   // 1.25

    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x89c2cb,
      roughness: 0.72,
      metalness: 0.05
    });

    const curbMat = new THREE.MeshStandardMaterial({
      color: 0xe4d6c3,
      roughness: 0.85
    });

    const walkMat = new THREE.MeshStandardMaterial({
      color: 0xdcc3ab,
      roughness: 0.88,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    const shallowMat = new THREE.MeshBasicMaterial({
      color: 0xb5e2e6,
      transparent: true,
      opacity: 0.48,
      polygonOffset: true,
      polygonOffsetFactor: -1
    });

    const foamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.58,
      polygonOffset: true,
      polygonOffsetFactor: -2
    });

    this.islandsData.forEach((isl) => {
      const { x, z } = axialToWorld(isl.axial.q, isl.axial.r);
      this.islandCenters[isl.id] = { x, z };

      const group = new THREE.Group();
      group.position.set(x, 0, z);

      // 1. 島嶼本體側面與路緣
      const bodyGeo = new THREE.CylinderGeometry(R, R * 0.94, TOP - WORLD.WATER_Y, 6);
      bodyGeo.rotateY(Math.PI / 6);
      const bodyMesh = new THREE.Mesh(bodyGeo, [cliffMat, curbMat, cliffMat]);
      bodyMesh.position.y = (TOP + WORLD.WATER_Y) / 2;
      bodyMesh.receiveShadow = true;
      bodyMesh.castShadow = true;
      bodyMesh.userData = { type: "island", islandId: isl.id, island: isl };
      group.add(bodyMesh);
      this.islandMeshes.push(bodyMesh);

      // 2. 島面
      const topGeo = new THREE.CircleGeometry(R - 0.25, 6);
      topGeo.rotateZ(Math.PI / 6);
      topGeo.rotateX(-Math.PI / 2);
      const topMat = new THREE.MeshStandardMaterial({
        map: this.textures[isl.pattern] || this.textures.brick,
        roughness: 0.92,
        metalness: 0.0,
        polygonOffset: true,
        polygonOffsetFactor: -1
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = TOP + 0.01;
      topMesh.receiveShadow = true;
      topMesh.userData = { type: "island", islandId: isl.id, island: isl };
      group.add(topMesh);
      this.islandMeshes.push(topMesh);

      // 3. 外圈與內圈雙層六角步道環 + 放射狀石板路網
      const walkGeo1 = new THREE.RingGeometry(R * 0.80, R * 0.89, 6);
      walkGeo1.rotateZ(Math.PI / 6);
      walkGeo1.rotateX(-Math.PI / 2);
      const walkMesh1 = new THREE.Mesh(walkGeo1, walkMat);
      walkMesh1.position.y = TOP + 0.02;
      walkMesh1.receiveShadow = true;
      group.add(walkMesh1);

      const walkGeo2 = new THREE.RingGeometry(R * 0.36, R * 0.44, 6);
      walkGeo2.rotateZ(Math.PI / 6);
      walkGeo2.rotateX(-Math.PI / 2);
      const walkMesh2 = new THREE.Mesh(walkGeo2, walkMat);
      walkMesh2.position.y = TOP + 0.02;
      group.add(walkMesh2);

      for (let a = 0; a < 3; a++) {
        const pathStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.75, R * 1.65).rotateX(-Math.PI / 2), walkMat);
        pathStrip.rotation.y = (a * Math.PI) / 3;
        pathStrip.position.y = TOP + 0.018;
        group.add(pathStrip);
      }

      // 4. 頂緣彩色圖案帶
      const bandH = 0.42;
      const bandGeo = new THREE.CylinderGeometry(R + 0.02, R + 0.02, bandH, 6, 1, true);
      bandGeo.rotateY(Math.PI / 6);
      const bandMat = new THREE.MeshStandardMaterial({
        map: createRimBandTexture(isl.color),
        roughness: 0.78
      });
      const bandMesh = new THREE.Mesh(bandGeo, bandMat);
      bandMesh.position.y = TOP - bandH * 0.55;
      group.add(bandMesh);

      // 5. 外圈淺水環與白色泡沫環
      const shGeo = new THREE.RingGeometry(R * 0.98, R + 1.8, 6);
      shGeo.rotateZ(Math.PI / 6);
      shGeo.rotateX(-Math.PI / 2);
      const shMesh = new THREE.Mesh(shGeo, shallowMat);
      shMesh.position.y = WORLD.WATER_Y + 0.02;
      group.add(shMesh);

      const fmGeo = new THREE.RingGeometry(R + 0.06, R + 0.48, 6);
      fmGeo.rotateZ(Math.PI / 6);
      fmGeo.rotateX(-Math.PI / 2);
      const fmMesh = new THREE.Mesh(fmGeo, foamMat);
      fmMesh.position.y = WORLD.WATER_Y + 0.035;
      group.add(fmMesh);

      this.scene.add(group);

      // 6. 行人路網：每島 12 個節點
      const walkMidR = R * 0.845;
      const verts = [];
      for (let k = 0; k < 6; k++) {
        const ang = (k * Math.PI) / 3 + Math.PI / 6;
        verts.push({
          x: x + Math.cos(ang) * walkMidR,
          z: z + Math.sin(ang) * walkMidR
        });
      }
      for (let k = 0; k < 6; k++) {
        const vCurr = verts[k];
        const vNext = verts[(k + 1) % 6];
        const vId = `${isl.id}_v${k}`;
        const mId = `${isl.id}_m${k}`;
        this.addNode(vId, vCurr.x, vCurr.z);
        this.addNode(mId, (vCurr.x + vNext.x) * 0.5, (vCurr.z + vNext.z) * 0.5);
      }
      for (let k = 0; k < 6; k++) {
        const vId = `${isl.id}_v${k}`;
        const mId = `${isl.id}_m${k}`;
        const nextV = `${isl.id}_v${(k + 1) % 6}`;
        this.addEdge(vId, mId);
        this.addEdge(mId, nextV);
      }
    });
  }

  buildBridgeSpan(p1, p2, planks = 13, archHeight = 0.48, isReturn = false) {
    const deckMat = new THREE.MeshStandardMaterial({ color: isReturn ? PALETTE.coral : PALETTE.wood, roughness: 0.78 });
    const postMat = new THREE.MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.8 });

    const midX = (p1.x + p2.x) * 0.5;
    const midZ = (p1.z + p2.z) * 0.5;
    const len = Math.hypot(p2.x - p1.x, p2.z - p1.z);

    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(midX, WORLD.TOP, midZ);
    bridgeGroup.lookAt(p2.x, WORLD.TOP, p2.z);

    const pLen = len / planks;
    const width = isReturn ? 0.95 : 1.25;

    for (let k = 0; k < planks; k++) {
      const t = (k + 0.5) / planks;
      const yOff = Math.sin(t * Math.PI) * archHeight;
      const zOff = (t - 0.5) * len;

      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.12, pLen * 0.90),
        deckMat
      );
      deck.position.set(0, yOff + 0.05, zOff);
      deck.castShadow = true;
      deck.receiveShadow = true;
      bridgeGroup.add(deck);

      if (k % 2 === 0) {
        for (let sx of [-width * 0.45, width * 0.45]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.28, 6), postMat);
          post.position.set(sx, yOff + 0.18, zOff);
          bridgeGroup.add(post);
        }
      }
    }

    this.scene.add(bridgeGroup);
  }

  buildSBridgesAndOuterPerimeterReturn() {
    // 1. 沿著 01 -> 02 -> ... -> 12 建置 S 型拱橋
    const connectIslands = (idA, idB) => {
      let bestU = null;
      let bestV = null;
      let minDist = Infinity;

      for (let i = 0; i < 6; i++) {
        const uId = `${idA}_m${i}`;
        const u = this.nodes[uId];
        for (let j = 0; j < 6; j++) {
          const vId = `${idB}_m${j}`;
          const v = this.nodes[vId];
          const d = Math.hypot(u.x - v.x, u.z - v.z);
          if (d < minDist) {
            minDist = d;
            bestU = uId;
            bestV = vId;
          }
        }
      }

      if (!bestU || !bestV) return;
      this.addEdge(bestU, bestV);
      this.buildBridgeSpan(this.nodes[bestU], this.nodes[bestV], 13, 0.52, false);
    };

    for (let i = 0; i < this.islandsData.length - 1; i++) {
      connectIslands(this.islandsData[i].id, this.islandsData[i + 1].id);
    }

    // 2. 【核心修正】12 觀禮台 -> 01 火藥配研：沿著島嶼「外圍外海」繞行回去，絕不穿過中間島嶼！
    const c12 = this.islandCenters["isl_12"];
    const c04 = this.islandCenters["isl_04"];
    const c01 = this.islandCenters["isl_01"];

    const outerWaypoints = [
      { id: "outer_wp1", x: c12.x + 18.5, z: c12.z + 2.0 },
      { id: "outer_wp2", x: c04.x + 15.5, z: 0.0 },
      { id: "outer_wp3", x: c04.x + 12.0, z: c04.z - 14.5 },
      { id: "outer_wp4", x: (c04.x + c01.x) * 0.5, z: c01.z - 15.5 },
      { id: "outer_wp5", x: c01.x - 4.0,  z: c01.z - 13.5 }
    ];

    const pierMat = new THREE.MeshStandardMaterial({ color: PALETTE.stone, roughness: 0.85 });
    const woodMat = new THREE.MeshStandardMaterial({ color: PALETTE.wood, roughness: 0.8 });
    const glowMat = new THREE.MeshStandardMaterial({ color: PALETTE.glowGold, emissive: PALETTE.glowGold, emissiveIntensity: 1.5 });

    outerWaypoints.forEach((wp) => {
      this.addNode(wp.id, wp.x, wp.z);

      const pierGroup = new THREE.Group();
      pierGroup.position.set(wp.x, 0, wp.z);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, WORLD.TOP - WORLD.WATER_Y, 8), pierMat);
      base.position.y = (WORLD.TOP + WORLD.WATER_Y) * 0.5;
      pierGroup.add(base);

      const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.16, 8), woodMat);
      deck.position.y = WORLD.TOP + 0.05;
      pierGroup.add(deck);

      const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.6, 8), woodMat);
      lanternPost.position.set(0, WORLD.TOP + 0.8, 0);
      pierGroup.add(lanternPost);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), glowMat);
      beacon.position.set(0, WORLD.TOP + 1.7, 0);
      pierGroup.add(beacon);

      this.scene.add(pierGroup);
    });

    const startNodeId = "isl_12_m0";
    const endNodeId = "isl_01_m4";
    const chainIds = [startNodeId, ...outerWaypoints.map((w) => w.id), endNodeId];

    for (let i = 0; i < chainIds.length - 1; i++) {
      const u = chainIds[i];
      const v = chainIds[i + 1];
      this.addEdge(u, v);
      this.buildBridgeSpan(this.nodes[u], this.nodes[v], 15, 0.35, true);
    }
  }

  findShortestPath(islandFromId, islandToId) {
    if (islandFromId === "isl_12" && islandToId === "isl_01") {
      const chainIds = ["isl_12_m0", "outer_wp1", "outer_wp2", "outer_wp3", "outer_wp4", "outer_wp5", "isl_01_m4"];
      return chainIds.map((id) => this.nodes[id]);
    }

    const startId = `${islandFromId}_m0`;
    const targetPrefix = `${islandToId}_`;

    const dist = {};
    const prev = {};
    const unvisited = new Set(Object.keys(this.nodes));

    for (let k of unvisited) dist[k] = Infinity;
    dist[startId] = 0;

    let endNodeId = null;

    while (unvisited.size > 0) {
      let u = null;
      let best = Infinity;
      for (let k of unvisited) {
        if (dist[k] < best) {
          best = dist[k];
          u = k;
        }
      }
      if (!u || best === Infinity) break;
      if (u.startsWith(targetPrefix)) {
        endNodeId = u;
        break;
      }
      unvisited.delete(u);

      for (let edge of this.adj[u]) {
        if (unvisited.has(edge.to)) {
          const alt = dist[u] + edge.w;
          if (alt < dist[edge.to]) {
            dist[edge.to] = alt;
            prev[edge.to] = u;
          }
        }
      }
    }

    const path = [];
    let curr = endNodeId;
    while (curr) {
      path.unshift(this.nodes[curr]);
      curr = prev[curr];
    }
    return path.length >= 2 ? path : [this.nodes[startId], this.nodes[`${islandToId}_m0`]];
  }
}
