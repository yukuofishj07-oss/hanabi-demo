import * as THREE from "three";

function createSoftGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.25, "rgba(255, 240, 190, 0.85)");
  grad.addColorStop(0.55, "rgba(255, 160, 60, 0.3)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export class FireworksEngine {
  constructor(scene) {
    this.scene = scene;

    // 使用流線拖尾線段 (LineSegments Streaks) 搭配柔光星芒點，呈現真實煙火放射絲線感！
    this.MAX_SPARKS = 3200;
    this.sparks = new Array(this.MAX_SPARKS);
    for (let i = 0; i < this.MAX_SPARKS; i++) {
      this.sparks[i] = {
        active: false,
        x: 0, y: -9999, z: 0,
        prevX: 0, prevY: -9999, prevZ: 0,
        vx: 0, vy: 0, vz: 0,
        r: 1, g: 1, b: 1,
        life: 0,
        decay: 0.012,
        gravity: 0.0025,
        twinkle: false
      };
    }

    // 1. 流線長尾跡 LineSegments (每顆火花拉出流暢光軌)
    const lineGeo = new THREE.BufferGeometry();
    this.linePositions = new Float32Array(this.MAX_SPARKS * 6); // 起點 + 終點
    this.lineColors = new Float32Array(this.MAX_SPARKS * 6);
    lineGeo.setAttribute("position", new THREE.BufferAttribute(this.linePositions, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(this.lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    this.streakLines = new THREE.LineSegments(lineGeo, lineMat);
    this.streakLines.frustumCulled = false;
    this.scene.add(this.streakLines);

    // 2. 前端璀璨星芒光頭 Points
    const pGeo = new THREE.BufferGeometry();
    this.headPositions = new Float32Array(this.MAX_SPARKS * 3);
    this.headColors = new Float32Array(this.MAX_SPARKS * 3);
    pGeo.setAttribute("position", new THREE.BufferAttribute(this.headPositions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(this.headColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.85,
      map: createSoftGlowTexture(),
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    this.sparkHeads = new THREE.Points(pGeo, pMat);
    this.sparkHeads.frustumCulled = false;
    this.scene.add(this.sparkHeads);

    this.rockets = [];
    this.burstLight = new THREE.PointLight(0xffb844, 0, 110, 1.2);
    this.scene.add(this.burstLight);

    // 典雅高純度花火色系 (移除刺眼死白，改用金、緋紅、翠綠、琉璃藍、櫻紫)
    this.palette = [
      { r: 1.0, g: 0.78, b: 0.22 },  // 錦冠純金
      { r: 1.0, g: 0.25, b: 0.35 },  // 緋紅牡丹
      { r: 0.20, g: 0.95, b: 0.55 }, // 翡翠綠
      { r: 0.28, g: 0.78, b: 1.0 },  // 琉璃青藍
      { r: 0.95, g: 0.42, b: 0.92 }  // 櫻花紫
    ];
  }

  allocSpark() {
    for (let i = 0; i < this.MAX_SPARKS; i++) {
      if (!this.sparks[i].active) {
        this.sparks[i].active = true;
        return this.sparks[i];
      }
    }
    return null;
  }

  // 在島嶼後上方夜空優雅升空綻放
  launch(origin = null, type = null) {
    const launchSites = [
      { x: 0.0, z: 9.5 },     // 10號施放台
      { x: -5.1, z: 0.0 },
      { x: 5.1, z: 0.0 },
      { x: -5.1, z: -9.5 },
      { x: 5.1, z: -9.5 }
    ];
    const site = origin || launchSites[Math.floor(Math.random() * launchSites.length)];

    const types = ["chrysanthemum", "willow", "peony"];
    const actualType = type || types[Math.floor(Math.random() * types.length)];
    const col = this.palette[Math.floor(Math.random() * this.palette.length)];

    this.rockets.push({
      x: site.x + (Math.random() - 0.5) * 1.5,
      y: 1.0,
      z: site.z + (Math.random() - 0.5) * 1.5,
      vx: (Math.random() - 0.5) * 0.06,
      vy: 0.44 + Math.random() * 0.12,
      vz: (Math.random() - 0.5) * 0.06,
      targetY: 9.5 + Math.random() * 5.0, // 在島嶼上方高空 9.5~14.5m 綻放
      col,
      type: actualType
    });
  }

  explode(x, y, z, col, type) {
    let count = 240;
    let speedBase = 0.28;
    let decayBase = 0.011;
    let gravity = 0.0022;

    if (type === "willow") {
      count = 280;
      speedBase = 0.20;
      decayBase = 0.0075;
      gravity = 0.0036;
    }

    this.burstLight.position.set(x, y, z);
    this.burstLight.color.setRGB(col.r, col.g, col.b);
    this.burstLight.intensity = 14.0;

    // 1. 外圈流線大花瓣
    for (let i = 0; i < count; i++) {
      const s = this.allocSpark();
      if (!s) break;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const spd = speedBase * (0.82 + Math.random() * 0.35);

      s.x = x; s.y = y; s.z = z;
      s.prevX = x; s.prevY = y; s.prevZ = z;
      s.vx = spd * Math.sin(phi) * Math.cos(theta);
      s.vy = spd * Math.cos(phi);
      s.vz = spd * Math.sin(phi) * Math.sin(theta);
      s.r = col.r; s.g = col.g; s.b = col.b;
      s.life = 1.0;
      s.decay = decayBase * (0.85 + Math.random() * 0.3);
      s.gravity = gravity;
      s.twinkle = (type === "willow") || Math.random() > 0.5;
    }

    // 2. 內圈變色星蕊
    const innerCol = this.palette[(Math.floor(Math.random() * this.palette.length))];
    for (let k = 0; k < 70; k++) {
      const s = this.allocSpark();
      if (!s) break;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const spd = speedBase * 0.42 * (0.8 + Math.random() * 0.3);

      s.x = x; s.y = y; s.z = z;
      s.prevX = x; s.prevY = y; s.prevZ = z;
      s.vx = spd * Math.sin(phi) * Math.cos(theta);
      s.vy = spd * Math.cos(phi);
      s.vz = spd * Math.sin(phi) * Math.sin(theta);
      s.r = innerCol.r; s.g = innerCol.g; s.b = innerCol.b;
      s.life = 0.85;
      s.decay = 0.015;
      s.gravity = 0.0015;
      s.twinkle = false;
    }
  }

  launchBarrage() {
    const sites = [
      { x: -15.3, z: -9.5 },
      { x: -5.1, z: -9.5 },
      { x: 5.1, z: -9.5 },
      { x: 15.3, z: -9.5 },
      { x: 5.1, z: 0.0 },
      { x: -5.1, z: 0.0 },
      { x: 0.0, z: 9.5 }
    ];
    sites.forEach((site, idx) => {
      setTimeout(() => {
        this.launch(site);
      }, idx * 200);
    });
  }

  update() {
    // 1. 火箭升空金絲尾跡
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      const oldX = r.x, oldY = r.y, oldZ = r.z;
      r.x += r.vx;
      r.y += r.vy;
      r.z += r.vz;

      const tp = this.allocSpark();
      if (tp) {
        tp.x = r.x; tp.y = r.y; tp.z = r.z;
        tp.prevX = oldX; tp.prevY = oldY - 0.35; tp.prevZ = oldZ;
        tp.vx = (Math.random() - 0.5) * 0.015;
        tp.vy = -0.02;
        tp.vz = (Math.random() - 0.5) * 0.015;
        tp.r = 1.0; tp.g = 0.82; tp.b = 0.38;
        tp.life = 0.48;
        tp.decay = 0.05;
        tp.gravity = 0.0005;
        tp.twinkle = false;
      }

      if (r.y >= r.targetY) {
        this.explode(r.x, r.y, r.z, r.col, r.type);
        this.rockets.splice(i, 1);
      }
    }

    // 2. 更新所有流線軌跡與星芒光點
    const lPos = this.linePositions;
    const lCol = this.lineColors;
    const hPos = this.headPositions;
    const hCol = this.headColors;

    for (let i = 0; i < this.MAX_SPARKS; i++) {
      const s = this.sparks[i];
      const hIdx = i * 3;
      const lIdx = i * 6;

      if (!s.active) {
        hPos[hIdx + 1] = -9999;
        lPos[lIdx + 1] = -9999;
        lPos[lIdx + 4] = -9999;
        continue;
      }

      s.life -= s.decay;
      if (s.life <= 0) {
        s.active = false;
        hPos[hIdx + 1] = -9999;
        lPos[lIdx + 1] = -9999;
        lPos[lIdx + 4] = -9999;
        continue;
      }

      // 儲存前一瞬位置以拉出流線光軌 (Streak)
      s.prevX = s.x - s.vx * 3.2;
      s.prevY = s.y - s.vy * 3.2;
      s.prevZ = s.z - s.vz * 3.2;

      s.vy -= s.gravity;
      s.vx *= 0.98;
      s.vy *= 0.985;
      s.vz *= 0.98;
      s.x += s.vx;
      s.y += s.vy;
      s.z += s.vz;

      let alpha = s.life;
      if (s.twinkle && Math.random() > 0.45) alpha *= 0.25;

      // 光頭座標與顏色
      hPos[hIdx] = s.x;
      hPos[hIdx + 1] = s.y;
      hPos[hIdx + 2] = s.z;
      hCol[hIdx] = s.r * alpha;
      hCol[hIdx + 1] = s.g * alpha;
      hCol[hIdx + 2] = s.b * alpha;

      // 流線光軌起點 (亮) 與尾端 (漸淡)
      lPos[lIdx] = s.x;
      lPos[lIdx + 1] = s.y;
      lPos[lIdx + 2] = s.z;
      lPos[lIdx + 3] = s.prevX;
      lPos[lIdx + 4] = s.prevY;
      lPos[lIdx + 5] = s.prevZ;

      lCol[lIdx] = s.r * alpha;
      lCol[lIdx + 1] = s.g * alpha;
      lCol[lIdx + 2] = s.b * alpha;
      lCol[lIdx + 3] = s.r * alpha * 0.15;
      lCol[lIdx + 4] = s.g * alpha * 0.15;
      lCol[lIdx + 5] = s.b * alpha * 0.15;
    }

    this.sparkHeads.geometry.attributes.position.needsUpdate = true;
    this.sparkHeads.geometry.attributes.color.needsUpdate = true;
    this.streakLines.geometry.attributes.position.needsUpdate = true;
    this.streakLines.geometry.attributes.color.needsUpdate = true;

    if (this.burstLight.intensity > 0) {
      this.burstLight.intensity -= 0.4;
      if (this.burstLight.intensity < 0) this.burstLight.intensity = 0;
    }
  }
}
