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
  tex.repeat.set(4, 4);
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
  tex.repeat.set(6, 1);
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
    this.buildSBridgesAndReturnLoop();
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
    const R = WORLD.R;       // 5.2
    const TOP = WORLD.TOP;   // 0.95

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
      const topGeo = new THREE.CircleGeometry(R - 0.16, 6);
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

      // 3. 外圈步道環 + 內部十字支線石板步道 (增添地面豐富細節！)
      const walkInner = R * 0.80;
      const walkOuter = R * 0.90;
      const walkGeo = new THREE.RingGeometry(walkInner, walkOuter, 6);
      walkGeo.rotateZ(Math.PI / 6);
      walkGeo.rotateX(-Math.PI / 2);
      const walkMesh = new THREE.Mesh(walkGeo, walkMat);
      walkMesh.position.y = TOP + 0.02;
      walkMesh.receiveShadow = true;
      group.add(walkMesh);

      // 島內中央圓形廣場與十字步道
      const centerPlaza = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.4, 24).rotateX(-Math.PI / 2), walkMat);
      centerPlaza.position.y = TOP + 0.02;
      group.add(centerPlaza);

      for (let a = 0; a < 3; a++) {
        const pathStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.45, R * 1.55).rotateX(-Math.PI / 2), walkMat);
        pathStrip.rotation.y = (a * Math.PI) / 3;
        pathStrip.position.y = TOP + 0.018;
        group.add(pathStrip);
      }

      // 4. 頂緣彩色圖案帶
      const bandH = 0.28;
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
      const shGeo = new THREE.RingGeometry(R * 0.98, R + 1.15, 6);
      shGeo.rotateZ(Math.PI / 6);
      shGeo.rotateX(-Math.PI / 2);
      const shMesh = new THREE.Mesh(shGeo, shallowMat);
      shMesh.position.y = WORLD.WATER_Y + 0.02;
      group.add(shMesh);

      const fmGeo = new THREE.RingGeometry(R + 0.04, R + 0.32, 6);
      fmGeo.rotateZ(Math.PI / 6);
      fmGeo.rotateX(-Math.PI / 2);
      const fmMesh = new THREE.Mesh(fmGeo, foamMat);
      fmMesh.position.y = WORLD.WATER_Y + 0.035;
      group.add(fmMesh);

      this.scene.add(group);

      // 6. 行人路網：每島 12 個節點
      const walkMidR = R * 0.85;
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

  buildSBridgesAndReturnLoop() {
    // 島與島之間距離拉開後，修長的 11 片甲板拱橋跨越寬闊水道！
    const deckMat = new THREE.MeshStandardMaterial({ color: PALETTE.wood, roughness: 0.78 });
    const railMat = new THREE.MeshStandardMaterial({ color: PALETTE.coral, roughness: 0.7 });
    const postMat = new THREE.MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.8 });

    const connectPair = (idA, idB, isLongReturn = false) => {
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

      const p1 = this.nodes[bestU];
      const p2 = this.nodes[bestV];
      const midX = (p1.x + p2.x) * 0.5;
      const midZ = (p1.z + p2.z) * 0.5;
      const len = Math.hypot(p2.x - p1.x, p2.z - p1.z);

      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(midX, WORLD.TOP, midZ);
      bridgeGroup.lookAt(p2.x, WORLD.TOP, p2.z);

      const planks = isLongReturn ? 23 : 11;
      const archHeight = isLongReturn ? 0.55 : 0.32;
      const pLen = len / planks;
      const width = isLongReturn ? 0.65 : 0.78;

      for (let k = 0; k < planks; k++) {
        const t = (k + 0.5) / planks;
        const yOff = Math.sin(t * Math.PI) * archHeight;
        const zOff = (t - 0.5) * len;

        const deck = new THREE.Mesh(
          new THREE.BoxGeometry(width, 0.08, pLen * 0.90),
          isLongReturn ? railMat : deckMat
        );
        deck.position.set(0, yOff + 0.04, zOff);
        deck.castShadow = true;
        deck.receiveShadow = true;
        bridgeGroup.add(deck);

        // 橋側精緻微縮欄杆柱
        if (k % 2 === 0) {
          for (let sx of [-width * 0.45, width * 0.45]) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6), postMat);
            post.position.set(sx, yOff + 0.15, zOff);
            bridgeGroup.add(post);
          }
        }
      }

      this.scene.add(bridgeGroup);
    };

    for (let i = 0; i < this.islandsData.length - 1; i++) {
      connectPair(this.islandsData[i].id, this.islandsData[i + 1].id, false);
    }

    // 12 觀禮台 直線回到原點 01 火藥配研室！
    connectPair("isl_12", "isl_01", true);
  }

  findShortestPath(islandFromId, islandToId) {
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
