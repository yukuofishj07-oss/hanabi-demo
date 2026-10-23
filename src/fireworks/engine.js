import * as THREE from "three";

export class FireworksEngine {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.rockets = [];

    const pGeo = new THREE.BufferGeometry();
    this.maxParticles = 3000;
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);

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

    // 夜間爆炸時瞬間點亮海面的動態光源
    this.burstLight = new THREE.PointLight(0xffaa44, 0, 45, 1.2);
    this.scene.add(this.burstLight);
  }

  launch(origin = new THREE.Vector3(-3.9, 0.65, -1.8), type = "peony") {
    const types = ["peony", "chrysanthemum", "willow"];
    const actualType = type || types[Math.floor(Math.random() * types.length)];

    const palette = [
      new THREE.Color(0xff4757), // 烈焰紅
      new THREE.Color(0x2ed573), // 翠玉綠
      new THREE.Color(0x1e90ff), // 澄澈藍
      new THREE.Color(0xffa502), // 帝王金
      new THREE.Color(0xed4264), // 櫻花粉
      new THREE.Color(0x9b59b6)  // 典雅紫
    ];

    this.rockets.push({
      pos: origin.clone(),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.18,
        0.58 + Math.random() * 0.22,
        (Math.random() - 0.5) * 0.18
      ),
      targetY: 10 + Math.random() * 5,
      color: palette[Math.floor(Math.random() * palette.length)],
      type: actualType
    });
  }

  explode(pos, baseColor, type) {
    let count = 220;
    let speedBase = 0.16;
    let decayBase = 0.014;
    let gravity = 0.0022;

    if (type === "willow") {
      count = 280;
      speedBase = 0.12;
      decayBase = 0.007; // 垂柳滯空時間久
      gravity = 0.0035;  // 緩慢下垂
    } else if (type === "chrysanthemum") {
      count = 260;
      speedBase = 0.22;
      decayBase = 0.012;
    }

    this.burstLight.position.copy(pos);
    this.burstLight.color.copy(baseColor);
    this.burstLight.intensity = 8.5;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = speedBase * (0.6 + Math.random() * 0.8);

      this.particles.push({
        pos: pos.clone(),
        vel: new THREE.Vector3(
          speed * Math.sin(phi) * Math.cos(theta),
          speed * Math.cos(phi),
          speed * Math.sin(phi) * Math.sin(theta)
        ),
        color: baseColor.clone(),
        life: 1.0,
        decay: decayBase * (0.8 + Math.random() * 0.5),
        gravity,
        twinkle: Math.random() > 0.4
      });
    }
  }

  launchBarrage(center = new THREE.Vector3(-3.9, 0.65, -1.8)) {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 2.2,
          0,
          (Math.random() - 0.5) * 2.2
        );
        this.launch(center.clone().add(offset));
      }, i * 280);
    }
  }

  update() {
    // 火箭升空推進
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.pos.add(r.vel);

      // 產生升空火花尾跡
      if (Math.random() > 0.3) {
        this.particles.push({
          pos: r.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.08, -0.15, (Math.random() - 0.5) * 0.08)),
          vel: new THREE.Vector3(0, -0.02, 0),
          color: new THREE.Color(0xffeaa7),
          life: 0.5,
          decay: 0.04,
          gravity: 0.001,
          twinkle: false
        });
      }

      if (r.pos.y >= r.targetY) {
        this.explode(r.pos, r.color, r.type);
        this.rockets.splice(i, 1);
      }
    }

    // 爆炸粒子渲染與物理迭代
    let activeCount = 0;
    const posAttr = this.points.geometry.attributes.position;
    const colAttr = this.points.geometry.attributes.color;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.vel.y -= p.gravity;
      p.vel.multiplyScalar(0.985); // 微量空氣阻力
      p.pos.add(p.vel);

      if (activeCount < this.maxParticles) {
        const idx = activeCount * 3;
        posAttr.array[idx] = p.pos.x;
        posAttr.array[idx + 1] = p.pos.y;
        posAttr.array[idx + 2] = p.pos.z;

        let alpha = p.life;
        if (p.twinkle && Math.random() > 0.45) {
          alpha *= 0.3; // 閃爍效果
        }

        colAttr.array[idx] = p.color.r * alpha;
        colAttr.array[idx + 1] = p.color.g * alpha;
        colAttr.array[idx + 2] = p.color.b * alpha;
        activeCount++;
      }
    }

    // 隱藏非活動粒子
    for (let i = activeCount; i < this.maxParticles; i++) {
      const idx = i * 3;
      posAttr.array[idx + 1] = -9999;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // 爆炸火光柔和衰退
    if (this.burstLight.intensity > 0) {
      this.burstLight.intensity -= 0.28;
      if (this.burstLight.intensity < 0) this.burstLight.intensity = 0;
    }
  }
}
