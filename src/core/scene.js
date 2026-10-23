import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    // 窄視角 32 度微縮玩具模型視角
    this.camera = new THREE.PerspectiveCamera(32, this.width / this.height, 0.3, 350);
    // 預設將相機擺在正面偏上方，完全包覆 S 型工藝島與上方夜空
    this.camera.position.set(0, 26, 44);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.width, this.height);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.left = "0px";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    this.container.appendChild(this.labelRenderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(20);
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(72);
    this.controls.minDistance = 6;
    this.controls.maxDistance = 75;
    this.controls.target.set(0, 0, 0);

    this.isFlying = false;
    this.flyStartTime = 0;
    this.flyDuration = 750;
    this.flyStartCam = new THREE.Vector3();
    this.flyEndCam = new THREE.Vector3();
    this.flyStartTarget = new THREE.Vector3();
    this.flyEndTarget = new THREE.Vector3();

    window.addEventListener("resize", () => this.onResize());
    this.renderer.domElement.addEventListener("pointerdown", () => {
      this.isFlying = false;
    });
  }

  flyTo(targetPos, offset = new THREE.Vector3(2.5, 5.8, 7.2)) {
    this.flyStartCam.copy(this.camera.position);
    this.flyStartTarget.copy(this.controls.target);

    this.flyEndTarget.copy(targetPos);
    this.flyEndCam.copy(targetPos).add(offset);

    this.flyStartTime = performance.now();
    this.isFlying = true;
  }

  setTopdownView() {
    this.flyTo(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.01, 38, 4));
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.labelRenderer.setSize(this.width, this.height);
  }

  update() {
    if (this.isFlying) {
      const elapsed = performance.now() - this.flyStartTime;
      const progress = Math.min(elapsed / this.flyDuration, 1.0);
      const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(this.flyStartCam, this.flyEndCam, t);
      this.controls.target.lerpVectors(this.flyStartTarget, this.flyEndTarget, t);

      if (progress >= 1.0) {
        this.isFlying = false;
      }
    }
    this.controls.update();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
}
