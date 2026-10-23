import * as THREE from "three";
import { axialToWorld } from "../island/grid.js";
import { GRID } from "../config/constants.js";

export class FlowLinesManager {
  constructor(scene, islandDataList, flowDefs) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.materials = [];

    const islandMap = {};
    islandDataList.forEach((isl) => {
      islandMap[isl.id] = isl;
    });

    flowDefs.forEach((def) => {
      const islA = islandMap[def.from];
      const islB = islandMap[def.to];
      if (!islA || !islB) return;

      const pA = axialToWorld(islA.axial.q, islA.axial.r);
      const pB = axialToWorld(islB.axial.q, islB.axial.r);

      const v1 = new THREE.Vector3(pA.x, GRID.TOP + 0.12, pA.z);
      const v2 = new THREE.Vector3(
        (pA.x + pB.x) / 2,
        GRID.TOP + 0.65,
        (pA.z + pB.z) / 2
      );
      const v3 = new THREE.Vector3(pB.x, GRID.TOP + 0.12, pB.z);

      const curve = new THREE.QuadraticBezierCurve3(v1, v2, v3);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.04, 6, false);

      const mat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(0xff8444) }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float flow = fract(vUv.x * 5.0 - uTime * 2.5);
            float pulse = smoothstep(0.1, 0.5, flow) * smoothstep(0.9, 0.5, flow);
            vec3 col = mix(uColor, vec3(1.0), pulse * 0.85);
            gl_FragColor = vec4(col, 0.85);
          }
        `
      });

      this.materials.push(mat);
      const mesh = new THREE.Mesh(tubeGeo, mat);
      this.group.add(mesh);
    });

    this.scene.add(this.group);
  }

  toggle(visible) {
    this.group.visible = visible;
  }

  update(time) {
    if (!this.group.visible) return;
    for (let i = 0; i < this.materials.length; i++) {
      this.materials[i].uniforms.uTime.value = time;
    }
  }
}
