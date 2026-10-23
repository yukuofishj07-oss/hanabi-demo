import * as THREE from "three";

export class FireworksEngine {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.rockets = [];

    const pGeo = new THREE.BufferGeometry();
    this.maxParticles = 1200;
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);

    pGeo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.points = new THREE.Points(pGeo, pMat);
    this.scene.add(this.points);

    this.pointLight = new THREE.PointLight(0xffa066, 0, 35);
    this.scene.add(this.pointLight);
  }

  launch(origin = new THREE.Vector3(-3.9, 0.65, -1.8)) {
    this.rockets.push({
      pos: origin.clone(),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        0.55 + Math.random() * 0.2,
        (Math.random() - 0.5) * 0.1
      ),
      targetY: 10 + Math.random() * 4,
      color: new THREE.Color().setHSL(Math.random(), 0.9, 0.6)
    });
  }

  explode(pos, baseColor) {
    const count = 180;
    this.pointLight.position.copy(pos);
    this.pointLight.color.copy(baseColor);
    this.pointLight.intensity = 6.0;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 0.08 + Math.random() * 0.18;

      this.particles.push({
        pos: pos.clone(),
        vel: new THREE.Vector3(
          speed * Math.sin(phi) * Math.cos(theta),
          speed * Math.cos(phi),
          speed * Math.sin(phi) * Math.sin(theta)
        ),
        color: baseColor.clone(),
        life: 1.0,
        decay: 0.012 + Math.random() * 0.015
      });
    }
  }

  update() {
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.pos.add(r.vel);

      if (r.pos.y >= r.targetY) {
        this.explode(r.pos, r.color);
        this.rockets.splice(i, 1);
      }
    }

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

      p.vel.y -= 0.0025;
      p.pos.add(p.vel);

      if (activeCount < this.maxParticles) {
        const idx = activeCount * 3;
        posAttr.array[idx] = p.pos.x;
        posAttr.array[idx + 1] = p.pos.y;
        posAttr.array[idx + 2] = p.pos.z;

        colAttr.array[idx] = p.color.r * p.life;
        colAttr.array[idx + 1] = p.color.g * p.life;
        colAttr.array[idx + 2] = p.color.b * p.life;
        activeCount++;
      }
    }

    for (let i = activeCount; i < this.maxParticles; i++) {
      const idx = i * 3;
      posAttr.array[idx + 1] = -9999;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    if (this.pointLight.intensity > 0) {
      this.pointLight.intensity -= 0.15;
      if (this.pointLight.intensity < 0) this.pointLight.intensity = 0;
    }
  }
}
