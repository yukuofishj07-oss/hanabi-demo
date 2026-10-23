import * as THREE from "three";

// 以純 Canvas 程序生成具備真實微縮景觀高亮度的「發光星芒光暈貼圖」(Zero External Assets)
function createSparkleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.2, "rgba(255, 240, 200, 0.85)");
  grad.addColorStop(0.5, "rgba(255, 180, 80, 0.35)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export class FireworksEngine {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audio = audioManager;

    this.MAX_PARTICLES = 6000; // 擴充粒子規模，盛大壯觀
    this.pool = new Array(this.MAX_PARTICLES);
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.pool[i] = {
        active: false,
        x: 0, y: -9999, z: 0,
        vx: 0, vy: 0, vz: 0,
        r: 1, g: 1, b: 1,
        life: 0,
        decay: 0.012,
        gravity: 0.002,
        twinkle: false,
        size: 0.8
      };
    }

    this.MAX_ROCKETS = 20;
    this.rockets = [];

    const pGeo = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.MAX_PARTICLES * 3);
    this.colors = new Float32Array(this.MAX_PARTICLES * 3);

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.positions[i * 3 + 1] = -9999;
    }

    pGeo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.72, // 放大粒子尺寸，清晰璀璨
      map: createSparkleTexture(),
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.points = new THREE.Points(pGeo, pMat);
    this.scene.add(this.points);

    // 爆炸夜空點光源
    this.burstLight = new THREE.PointLight(0xffb844, 0, 60, 1.4);
    this.scene.add(this.burstLight);

    // 日本傳統競技花火經典色系
    this.palette = [
      { r: 1.0, g: 0.22, b: 0.28 },  // 紅色星珠 (鍶鹽)
      { r: 0.15, g: 0.95, b: 0.45 }, // 翡翠綠 (鋇鹽)
      { r: 0.12, g: 0.75, b: 1.0 },  // 靛藍 (銅鹽)
      { r: 1.0, g: 0.82, b: 0.12 },  // 錦冠純金 (松炭與鈉)
      { r: 0.98, g: 0.42, b: 0.95 }, // 櫻花紫 (鍶+銅)
      { r: 1.0, g: 0.95, b: 0.90 }   // 白金銀 (鋁鎂合金)
    ];
  }

  allocParticle() {
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      if (!this.pool[i].active) {
        this.pool[i].active = true;
        return this.pool[i];
      }
    }
    return null;
  }

  launch(origin = new THREE.Vector3(-3.9, 0.65, -1.8), type = null) {
    if (this.rockets.length >= this.MAX_ROCKETS) return;

    const types = ["chrysanthemum", "peony", "willow"];
    const actualType = type || types[Math.floor(Math.random() * types.length)];
    const col = this.palette[Math.floor(Math.random() * this.palette.length)];

    this.rockets.push({
      x: origin.x,
      y: origin.y,
      z: origin.z,
      vx: (Math.random() - 0.5) * 0.16,
      vy: 0.65 + Math.random() * 0.24, // 升得更高更磅礡
      vz: (Math.random() - 0.5) * 0.16,
      targetY: 13 + Math.random() * 7,  // 升空至 13~20 公尺高空爆裂
      col,
      type: actualType
    });

    if (this.audio) {
      this.audio.playLaunch(0.9 + Math.random() * 0.25);
    }
  }

  explode(x, y, z, col, type) {
    let count = 280;
    let speedBase = 0.22;
    let decayBase = 0.011;
    let gravity = 0.0022;

    if (type === "willow") {
      count = 340;
      speedBase = 0.14;
      decayBase = 0.006; // 垂柳滯空金色長流
      gravity = 0.0038;
    } else if (type === "chrysanthemum") {
      count = 320;
      speedBase = 0.26;
      decayBase = 0.010;
    }

    this.burstLight.position.set(x, y, z);
    this.burstLight.color.setRGB(col.r, col.g, col.b);
    this.burstLight.intensity = 9.5;

    if (this.audio) {
      this.audio.playExplosion(type);
    }

    // 外環主體星珠爆發
    for (let i = 0; i < count; i++) {
      const p = this.allocParticle();
      if (!p) break;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const spd = speedBase * (0.65 + Math.random() * 0.75);

      p.x = x;
      p.y = y;
      p.z = z;
      p.vx = spd * Math.sin(phi) * Math.cos(theta);
      p.vy = spd * Math.cos(phi);
      p.vz = spd * Math.sin(phi) * Math.sin(theta);
      p.r = col.r;
      p.g = col.g;
      p.b = col.b;
      p.life = 1.0;
      p.decay = decayBase * (0.8 + Math.random() * 0.5);
      p.gravity = gravity;
      p.twinkle = (type === "willow") || Math.random() > 0.4;
    }

    // 內核小球變色雙層花火 (Core Burst)
    for (let k = 0; k < 60; k++) {
      const p = this.allocParticle();
      if (!p) break;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const spd = speedBase * 0.35 * Math.random();

      p.x = x;
      p.y = y;
      p.z = z;
      p.vx = spd * Math.sin(phi) * Math.cos(theta);
      p.vy = spd * Math.cos(phi);
      p.vz = spd * Math.sin(phi) * Math.sin(theta);
      p.r = 1.0;
      p.g = 0.95;
      p.b = 0.7; // 純白金內蕊
      p.life = 0.75;
      p.decay = 0.02;
      p.gravity = 0.001;
      p.twinkle = false;
    }
  }

  launchBarrage(center = new THREE.Vector3(-3.9, 0.65, -1.8)) {
    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 3.5,
          0,
          (Math.random() - 0.5) * 3.5
        );
        this.launch(center.clone().add(offset));
      }, i * 240);
    }
  }

  update() {
    // 火箭升空推進
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.z += r.vz;

      // 金色火花尾跡
      if (Math.random() > 0.15) {
        const tp = this.allocParticle();
        if (tp) {
          tp.x = r.x + (Math.random() - 0.5) * 0.1;
          tp.y = r.y - 0.2;
          tp.z = r.z + (Math.random() - 0.5) * 0.1;
          tp.vx = (Math.random() - 0.5) * 0.02;
          tp.vy = -0.03;
          tp.vz = (Math.random() - 0.5) * 0.02;
          tp.r = 1.0; tp.g = 0.85; tp.b = 0.45;
          tp.life = 0.5;
          tp.decay = 0.04;
          tp.gravity = 0.001;
          tp.twinkle = false;
        }
      }

      if (r.y >= r.targetY) {
        this.explode(r.x, r.y, r.z, r.col, r.type);
        this.rockets.splice(i, 1);
      }
    }

    // 粒子渲染更新
    const pos = this.positions;
    const col = this.colors;
    let needsPosUpdate = false;

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.pool[i];
      const idx = i * 3;

      if (!p.active) {
        if (pos[idx + 1] !== -9999) {
          pos[idx + 1] = -9999;
          needsPosUpdate = true;
        }
        continue;
      }

      p.life -= p.decay;
      if (p.life <= 0) {
        p.active = false;
        pos[idx + 1] = -9999;
        needsPosUpdate = true;
        continue;
      }

      p.vy -= p.gravity;
      p.vx *= 0.985;
      p.vz *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      pos[idx] = p.x;
      pos[idx + 1] = p.y;
      pos[idx + 2] = p.z;

      let alpha = p.life;
      if (p.twinkle && Math.random() > 0.45) alpha *= 0.25;

      col[idx] = p.r * alpha;
      col[idx + 1] = p.g * alpha;
      col[idx + 2] = p.b * alpha;
      needsPosUpdate = true;
    }

    if (needsPosUpdate) {
      this.points.geometry.attributes.position.needsUpdate = true;
      this.points.geometry.attributes.color.needsUpdate = true;
    }

    if (this.burstLight.intensity > 0) {
      this.burstLight.intensity -= 0.35;
      if (this.burstLight.intensity < 0) this.burstLight.intensity = 0;
    }
  }
}
