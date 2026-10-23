import * as THREE from "three";

function createSparkleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.3, "rgba(255, 240, 190, 0.95)");
  grad.addColorStop(0.65, "rgba(255, 160, 60, 0.5)");
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

    // 1. 實體 3D 發光星珠 InstancedMesh (保證任何電腦、任何視角、任何解析度都 100% 看得到立體大花火！)
    this.MAX_ORBS = 1800;
    const orbGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const orbMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    this.orbMesh = new THREE.InstancedMesh(orbGeo, orbMat, this.MAX_ORBS);
    this.orbMesh.frustumCulled = false; // 【關鍵修復】禁止視錐剔除！
    this.scene.add(this.orbMesh);

    // 2. 星芒光暈 Points 系統 (營造璀璨星塵氛圍)
    this.MAX_PARTICLES = 5000;
    this.pool = new Array(this.MAX_PARTICLES);
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.pool[i] = {
        active: false,
        x: 0, y: -9999, z: 0,
        vx: 0, vy: 0, vz: 0,
        r: 1, g: 1, b: 1,
        life: 0,
        decay: 0.014,
        gravity: 0.0025,
        twinkle: false,
        useOrb: i < this.MAX_ORBS
      };
    }

    const pGeo = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.MAX_PARTICLES * 3);
    this.colors = new Float32Array(this.MAX_PARTICLES * 3);

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.positions[i * 3 + 1] = -9999;
    }

    pGeo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 1.35,
      map: createSparkleTexture(),
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.points = new THREE.Points(pGeo, pMat);
    this.points.frustumCulled = false; // 【關鍵修復】禁止 Three.js 把花火剔除！
    this.scene.add(this.points);

    // 3. 升空中的實體火箭彈體
    this.rockets = [];
    this.dummy = new THREE.Object3D();
    this.tempColor = new THREE.Color();

    // 4. 爆炸動態強光 (照亮下方 S 型島嶼)
    this.burstLight = new THREE.PointLight(0xffb844, 0, 85, 1.2);
    this.scene.add(this.burstLight);

    this.palette = [
      { r: 1.0, g: 0.25, b: 0.32 },  // 緋紅
      { r: 0.20, g: 1.0, b: 0.50 },  // 翠綠
      { r: 0.25, g: 0.80, b: 1.0 },  // 琉璃藍
      { r: 1.0, g: 0.88, b: 0.18 },  // 錦冠純金
      { r: 1.0, g: 0.45, b: 0.95 },  // 櫻花紫
      { r: 1.0, g: 0.60, b: 0.15 }   // 琥珀橙
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

  // 預設從第 10 島（x:0, z:6.2）或隨機島嶼升空，高度設在畫面正中央 (Y = 7.5 ~ 11.5)
  launch(origin = null, type = null) {
    const launchSites = [
      { x: 0.0, z: 6.2 },   // 10號砲陣地 (主陣地)
      { x: -3.4, z: 0.0 },  // 中排中央
      { x: 3.4, z: 0.0 },   // 中排右側
      { x: 0.0, z: -6.2 }   // 後排中央
    ];
    const site = origin || launchSites[Math.floor(Math.random() * launchSites.length)];

    const types = ["chrysanthemum", "peony", "willow"];
    const actualType = type || types[Math.floor(Math.random() * types.length)];
    const col = this.palette[Math.floor(Math.random() * this.palette.length)];

    this.rockets.push({
      x: site.x + (Math.random() - 0.5) * 1.2,
      y: 0.85,
      z: site.z + (Math.random() - 0.5) * 1.2,
      vx: (Math.random() - 0.5) * 0.08,
      vy: 0.38 + Math.random() * 0.12,
      vz: (Math.random() - 0.5) * 0.08,
      targetY: 7.2 + Math.random() * 4.2, // 精準控制在畫面正中央高度爆炸！
      col,
      type: actualType
    });
  }

  explode(x, y, z, col, type) {
    let count = 260;
    let speedBase = 0.22;
    let decayBase = 0.011;
    let gravity = 0.0020;

    if (type === "willow") {
      count = 300;
      speedBase = 0.16;
      decayBase = 0.007;
      gravity = 0.0032;
    } else if (type === "chrysanthemum") {
      count = 280;
      speedBase = 0.25;
      decayBase = 0.010;
    }

    this.burstLight.position.set(x, y, z);
    this.burstLight.color.setRGB(col.r, col.g, col.b);
    this.burstLight.intensity = 15.0;

    // 1. 外環大菊花/牡丹星珠爆發
    for (let i = 0; i < count; i++) {
      const p = this.allocParticle();
      if (!p) break;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const spd = speedBase * (0.75 + Math.random() * 0.5);

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
      p.decay = decayBase * (0.85 + Math.random() * 0.35);
      p.gravity = gravity;
      p.twinkle = (type === "willow") || Math.random() > 0.5;
    }

    // 2. 內核雙色白金星蕊 (Core Pistil)
    const coreCol = this.palette[(Math.floor(Math.random() * this.palette.length))];
    for (let k = 0; k < 80; k++) {
      const p = this.allocParticle();
      if (!p) break;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const spd = speedBase * 0.42 * (0.7 + Math.random() * 0.4);

      p.x = x;
      p.y = y;
      p.z = z;
      p.vx = spd * Math.sin(phi) * Math.cos(theta);
      p.vy = spd * Math.cos(phi);
      p.vz = spd * Math.sin(phi) * Math.sin(theta);
      p.r = (coreCol.r + 1.0) * 0.5;
      p.g = (coreCol.g + 1.0) * 0.5;
      p.b = (coreCol.b + 1.0) * 0.5;
      p.life = 0.85;
      p.decay = 0.016;
      p.gravity = 0.0012;
      p.twinkle = false;
    }
  }

  launchBarrage() {
    const sites = [
      { x: -10.2, z: -6.2 },
      { x: -3.4, z: -6.2 },
      { x: 3.4, z: -6.2 },
      { x: 10.2, z: -6.2 },
      { x: 3.4, z: 0.0 },
      { x: -3.4, z: 0.0 },
      { x: 0.0, z: 6.2 }
    ];
    sites.forEach((site, idx) => {
      setTimeout(() => {
        this.launch(site);
      }, idx * 180);
    });
  }

  update() {
    // 1. 升空火球尾跡
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.z += r.vz;

      for (let t = 0; t < 2; t++) {
        const tp = this.allocParticle();
        if (tp) {
          tp.x = r.x + (Math.random() - 0.5) * 0.12;
          tp.y = r.y - t * 0.15;
          tp.z = r.z + (Math.random() - 0.5) * 0.12;
          tp.vx = (Math.random() - 0.5) * 0.015;
          tp.vy = -0.02;
          tp.vz = (Math.random() - 0.5) * 0.015;
          tp.r = 1.0; tp.g = 0.9; tp.b = 0.5;
          tp.life = 0.55;
          tp.decay = 0.045;
          tp.gravity = 0.0005;
          tp.twinkle = false;
        }
      }

      if (r.y >= r.targetY) {
        this.explode(r.x, r.y, r.z, r.col, r.type);
        this.rockets.splice(i, 1);
      }
    }

    // 2. 更新所有粒子與 3D 實體發光球
    const pos = this.positions;
    const col = this.colors;

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.pool[i];
      const idx = i * 3;

      if (!p.active) {
        pos[idx + 1] = -9999;
        if (p.useOrb) {
          this.dummy.position.set(0, -9999, 0);
          this.dummy.scale.set(0.001, 0.001, 0.001);
          this.dummy.updateMatrix();
          this.orbMesh.setMatrixAt(i, this.dummy.matrix);
        }
        continue;
      }

      p.life -= p.decay;
      if (p.life <= 0) {
        p.active = false;
        pos[idx + 1] = -9999;
        if (p.useOrb) {
          this.dummy.position.set(0, -9999, 0);
          this.dummy.scale.set(0.001, 0.001, 0.001);
          this.dummy.updateMatrix();
          this.orbMesh.setMatrixAt(i, this.dummy.matrix);
        }
        continue;
      }

      p.vy -= p.gravity;
      p.vx *= 0.982;
      p.vy *= 0.988;
      p.vz *= 0.982;
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      pos[idx] = p.x;
      pos[idx + 1] = p.y;
      pos[idx + 2] = p.z;

      let alpha = p.life;
      if (p.twinkle && Math.random() > 0.45) alpha *= 0.25;

      col[idx] = p.r * alpha;
      col[idx + 1] = p.colorG !== undefined ? p.g * alpha : p.g * alpha;
      col[idx + 2] = p.b * alpha;

      // 同步更新 3D 實體發光球體
      if (p.useOrb) {
        const s = Math.max(0.2, p.life * 1.35);
        this.dummy.position.set(p.x, p.y, p.z);
        this.dummy.scale.set(s, s, s);
        this.dummy.updateMatrix();
        this.orbMesh.setMatrixAt(i, this.dummy.matrix);

        this.tempColor.setRGB(p.r * alpha, p.g * alpha, p.b * alpha);
        this.orbMesh.setColorAt(i, this.tempColor);
      }
    }

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
    this.orbMesh.instanceMatrix.needsUpdate = true;
    if (this.orbMesh.instanceColor) this.orbMesh.instanceColor.needsUpdate = true;

    if (this.burstLight.intensity > 0) {
      this.burstLight.intensity -= 0.45;
      if (this.burstLight.intensity < 0) this.burstLight.intensity = 0;
    }
  }
}
