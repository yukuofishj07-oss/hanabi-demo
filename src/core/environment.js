import * as THREE from "three";
import { GRID } from "../config/constants.js";

export class Environment {
  constructor(scene) {
    this.scene = scene;

    // 豐富的冷暖環境光
    this.hemiLight = new THREE.HemisphereLight(0xa8c8f8, 0x705842, 1.6);
    this.scene.add(this.hemiLight);

    // 主光線 (帶柔和陰影)
    this.dirLight = new THREE.DirectionalLight(0xfff2e0, 2.0);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 2;
    this.dirLight.shadow.camera.far = 120;
    this.dirLight.shadow.camera.left = -36;
    this.dirLight.shadow.camera.right = 36;
    this.dirLight.shadow.camera.top = 36;
    this.dirLight.shadow.camera.bottom = -36;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.035;
    this.scene.add(this.dirLight);

    // 全域溫暖祭典補光 (營造島嶼中央溫暖氛圍)
    this.warmFestivalLight = new THREE.PointLight(0xff9442, 3.2, 55, 1.2);
    this.warmFestivalLight.position.set(0, 6.5, 0);
    this.scene.add(this.warmFestivalLight);

    this.createSky();
    this.createWater();
    this.createDistantIslets();
    this.setNight();
  }

  createSky() {
    const geo = new THREE.SphereGeometry(220, 32, 20);
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x060d1d) },
        uHorizon: { value: new THREE.Color(0x1b2e52) },
        uNight: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        uniform float uNight;
        varying vec3 vWorldPosition;

        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float factor = smoothstep(-0.04, 0.52, dir.y);
          vec3 col = mix(uHorizon, uTop, factor);

          // 繁星點點
          if (uNight > 0.3 && dir.y > 0.02) {
            float star = step(0.9955, hash(floor(dir * 220.0)));
            col += star * vec3(1.0, 0.96, 0.85) * 0.9 * uNight;
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(geo, this.skyMat);
    this.scene.add(sky);
  }

  createWater() {
    const geo = new THREE.CircleGeometry(200, 64);
    this.waterMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uShallow: { value: new THREE.Color(0x1f526b) },
        uDeep: { value: new THREE.Color(0x0a1c2e) }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uShallow;
        uniform vec3 uDeep;
        varying vec3 vWorldPos;

        void main() {
          float dist = length(vWorldPos.xz);
          float w1 = sin(vWorldPos.x * 0.45 + uTime * 1.4) * cos(vWorldPos.z * 0.45 - uTime * 1.1);
          vec3 col = mix(uShallow, uDeep, smoothstep(5.0, 55.0, dist));
          col += w1 * 0.035;
          gl_FragColor = vec4(col, 0.94);
        }
      `
    });

    const water = new THREE.Mesh(geo, this.waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = GRID.WATER_Y;
    water.receiveShadow = true;
    this.scene.add(water);
  }

  createDistantIslets() {
    // 遠景微縮山嶼與小燈塔，豐富地平線層次
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x243b4a, roughness: 0.95 });
    const positions = [
      { x: -45, z: -42, r: 12, h: 6 },
      { x: 38, z: -45, r: 15, h: 7.5 },
      { x: 52, z: 12, r: 10, h: 4.5 },
      { x: -50, z: 18, r: 11, h: 5 }
    ];
    positions.forEach((p) => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 7), hillMat);
      m.position.set(p.x, p.h / 2 - 0.5, p.z);
      this.scene.add(m);
    });
  }

  setTime(minutes) {
    if (minutes >= 1200 || minutes < 360) {
      this.setNight();
    } else if (minutes < 720) {
      this.setDay();
    } else {
      this.setSunset();
    }
  }

  setNight() {
    this.skyMat.uniforms.uTop.value.setHex(0x060d1d);
    this.skyMat.uniforms.uHorizon.value.setHex(0x1b2e52);
    this.skyMat.uniforms.uNight.value = 1.0;
    this.waterMat.uniforms.uShallow.value.setHex(0x1f526b);
    this.waterMat.uniforms.uDeep.value.setHex(0x0a1c2e);
    if (this.scene.fog) this.scene.fog.color.setHex(0x0e1b33);

    this.dirLight.color.setHex(0xc8dcff);
    this.dirLight.intensity = 1.15;
    this.dirLight.position.set(18, 36, 26);
    this.hemiLight.color.setHex(0x90b0e5);
    this.hemiLight.groundColor.setHex(0x5a4638);
    this.hemiLight.intensity = 1.5;
    this.warmFestivalLight.intensity = 3.5;
  }

  setDay() {
    this.skyMat.uniforms.uTop.value.setHex(0x6eb8e5);
    this.skyMat.uniforms.uHorizon.value.setHex(0xf7efe4);
    this.skyMat.uniforms.uNight.value = 0.0;
    this.waterMat.uniforms.uShallow.value.setHex(0x52b6c8);
    this.waterMat.uniforms.uDeep.value.setHex(0x287896);
    if (this.scene.fog) this.scene.fog.color.setHex(0xe8eff5);

    this.dirLight.color.setHex(0xfff3e0);
    this.dirLight.intensity = 2.6;
    this.dirLight.position.set(25, 45, 28);
    this.hemiLight.color.setHex(0xdcf0fa);
    this.hemiLight.groundColor.setHex(0x7a6855);
    this.hemiLight.intensity = 1.45;
    this.warmFestivalLight.intensity = 0.8;
  }

  setSunset() {
    this.skyMat.uniforms.uTop.value.setHex(0x3d4278);
    this.skyMat.uniforms.uHorizon.value.setHex(0xff8c61);
    this.skyMat.uniforms.uNight.value = 0.35;
    this.waterMat.uniforms.uShallow.value.setHex(0x4b6e8c);
    this.waterMat.uniforms.uDeep.value.setHex(0x223552);
    if (this.scene.fog) this.scene.fog.color.setHex(0x4a3b5c);

    this.dirLight.color.setHex(0xff9a62);
    this.dirLight.intensity = 2.0;
    this.dirLight.position.set(-32, 20, 18);
    this.hemiLight.intensity = 1.3;
    this.warmFestivalLight.intensity = 2.8;
  }

  update(time) {
    if (this.waterMat) {
      this.waterMat.uniforms.uTime.value = time;
    }
  }
}
