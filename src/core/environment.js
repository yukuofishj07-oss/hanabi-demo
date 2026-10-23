import * as THREE from "three";
import { GRID } from "../config/constants.js";

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.clouds = [];

    this.hemiLight = new THREE.HemisphereLight(0x98a8dc, 0x685a6e, 1.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xc0ccff, 1.2);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 85;
    this.dirLight.shadow.camera.left = -26;
    this.dirLight.shadow.camera.right = 26;
    this.dirLight.shadow.camera.top = 26;
    this.dirLight.shadow.camera.bottom = -26;
    this.dirLight.shadow.bias = -0.0006;
    this.dirLight.shadow.normalBias = 0.04;
    this.scene.add(this.dirLight);

    this.createSky();
    this.createWater();
    this.createClouds();
    this.createSurroundingHills();
    this.setNight();
  }

  createSky() {
    const geo = new THREE.SphereGeometry(150, 24, 16);
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x0c152a) },     // 純淨深藍夜空，突顯璀璨煙火
        uHorizon: { value: new THREE.Color(0x1a233c) },
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

          if (uNight > 0.3 && dir.y > 0.05) {
            float star = step(0.9965, hash(floor(dir * 180.0)));
            col += star * 0.8 * uNight;
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(geo, this.skyMat);
    this.scene.add(sky);
  }

  createWater() {
    const geo = new THREE.CircleGeometry(120, 48);
    this.waterMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uDeepColor: { value: new THREE.Color(0x1a3348) },
        uShallowColor: { value: new THREE.Color(0x427588) }
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
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        varying vec3 vWorldPos;

        void main() {
          float dist = length(vWorldPos.xz);
          float wave = sin(dist * 1.8 - uTime * 2.0) * 0.5 + 0.5;
          vec3 col = mix(uShallowColor, uDeepColor, smoothstep(2.0, 30.0, dist));
          col += wave * 0.08;
          gl_FragColor = vec4(col, 0.90);
        }
      `
    });

    const water = new THREE.Mesh(geo, this.waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = GRID.WATER_Y;
    water.receiveShadow = true;
    this.scene.add(water);
  }

  createClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.8
    });

    for (let c = 0; c < 6; c++) {
      const cloud = new THREE.Group();
      const numPuffs = 4;
      for (let p = 0; p < numPuffs; p++) {
        const r = 1.0 + Math.random() * 0.8;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), cloudMat);
        puff.position.set((p - numPuffs / 2) * 1.2, 0, (Math.random() - 0.5) * 0.6);
        cloud.add(puff);
      }
      cloud.position.set(
        (Math.random() - 0.5) * 60,
        14 + Math.random() * 5,
        (Math.random() - 0.5) * 60
      );
      cloud.userData = { speed: 0.015 + Math.random() * 0.015 };
      this.clouds.push(cloud);
      this.scene.add(cloud);
    }
  }

  createSurroundingHills() {
    const hillGeo = new THREE.CylinderGeometry(40, 46, 3.5, 24, 1, true);
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x8a9a7a,
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
      this.setDay(0xfff1de, 0xeef6fa, 0x8f8270, 2.6);
    } else {
      this.setSunset();
    }
  }

  setNight() {
    this.skyMat.uniforms.uTop.value.setHex(0x0c152a);
    this.skyMat.uniforms.uHorizon.value.setHex(0x1a233c);
    this.skyMat.uniforms.uNight.value = 1.0;
    this.dirLight.color.setHex(0xc0ccff);
    this.dirLight.intensity = 0.7;
    this.dirLight.position.set(-10, 25, -10);
    this.hemiLight.color.setHex(0x98a8dc);
    this.hemiLight.groundColor.setHex(0x685a6e);
    this.hemiLight.intensity = 1.35;
  }

  setDay(sunCol, hemiSky, hemiGround, sunI) {
    this.skyMat.uniforms.uTop.value.setHex(0x9fd0ec);
    this.skyMat.uniforms.uHorizon.value.setHex(0xf4eee3);
    this.skyMat.uniforms.uNight.value = 0.0;
    this.dirLight.color.setHex(sunCol);
    this.dirLight.intensity = sunI;
    this.dirLight.position.set(20, 38, 20);
    this.hemiLight.color.setHex(hemiSky);
    this.hemiLight.groundColor.setHex(hemiGround);
    this.hemiLight.intensity = 1.25;
  }

  setSunset() {
    this.skyMat.uniforms.uTop.value.setHex(0x5a5e9e);
    this.skyMat.uniforms.uHorizon.value.setHex(0xff9a7a);
    this.skyMat.uniforms.uNight.value = 0.4;
    this.dirLight.color.setHex(0xff9f6a);
    this.dirLight.intensity = 1.5;
    this.dirLight.position.set(30, 15, 10);
    this.hemiLight.intensity = 1.0;
  }

  update(time) {
    if (this.waterMat) this.waterMat.uniforms.uTime.value = time;
    this.clouds.forEach((cloud) => {
      cloud.position.x += cloud.userData.speed;
      if (cloud.position.x > 45) cloud.position.x = -45;
    });
  }
}
