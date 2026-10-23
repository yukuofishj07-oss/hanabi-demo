import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    // 視角設為 38 度，兼顧微縮模型質感與高空煙火視野
    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.5, 400);
    // 預設最佳觀賞點：正對 4-4-2 島鏈，視線中心抬高至 y = 3.5，讓島嶼在下半部、煙火在上半部完美同框！
    this.camera.position.set(0, 22, 38);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
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
    this.controls.enablePan = true;
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(15);
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(78);
    this.controls.minDistance = 6;
    this.controls.maxDistance = 85;
    // 目標中心設在 (0, 3.2, 0)，如此一來高度 8~13 的煙火剛好在畫面正上方！
    this.controls.target.set(0, 3.2, 0);

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

  flyTo(targetPos, offset = new THREE.Vector3(2.8, 5.2, 8.5)) {
    this.flyStartCam.copy(this.camera.position);
    this.flyStartTarget.copy(this.controls.target);

    this.flyEndTarget.copy(targetPos);
    this.flyEndCam.copy(targetPos).add(offset);

    this.flyStartTime = performance.now();
    this.isFlying = true;
  }

  resetOverview() {
    this.flyTo(new THREE.Vector3(0, 3.2, 0), new THREE.Vector3(0, 18.8, 38));
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
