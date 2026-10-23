import * as THREE from "three";
import { GRID } from "../config/constants.js";

export class Environment {
  constructor(scene) {
    this.scene = scene;

    // 溫暖的環境天光與地面反射
    this.hemiLight = new THREE.HemisphereLight(0xbfd6f6, 0x544738, 1.4);
    this.scene.add(this.hemiLight);

    // 主陽光/月光
    this.dirLight = new THREE.DirectionalLight(0xfff3e3, 1.8);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 90;
    this.dirLight.shadow.camera.left = -26;
    this.dirLight.shadow.camera.right = 26;
    this.dirLight.shadow.camera.top = 26;
    this.dirLight.shadow.camera.bottom = -26;
    this.dirLight.shadow.bias = -0.0006;
    this.dirLight.shadow.normalBias = 0.04;
    this.scene.add(this.dirLight);

    this.createSky();
    this.createWater();
    this.createSurroundingHills();
    this.setNight();
  }

  createSky() {
    const geo = new THREE.SphereGeometry(150, 24, 16);
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x060c18) },     // 純淨無暇的深邃夜空
        uHorizon: { value: new THREE.Color(0x131f38) },
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

          // 璀璨繁星
          if (uNight > 0.3 && dir.y > 0.05) {
            float star = step(0.9960, hash(floor(dir * 200.0)));
            col += star * 0.85 * uNight;
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(geo, this.skyMat);
    this.scene.add(sky);
  }

  createWater() {
    // 晶瑩透亮的深海琉璃面
    const geo = new THREE.CircleGeometry(120, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1c3b57,
      roughness: 0.15,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92
    });

    const water = new THREE.Mesh(geo, mat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = GRID.WATER_Y;
    water.receiveShadow = true;
    this.scene.add(water);
  }

  createSurroundingHills() {
    // 外圍微縮黏土台地
    const hillGeo = new THREE.CylinderGeometry(40, 48, 3.5, 32, 1, true);
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x6e7f60,
      roughness: 0.95,
      flatShading: true
    });
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.position.y = 0.5;
    hill.receiveShadow = true;
    this.scene.add(hill);
  }

  setTime(minutes) {
    if (minutes >= 1200 || minutes < 360) {
      this.setNight();
    } else if (minutes < 720) {
      this.setDay(0xfff1de, 0xbfd6f6, 0x6a5c48, 2.6);
    } else {
      this.setSunset();
    }
  }

  setNight() {
    this.skyMat.uniforms.uTop.value.setHex(0x060c18);
    this.skyMat.uniforms.uHorizon.value.setHex(0x131f38);
    this.skyMat.uniforms.uNight.value = 1.0;
    this.dirLight.color.setHex(0xb5caff);
    this.dirLight.intensity = 0.85;
    this.dirLight.position.set(-15, 30, -15);
    this.hemiLight.color.setHex(0x8295c2);
    this.hemiLight.groundColor.setHex(0x423630);
    this.hemiLight.intensity = 1.25;
  }

  setDay(sunCol, hemiSky, hemiGround, sunI) {
    this.skyMat.uniforms.uTop.value.setHex(0x8ecae6);
    this.skyMat.uniforms.uHorizon.value.setHex(0xf4eee3);
    this.skyMat.uniforms.uNight.value = 0.0;
    this.dirLight.color.setHex(sunCol);
    this.dirLight.intensity = sunI;
    this.dirLight.position.set(22, 38, 22);
    this.hemiLight.color.setHex(hemiSky);
    this.hemiLight.groundColor.setHex(hemiGround);
    this.hemiLight.intensity = 1.25;
  }

  setSunset() {
    this.skyMat.uniforms.uTop.value.setHex(0x4a4e82);
    this.skyMat.uniforms.uHorizon.value.setHex(0xff8c66);
    this.skyMat.uniforms.uNight.value = 0.4;
    this.dirLight.color.setHex(0xff9f6a);
    this.dirLight.intensity = 1.6;
    this.dirLight.position.set(30, 15, 10);
    this.hemiLight.intensity = 1.1;
  }

  update(time) {}
}
