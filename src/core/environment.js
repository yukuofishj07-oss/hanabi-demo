import * as THREE from "three";
import { GRID } from "../config/constants.js";

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.hemiLight = new THREE.HemisphereLight(0x98a8dc, 0x685a6e, 1.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xc0ccff, 1.2);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 90;
    this.dirLight.shadow.camera.left = -22;
    this.dirLight.shadow.camera.right = 22;
    this.dirLight.shadow.camera.top = 22;
    this.dirLight.shadow.camera.bottom = -22;
    this.dirLight.shadow.bias = -0.0006;
    this.dirLight.shadow.normalBias = 0.045;
    this.scene.add(this.dirLight);

    this.createSky();
    this.createWater();
    this.setNight();
  }

  createSky() {
    const geo = new THREE.SphereGeometry(160, 32, 16);
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x1e2c58) },
        uHorizon: { value: new THREE.Color(0x3f4f80) }
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
        varying vec3 vWorldPosition;
        void main() {
          vec3 dir = normalize(vWorldPosition);
          float factor = smoothstep(-0.05, 0.55, dir.y);
          gl_FragColor = vec4(mix(uHorizon, uTop, factor), 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(geo, this.skyMat);
    this.scene.add(sky);
  }

  createWater() {
    const geo = new THREE.CircleGeometry(140, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x5a88b2,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
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
      this.setDay(0xfff1de, 0xeef6fa, 0x8f8270, 2.8);
    } else {
      this.setSunset();
    }
  }

  setNight() {
    this.skyMat.uniforms.uTop.value.setHex(0x1e2c58);
    this.skyMat.uniforms.uHorizon.value.setHex(0x3f4f80);
    this.dirLight.color.setHex(0xc0ccff);
    this.dirLight.intensity = 0.8;
    this.dirLight.position.set(-10, 25, -10);
    this.hemiLight.color.setHex(0x98a8dc);
    this.hemiLight.groundColor.setHex(0x685a6e);
    this.hemiLight.intensity = 1.4;
  }

  setDay(sunCol, hemiSky, hemiGround, sunI) {
    this.skyMat.uniforms.uTop.value.setHex(0x9fd0ec);
    this.skyMat.uniforms.uHorizon.value.setHex(0xf4eee3);
    this.dirLight.color.setHex(sunCol);
    this.dirLight.intensity = sunI;
    this.dirLight.position.set(20, 40, 20);
    this.hemiLight.color.setHex(hemiSky);
    this.hemiLight.groundColor.setHex(hemiGround);
    this.hemiLight.intensity = 1.2;
  }

  setSunset() {
    this.skyMat.uniforms.uTop.value.setHex(0x5a5e9e);
    this.skyMat.uniforms.uHorizon.value.setHex(0xff9a7a);
    this.dirLight.color.setHex(0xff9f6a);
    this.dirLight.intensity = 1.6;
    this.dirLight.position.set(30, 15, 10);
    this.hemiLight.intensity = 1.0;
  }
}
