import * as THREE from "three";
import { GRID } from "../config/constants.js";

export class Environment {
  constructor(scene) {
    this.scene = scene;

    this.hemiLight = new THREE.HemisphereLight(0xc8dcf8, 0x5c4d3c, 1.55);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfff4e6, 1.9);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 100;
    this.dirLight.shadow.camera.left = -28;
    this.dirLight.shadow.camera.right = 28;
    this.dirLight.shadow.camera.top = 28;
    this.dirLight.shadow.camera.bottom = -28;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.035;
    this.scene.add(this.dirLight);

    this.createSky();
    this.createWater();
    this.setNight();
  }

  createSky() {
    const geo = new THREE.SphereGeometry(180, 32, 16);
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x060c1a) },
        uHorizon: { value: new THREE.Color(0x162647) },
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
          float factor = smoothstep(-0.05, 0.55, dir.y);
          vec3 col = mix(uHorizon, uTop, factor);

          if (uNight > 0.3 && dir.y > 0.03) {
            float star = step(0.9958, hash(floor(dir * 210.0)));
            col += star * 0.9 * uNight;
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(geo, this.skyMat);
    this.scene.add(sky);
  }

  createWater() {
    const geo = new THREE.CircleGeometry(150, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x16324a,
      roughness: 0.18,
      metalness: 0.22,
      transparent: true,
      opacity: 0.94
    });

    const water = new THREE.Mesh(geo, mat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = GRID.WATER_Y;
    water.receiveShadow = true;
    this.scene.add(water);
  }

  setTime(minutes) {
    if (minutes >= 1200 || minutes < 360) {
      this.setNight();
    } else if (minutes < 720) {
      this.setDay(0xfff1de, 0xc8dcf8, 0x6a5c48, 2.7);
    } else {
      this.setSunset();
    }
  }

  setNight() {
    this.skyMat.uniforms.uTop.value.setHex(0x060c1a);
    this.skyMat.uniforms.uHorizon.value.setHex(0x162647);
    this.skyMat.uniforms.uNight.value = 1.0;
    this.dirLight.color.setHex(0xc2d6ff);
    this.dirLight.intensity = 1.1; // 夜晚維持足夠柔和月光，讓微縮建築色彩依然溫潤清晰
    this.dirLight.position.set(15, 32, 22);
    this.hemiLight.color.setHex(0x90a8d8);
    this.hemiLight.groundColor.setHex(0x4e4036);
    this.hemiLight.intensity = 1.45;
  }

  setDay(sunCol, hemiSky, hemiGround, sunI) {
    this.skyMat.uniforms.uTop.value.setHex(0x7ec4e8);
    this.skyMat.uniforms.uHorizon.value.setHex(0xf7efe4);
    this.skyMat.uniforms.uNight.value = 0.0;
    this.dirLight.color.setHex(sunCol);
    this.dirLight.intensity = sunI;
    this.dirLight.position.set(22, 42, 25);
    this.hemiLight.color.setHex(hemiSky);
    this.hemiLight.groundColor.setHex(hemiGround);
    this.hemiLight.intensity = 1.4;
  }

  setSunset() {
    this.skyMat.uniforms.uTop.value.setHex(0x4a4e82);
    this.skyMat.uniforms.uHorizon.value.setHex(0xff8c66);
    this.skyMat.uniforms.uNight.value = 0.4;
    this.dirLight.color.setHex(0xff9f6a);
    this.dirLight.intensity = 1.8;
    this.dirLight.position.set(30, 18, 15);
    this.hemiLight.intensity = 1.2;
  }

  update(time) {}
}
