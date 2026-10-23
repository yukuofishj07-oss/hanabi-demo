import * as THREE from "three";

export class FireworksEngine {
  constructor(scene) {
    this.scene = scene;

    // 固定粒子物件池 (避免記憶體碎片化引起的卡頓)
    this.MAX_PARTICLES = 3600;
    this.pool = new Array(this.MAX_PARTICLES);
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.pool[i] = {
        active: false,
        x: 0, y: -9999, z: 0,
        vx: 0, vy: 0, vz: 0,
        r: 1, g: 1, b: 1,
        life: 0,
        decay: 0.015,
        gravity: 0.002,
        twinkle: false
      };
    }

    // 發射中的火箭隊列
    this.MAX_ROCKETS = 16;
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
      size: 0.38,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.points = new THREE.Points(pGeo, pMat);
    this.scene.add(this.points);

    // 夜晚地面動態反光
    this.burstLight = new THREE.PointLight(0xffa044, 0, 45, 1.2);
    this.scene.add(this.burstLight);

    this.palette = [
      { r: 1.0, g: 0.28, b: 0.35 }, // 鍶紅
      { r: 0.18, g: 0.85, b: 0.45 }, // 鋇綠
      { r: 0.12, g: 0.65, b: 1.0 },  // 銅藍
      { r: 1.0, g: 0.72, b: 0.1 },   // 鈉金
      { r: 0.95, g: 0.35, b: 0.85 }  // 櫻粉
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

  launch(origin = new THREE.Vector3(-3.9, 0.65, -1.8), type = "peony") {
    if (this.rockets.length >= this.MAX_ROCKETS) return;

    const col = this.palette[Math.floor(Math.random() * this.palette.length)];
    this.rockets.push({
      x: origin.x,
      y: origin.y,
      z: origin.z,
      vx: (Math.random() - 0.5) * 0.14,
      vy: 0.58 + Math.random() * 0.18,
      vz: (Math.random() - 0.5) * 0.14,
      targetY: 10 + Math.random() * 5,
      col,
      type
    });
  }

  explode(x, y, z, col, type) {
    let count = 200;
    let speedBase = 0.16;
    let decayBase = 0.013;
    let gravity = 0.0022;

    if (type === "willow") {
      count = 240;
      speedBase = 0.11;
      decayBase = 0.007; // 垂柳滯空久
      gravity = 0.0035;
    } else if (type === "chrysanthemum") {
      count = 220;
      speedBase = 0.21;
      decayBase = 0.012;
    }

    this.burstLight.position.set(x, y, z);
    this.burstLight.color.setRGB(col.r, col.g, col.b);
    this.burstLight.intensity = 8.0;

    for (let i = 0; i < count; i++) {
      const p = this.allocParticle();
      if (!p) break;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const spd = speedBase * (0.6 + Math.random() * 0.8);

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
      p.twinkle = Math.random() > 0.45;
    }
  }

  launchBarrage(center = new THREE.Vector3(-3.9, 0.65, -1.8)) {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 2.5,
          0,
          (Math.random() - 0.5) * 2.5
        );
        this.launch(center.clone().add(offset));
      }, i * 260);
    }
  }

  update() {
    // 1. 火箭物理迭代
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.z += r.vz;

      // 產生發射尾跡火星
      if (Math.random() > 0.25) {
        const tp = this.allocParticle();
        if (tp) {
          tp.x = r.x + (Math.random() - 0.5) * 0.08;
          tp.y = r.y - 0.15;
          tp.z = r.z + (Math.random() - 0.5) * 0.08;
          tp.vx = 0; tp.vy = -0.02; tp.vz = 0;
          tp.r = 1.0; tp.g = 0.9; tp.b = 0.65;
          tp.life = 0.45;
          tp.decay = 0.045;
          tp.gravity = 0.001;
          tp.twinkle = false;
        }
      }

      if (r.y >= r.targetY) {
        this.explode(r.x, r.y, r.z, r.col, r.type);
        this.rockets.splice(i, 1);
      }
    }

    // 2. 粒子物理迭代與顯存直接映射
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
      if (p.twinkle && Math.random() > 0.45) alpha *= 0.3;

      col[idx] = p.r * alpha;
      col[idx + 1] = p.g * alpha;
      col[idx + 2] = p.b * alpha;
      needsPosUpdate = true;
    }

    if (needsPosUpdate) {
      this.points.geometry.attributes.position.needsUpdate = true;
      this.points.geometry.attributes.color.needsUpdate = true;
    }

    // 3. 爆炸反光漸弱
    if (this.burstLight.intensity > 0) {
      this.burstLight.intensity -= 0.32;
      if (this.burstLight.intensity < 0) this.burstLight.intensity = 0;
    }
  }
}
