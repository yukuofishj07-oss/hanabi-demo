import * as THREE from "three";
import { WORLD } from "../config/constants.js";
import { axialToWorld } from "../world/islands.js";

function createGlowStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.28, "rgba(255, 238, 185, 0.9)");
  grad.addColorStop(0.6, "rgba(235, 130, 55, 0.35)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export class FireworksShow {
  constructor(scene, islandsData) {
    this.scene = scene;
    this.islandsData = islandsData;

    this.MAX_SPARKS = 3200;
    this.sparks = Array.from({ length: this.MAX_SPARKS }, () => ({
      active: false,
      x: 0, y: -9999, z: 0,
      px: 0, py: -9999, pz: 0,
      vx: 0, vy: 0, vz: 0,
      r: 1, g: 1, b: 1,
      life: 0, decay: 0.011, gravity: 0.0042
    }));

    const lineGeo = new THREE.BufferGeometry();
    this.linePos = new Float32Array(this.MAX_SPARKS * 6);
    this.lineCol = new Float32Array(this.MAX_SPARKS * 6);
    lineGeo.setAttribute("position", new THREE.BufferAttribute(this.linePos, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(this.lineCol, 3));

    this.lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })
    );
    this.lines.frustumCulled = false;
    this.scene.add(this.lines);

    const headGeo = new THREE.BufferGeometry();
    this.headPos = new Float32Array(this.MAX_SPARKS * 3);
    this.headCol = new Float32Array(this.MAX_SPARKS * 3);
    headGeo.setAttribute("position", new THREE.BufferAttribute(this.headPos, 3));
    headGeo.setAttribute("color", new THREE.BufferAttribute(this.headCol, 3));

    this.heads = new THREE.Points(
      headGeo,
      new THREE.PointsMaterial({ size: 1.65, map: createGlowStarTexture(), vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })
    );
    this.heads.frustumCulled = false;
    this.scene.add(this.heads);

    this.rockets = [];
    this.burstLight = new THREE.PointLight(0xffb84d, 0, 120, 1.2);
    this.scene.add(this.burstLight);

    this.palette = [
      { r: 1.0, g: 0.78, b: 0.25 },
      { r: 0.96, g: 0.34, b: 0.26 },
      { r: 0.28, g: 0.92, b: 0.55 },
      { r: 0.35, g: 0.78, b: 1.0 },
      { r: 0.95, g: 0.55, b: 0.85 }
    ];
  }

  alloc() {
    for (let i = 0; i < this.MAX_SPARKS; i++) {
      if (!this.sparks[i].active) {
        this.sparks[i].active = true;
        return this.sparks[i];
      }
    }
    return null;
  }

  launchFromIsland(island = null) {
    const targetIsl = island || this.islandsData[10]; // 11 號迫擊砲陣地
    const { x, z } = axialToWorld(targetIsl.axial.q, targetIsl.axial.r);
    const col = this.palette[Math.floor(Math.random() * this.palette.length)];

    this.rockets.push({
      x: x + (Math.random() - 0.5) * 2.5,
      y: WORLD.TOP + 0.8,
      z: z + (Math.random() - 0.5) * 2.5,
      vx: (Math.random() - 0.5) * 0.10,
      vy: 0.78 + Math.random() * 0.20,
      vz: (Math.random() - 0.5) * 0.10,
      targetY: 16 + Math.random() * 7,
      col
    });
  }

  launchSalvo() {
    [10, 11, 5].forEach((idx, i) => {
      setTimeout(() => {
        this.launchFromIsland(this.islandsData[idx]);
      }, i * 320);
    });
  }

  explode(x, y, z, col) {
    this.burstLight.position.set(x, y, z);
    this.burstLight.color.setRGB(col.r, col.g, col.b);
    this.burstLight.intensity = 10.0;

    const count = 220;
    for (let i = 0; i < count; i++) {
      const s = this.alloc();
      if (!s) break;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const spd = (i < 55 ? 0.22 : 0.48) * (0.8 + Math.random() * 0.35);

      s.x = s.px = x;
      s.y = s.py = y;
      s.z = s.pz = z;
      s.vx = spd * Math.sin(phi) * Math.cos(theta);
      s.vy = spd * Math.cos(phi);
      s.vz = spd * Math.sin(phi) * Math.sin(theta);
      s.r = i < 55 ? 1.0 : col.r;
      s.g = i < 55 ? 0.95 : col.g;
      s.b = i < 55 ? 0.8 : col.b;
      s.life = 1.0;
      s.decay = 0.010 + Math.random() * 0.005;
      s.gravity = 0.0042;
    }
  }

  update() {
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.z += r.vz;

      const trail = this.alloc();
      if (trail) {
        trail.x = r.x; trail.y = r.y; trail.z = r.z;
        trail.px = r.x; trail.py = r.y - 0.6; trail.pz = r.z;
        trail.vx = 0; trail.vy = -0.04; trail.vz = 0;
        trail.r = 1.0; trail.g = 0.85; trail.b = 0.45;
        trail.life = 0.42; trail.decay = 0.06; trail.gravity = 0.001;
      }

      if (r.y >= r.targetY) {
        this.explode(r.x, r.y, r.z, r.col);
        this.rockets.splice(i, 1);
      }
    }

    for (let i = 0; i < this.MAX_SPARKS; i++) {
      const s = this.sparks[i];
      const hi = i * 3;
      const li = i * 6;

      if (!s.active) {
        this.headPos[hi + 1] = -9999;
        this.linePos[li + 1] = -9999;
        this.linePos[li + 4] = -9999;
        continue;
      }

      s.life -= s.decay;
      if (s.life <= 0) {
        s.active = false;
        this.headPos[hi + 1] = -9999;
        this.linePos[li + 1] = -9999;
        this.linePos[li + 4] = -9999;
        continue;
      }

      s.px = s.x - s.vx * 2.8;
      s.py = s.y - s.vy * 2.8;
      s.pz = s.z - s.vz * 2.8;

      s.vy -= s.gravity;
      s.vx *= 0.98;
      s.vy *= 0.985;
      s.vz *= 0.98;
      s.x += s.vx;
      s.y += s.vy;
      s.z += s.vz;

      const a = s.life;
      this.headPos[hi] = s.x;
      this.headPos[hi + 1] = s.y;
      this.headPos[hi + 2] = s.z;
      this.headCol[hi] = s.r * a;
      this.headCol[hi + 1] = s.g * a;
      this.headCol[hi + 2] = s.b * a;

      this.linePos[li] = s.x;
      this.linePos[li + 1] = s.y;
      this.linePos[li + 2] = s.z;
      this.linePos[li + 3] = s.px;
      this.linePos[li + 4] = s.py;
      this.linePos[li + 5] = s.pz;

      this.lineCol[li] = s.r * a;
      this.lineCol[li + 1] = s.g * a;
      this.lineCol[li + 2] = s.b * a;
      this.lineCol[li + 3] = s.r * a * 0.15;
      this.lineCol[li + 4] = s.g * a * 0.15;
      this.lineCol[li + 5] = s.b * a * 0.15;
    }

    this.heads.geometry.attributes.position.needsUpdate = true;
    this.heads.geometry.attributes.color.needsUpdate = true;
    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.color.needsUpdate = true;

    if (this.burstLight.intensity > 0) {
      this.burstLight.intensity = Math.max(0, this.burstLight.intensity - 0.40);
    }
  }
}
