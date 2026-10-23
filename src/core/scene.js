import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, this.width / this.height, 0.3, 320);
    this.camera.position.set(22, 28, 44);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // CSS2D Renderer for HTML Labels
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.width, this.height);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    this.container.appendChild(this.labelRenderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(25);
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(72);
    this.controls.minDistance = 6;
    this.controls.maxDistance = 68;
    this.controls.target.set(0, 0, 0);

    // 相機飛行插值變數
    this.isFlying = false;
    this.flyStartTime = 0;
    this.flyDuration = 800;
    this.flyStartCam = new THREE.Vector3();
    this.flyEndCam = new THREE.Vector3();
    this.flyStartTarget = new THREE.Vector3();
    this.flyEndTarget = new THREE.Vector3();

    window.addEventListener("resize", () => this.onResize());
    this.renderer.domElement.addEventListener("pointerdown", () => {
      this.isFlying = false; // 使用者互動時立即中斷飛行
    });
  }

  flyTo(targetPos, offset = new THREE.Vector3(2.5, 6.0, 7.5)) {
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
      // easeInOutCubic
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
