import * as THREE from "three";
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { WORLD, DAY_KEYFRAMES, mulberry32 } from "../config/constants.js";

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.rng = mulberry32(998877);
    this.noise = new SimplexNoise({ random: () => this.rng() });

    this.fog = new THREE.Fog(0xf4eee3, 210, 680);
    this.scene.fog = this.fog;

    this.hemiLight = new THREE.HemisphereLight(0xeef6fa, 0x8f8270, 1.35);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff1de, 2.8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    const sc = 135;
    this.sunLight.shadow.camera.left = -sc;
    this.sunLight.shadow.camera.right = sc;
    this.sunLight.shadow.camera.top = sc;
    this.sunLight.shadow.camera.bottom = -sc;
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 380;
    this.sunLight.shadow.bias = -0.0006;
    this.sunLight.shadow.normalBias = 0.045;
    this.sunLight.shadow.radius = 3;
    this.scene.add(this.sunLight);

    this.fillLight = new THREE.DirectionalLight(0xbfd6ff, 0.35);
    this.fillLight.position.set(-60, 45, -55);
    this.scene.add(this.fillLight);

    this.clouds = [];
    this.boats = [];
    this.currentNight = 0;

    this.buildSky();
    this.buildWater();
    this.buildBasinTerrain();
    this.buildBackgroundTrees();
    this.buildClouds();
    this.buildSeaProps();
  }

  buildSky() {
    const geo = new THREE.SphereGeometry(720, 36, 20);
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x9fd0ec) },
        uHorizon: { value: new THREE.Color(0xf4eee3) },
        uSunDir: { value: new THREE.Vector3(0.2, 0.8, 0.5).normalize() },
        uSun: { value: new THREE.Color(0xfff1de) },
        uNight: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vDir = normalize(wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        uniform vec3 uSunDir;
        uniform vec3 uSun;
        uniform float uNight;
        varying vec3 vDir;

        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        void main() {
          vec3 dir = normalize(vDir);
          vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.55, dir.y));
          float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
          col += uSun * pow(sunDot, 18.0) * 0.35 * (1.0 - uNight * 0.7);

          if (uNight > 0.05 && dir.y > 0.02) {
            float h = hash(floor(dir * 180.0));
            if (h > 0.9965) {
              col += vec3(1.0, 0.97, 0.9) * uNight;
            }
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    this.scene.add(new THREE.Mesh(geo, this.skyMat));
  }

  buildWater() {
    const geo = new THREE.CircleGeometry(680, 72);
    geo.rotateX(-Math.PI / 2);

    this.waterMat = new THREE.ShaderMaterial({
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uTime: { value: 0 },
          uShallow: { value: new THREE.Color(0xa4d4da) },
          uDeep: { value: new THREE.Color(0x6fa9b8) },
          uTint: { value: new THREE.Color(0xa9d8db) }
        }
      ]),
      vertexShader: `
        #include <fog_pars_vertex>
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          vec4 mvPosition = viewMatrix * wp;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        uniform float uTime;
        uniform vec3 uShallow;
        uniform vec3 uDeep;
        uniform vec3 uTint;
        varying vec3 vWorldPos;

        void main() {
          float dist = length(vWorldPos.xz);
          float w1 = sin(vWorldPos.x * 0.14 + vWorldPos.z * 0.12 + uTime * 1.3);
          float w2 = cos(vWorldPos.x * 0.10 - vWorldPos.z * 0.16 - uTime * 0.95);
          float wave = (w1 + w2) * 0.5;

          vec3 base = mix(uShallow, uDeep, smoothstep(28.0, 240.0, dist));
          base = mix(base, uTint, 0.35);
          base += wave * 0.045;

          float sparkle = step(0.97, sin(vWorldPos.x * 1.4 + uTime * 3.0) * cos(vWorldPos.z * 1.4 - uTime * 2.5));
          base += sparkle * 0.08;

          gl_FragColor = vec4(base, 1.0);
          #include <fog_fragment>
        }
      `
    });

    const water = new THREE.Mesh(geo, this.waterMat);
    water.position.y = WORLD.WATER_Y;
    water.receiveShadow = true;
    this.scene.add(water);
  }

  fBm(x, z) {
    let val = 0;
    let amp = 0.5;
    let freq = 1.0;
    for (let i = 0; i < 3; i++) {
      val += amp * this.noise.noise(x * freq, z * freq);
      freq *= 2.05;
      amp *= 0.5;
    }
    return val;
  }

  getTerrainHeight(x, z) {
    const r = Math.hypot(x, z);
    const ring = THREE.MathUtils.smoothstep(r, 128, 195) * (1.0 - THREE.MathUtils.smoothstep(r, 260, 330));
    if (ring <= 0.001) return -1.8;

    const n = (this.fBm(x * 0.012, z * 0.012) + 1.0) * 0.5;
    let rawH = ring * (16.0 + n * 28.0);

    if (z > 40) {
      const frontSuppress = 1.0 - THREE.MathUtils.smoothstep(z, 40, 140) * 0.78;
      rawH *= frontSuppress;
    }

    const terraced = Math.floor(rawH * 0.5) / 0.5;
    return Math.max(-1.2, THREE.MathUtils.lerp(rawH, terraced, 0.58));
  }

  buildBasinTerrain() {
    const size = 660;
    const segs = 140;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const cBed = new THREE.Color(0x8fb3ad);
    const cSand = new THREE.Color(0xd9c9a3);
    const cField = new THREE.Color(0xaec493);
    const cGrass = new THREE.Color(0xa3b986);
    const cForest = new THREE.Color(0x6f8a62);
    const cRock = new THREE.Color(0xb2a38d);
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = this.getTerrainHeight(x, z);
      pos.setY(i, h);

      if (h < 0.0) tmp.copy(cBed);
      else if (h < 2.2) tmp.copy(cSand);
      else if (h < 7.5) tmp.copy(cField);
      else if (h < 14.0) tmp.copy(cGrass);
      else if (h < 22.5) tmp.copy(cForest);
      else tmp.copy(cRock);

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.0,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  buildBackgroundTrees() {
    const c1 = new THREE.ConeGeometry(1.1, 2.2, 6);
    c1.translate(0, 1.3, 0);
    const c2 = new THREE.ConeGeometry(0.88, 1.9, 6);
    c2.translate(0, 2.4, 0);
    const c3 = new THREE.ConeGeometry(0.62, 1.5, 6);
    c3.translate(0, 3.3, 0);
    const pineGeo = BufferGeometryUtils.mergeGeometries([c1, c2, c3]);

    const b1 = new THREE.IcosahedronGeometry(1.0, 1);
    b1.translate(0, 1.8, 0);
    const b2 = new THREE.IcosahedronGeometry(0.8, 1);
    b2.translate(0.5, 2.1, 0.2);
    const b3 = new THREE.IcosahedronGeometry(0.75, 1);
    b3.translate(-0.45, 2.0, -0.25);
    const b4 = new THREE.IcosahedronGeometry(0.65, 1);
    b4.translate(0, 2.7, 0);
    const broadGeo = BufferGeometryUtils.mergeGeometries([b1, b2, b3, b4]);

    const pineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
    const broadMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });

    const count = 950;
    const pineMesh = new THREE.InstancedMesh(pineGeo, pineMat, count);
    const broadMesh = new THREE.InstancedMesh(broadGeo, broadMat, count);

    const dummy = new THREE.Object3D();
    const palette = [new THREE.Color(0x9cc27a), new THREE.Color(0x8db86f), new THREE.Color(0x728f5f), new THREE.Color(0x6f8a62)];

    let pIdx = 0;
    let bIdx = 0;

    for (let i = 0; i < count * 2; i++) {
      const angle = this.rng() * Math.PI * 2;
      const dist = 132 + this.rng() * 135;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = this.getTerrainHeight(x, z);

      if (y < 2.2) continue;

      const s = 0.85 + this.rng() * 0.95;
      dummy.position.set(x, y - 0.1, z);
      dummy.scale.set(s, s, s);
      dummy.rotation.set(0, this.rng() * Math.PI * 2, 0);
      dummy.updateMatrix();

      const col = palette[Math.floor(this.rng() * palette.length)];
      if (i % 2 === 0 && pIdx < count) {
        pineMesh.setMatrixAt(pIdx, dummy.matrix);
        pineMesh.setColorAt(pIdx, col);
        pIdx++;
      } else if (bIdx < count) {
        broadMesh.setMatrixAt(bIdx, dummy.matrix);
        broadMesh.setColorAt(bIdx, col);
        bIdx++;
      }
    }

    pineMesh.count = pIdx;
    broadMesh.count = bIdx;
    this.scene.add(pineMesh);
    this.scene.add(broadMesh);
  }

  buildClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfffcf7, roughness: 0.92, metalness: 0.0 });
    for (let i = 0; i < 12; i++) {
      const cg = new THREE.Group();
      const puffs = 5 + Math.floor(this.rng() * 3);
      for (let p = 0; p < puffs; p++) {
        const r = 3.2 + this.rng() * 2.8;
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), cloudMat);
        m.position.set((p - puffs * 0.5) * 3.1, (this.rng() - 0.5) * 1.4, (this.rng() - 0.5) * 2.2);
        m.scale.y = 0.68;
        cg.add(m);
      }
      cg.position.set((this.rng() - 0.5) * 340, 48 + this.rng() * 18, -125 + (this.rng() - 0.5) * 160);
      cg.userData = { speed: 1.5 + this.rng() * 1.6 };
      this.clouds.push(cg);
      this.scene.add(cg);
    }
  }

  buildSeaProps() {
    const rockMat = new THREE.MeshStandardMaterial({ color: 0xc5b5a7, roughness: 0.88 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfff8f4, roughness: 0.75 });
    const coralMat = new THREE.MeshStandardMaterial({ color: 0xdb6a41, roughness: 0.75 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb48560, roughness: 0.8 });

    const lhGroup = new THREE.Group();
    lhGroup.position.set(-78, WORLD.WATER_Y, 42);
    const islet = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 5.2, 1.4, 8), rockMat);
    islet.position.y = 0.7;
    lhGroup.add(islet);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.15, 4.8, 12), whiteMat);
    tower.position.y = 3.6;
    lhGroup.add(tower);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.0, 1.4, 12), coralMat);
    band.position.y = 3.7;
    lhGroup.add(band);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.1, 12), coralMat);
    cap.position.y = 6.4;
    lhGroup.add(cap);
    this.scene.add(lhGroup);

    const boatCoords = [
      { x: -68, z: -32 },
      { x: 86, z: -28 },
      { x: 78, z: 36 },
      { x: -58, z: 48 }
    ];
    boatCoords.forEach((bc, idx) => {
      const bg = new THREE.Group();
      bg.position.set(bc.x, WORLD.WATER_Y + 0.15, bc.z);
      const hull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.0), woodMat);
      bg.add(hull);
      const sail = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.3, 3), whiteMat);
      sail.position.set(0, 1.4, 0);
      bg.add(sail);
      bg.userData = { baseX: bc.x, baseZ: bc.z, phase: idx * 1.6 };
      this.boats.push(bg);
      this.scene.add(bg);
    });
  }

  updateByMinutes(minutes, elapsedTime) {
    const m = ((minutes % 1440) + 1440) % 1440;
    let k0 = DAY_KEYFRAMES[0];
    let k1 = DAY_KEYFRAMES[1];
    for (let i = 0; i < DAY_KEYFRAMES.length - 1; i++) {
      if (m >= DAY_KEYFRAMES[i].min && m <= DAY_KEYFRAMES[i + 1].min) {
        k0 = DAY_KEYFRAMES[i];
        k1 = DAY_KEYFRAMES[i + 1];
        break;
      }
    }
    const span = Math.max(1, k1.min - k0.min);
    const alpha = THREE.MathUtils.clamp((m - k0.min) / span, 0, 1);

    const cTop = new THREE.Color(k0.skyTop).lerp(new THREE.Color(k1.skyTop), alpha);
    const cHor = new THREE.Color(k0.horizon).lerp(new THREE.Color(k1.horizon), alpha);
    const cSun = new THREE.Color(k0.sunColor).lerp(new THREE.Color(k1.sunColor), alpha);
    const cHemiS = new THREE.Color(k0.hemiSky).lerp(new THREE.Color(k1.hemiSky), alpha);
    const cHemiG = new THREE.Color(k0.hemiGround).lerp(new THREE.Color(k1.hemiGround), alpha);
    const cWater = new THREE.Color(k0.water).lerp(new THREE.Color(k1.water), alpha);

    const sunI = THREE.MathUtils.lerp(k0.sunI, k1.sunI, alpha);
    const hemiI = THREE.MathUtils.lerp(k0.hemiI, k1.hemiI, alpha);
    this.currentNight = THREE.MathUtils.lerp(k0.night, k1.night, alpha);

    const qMin = Math.floor(m / 10) * 10;
    const t = THREE.MathUtils.clamp((qMin - 360) / 720, 0, 1);
    const az = Math.PI * (0.15 + 0.7 * t);
    const el = 0.35 + Math.sin(t * Math.PI) * 0.75;
    const dir = new THREE.Vector3(
      Math.cos(az) * Math.cos(el),
      Math.sin(el),
      0.55 * Math.cos(el) + 0.35
    ).normalize();

    this.sunLight.position.copy(dir).multiplyScalar(165);
    this.sunLight.color.copy(cSun);
    this.sunLight.intensity = sunI;

    this.hemiLight.color.copy(cHemiS);
    this.hemiLight.groundColor.copy(cHemiG);
    this.hemiLight.intensity = hemiI;

    this.skyMat.uniforms.uTop.value.copy(cTop);
    this.skyMat.uniforms.uHorizon.value.copy(cHor);
    this.skyMat.uniforms.uSunDir.value.copy(dir);
    this.skyMat.uniforms.uSun.value.copy(cSun);
    this.skyMat.uniforms.uNight.value = this.currentNight;

    this.fog.color.copy(cHor);
    this.waterMat.uniforms.uTint.value.copy(cWater);
    this.waterMat.uniforms.uTime.value = elapsedTime;

    this.clouds.forEach((c) => {
      c.position.x += c.userData.speed * 0.025;
      if (c.position.x > 180) c.position.x = -180;
    });

    this.boats.forEach((b) => {
      b.position.y = WORLD.WATER_Y + 0.15 + Math.sin(elapsedTime * 2.0 + b.userData.phase) * 0.08;
      b.rotation.z = Math.sin(elapsedTime * 1.5 + b.userData.phase) * 0.06;
    });

    return this.currentNight;
  }
}
