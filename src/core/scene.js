import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    // 加上柔和夜空深藍紫環境霧氣，創造「近清遠濛」的微縮景深感 (Diorama Depth)
    this.scene.fog = new THREE.FogExp2(0x0b1528, 0.0085);

    // 窄視角 30 度長焦鏡頭，徹底消除廣角變形，呈現純正微縮模型攝影質感
    this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 0.5, 450);
    // 開場預設聚焦於前段島嶼 (方案 A 微距斜視角)
    this.camera.position.set(-18, 12.5, 16);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;
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
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = true;
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(18);
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(76);
    this.controls.minDistance = 7;
    this.controls.maxDistance = 95;
    this.controls.target.set(-8, 1.8, -4);

    this.isFlying = false;
    this.flyStartTime = 0;
    this.flyDuration = 1100;
    this.flyStartCam = new THREE.Vector3();
    this.flyEndCam = new THREE.Vector3();
    this.flyStartTarget = new THREE.Vector3();
    this.flyEndTarget = new THREE.Vector3();

    window.addEventListener("resize", () => this.onResize());
  }

  // 飛往指定島嶼的微距特寫斜視角 (同時能看到後方夜空煙火)
  flyToIsland(targetPos) {
    this.flyTo(
      new THREE.Vector3(targetPos.x, 1.6, targetPos.z),
      new THREE.Vector3(4.5, 6.2, 13.5),
      1100
    );
  }

  flyTo(targetPos, offset = new THREE.Vector3(4.5, 6.2, 13.5), duration = 1000) {
    this.flyStartCam.copy(this.camera.position);
    this.flyStartTarget.copy(this.controls.target);

    this.flyEndTarget.copy(targetPos);
    this.flyEndCam.copy(targetPos).add(offset);

    this.flyDuration = duration;
    this.flyStartTime = performance.now();
    this.isFlying = true;
  }

  // 全景俯瞰視角
  setOverview() {
    this.flyTo(new THREE.Vector3(0, 2.5, 0), new THREE.Vector3(0, 32, 54), 1200);
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
      // 絲滑 easeInOutCubic
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
