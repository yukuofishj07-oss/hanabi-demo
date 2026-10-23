import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { WORLD, PALETTE } from "../config/constants.js";

function createBadgeTexture(iconType) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.arc(64, 64, 54, 0, Math.PI * 2);
  ctx.fillStyle = "#fff8f4";
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#db6a41";
  ctx.stroke();

  ctx.strokeStyle = "#211d1d";
  ctx.fillStyle = "#211d1d";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (iconType === "barrel") {
    ctx.strokeRect(42, 36, 44, 56);
    ctx.beginPath();
    ctx.moveTo(42, 54); ctx.lineTo(86, 54);
    ctx.moveTo(42, 74); ctx.lineTo(86, 74);
    ctx.stroke();
  } else if (iconType === "flask") {
    ctx.beginPath();
    ctx.moveTo(56, 36); ctx.lineTo(72, 36);
    ctx.moveTo(60, 36); ctx.lineTo(40, 88); ctx.lineTo(88, 88); ctx.lineTo(68, 36);
    ctx.stroke();
  } else if (iconType === "orb" || iconType === "shell") {
    ctx.beginPath();
    ctx.arc(64, 64, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(64, 64, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconType === "rocket") {
    ctx.beginPath();
    ctx.moveTo(64, 32);
    ctx.lineTo(82, 76);
    ctx.lineTo(46, 76);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.strokeRect(38, 44, 52, 42);
    ctx.beginPath();
    ctx.moveTo(38, 58); ctx.lineTo(90, 58);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

export class WalkersAndFlowsManager {
  constructor(scene, flowsData, islandsBuilder, onLogEvent) {
    this.scene = scene;
    this.flowsData = flowsData;
    this.islandsBuilder = islandsBuilder;
    this.onLogEvent = onLogEvent;

    this.flowMeshes = [];
    this.flowMaterials = [];
    this.walkers = [];
    this.walkerPickMeshes = [];

    // 預設關閉文字名牌，避免滿畫面黑字！
    this.showBadges = false;
    this.showCargo = true;
    this.showFlows = true;

    this.buildFlowsAndWalkers();
  }

  createChibiWalkerMesh(role, flow) {
    const S = WORLD.WALKER_SCALE;
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.78 });
    const inkMat = new THREE.MeshBasicMaterial({ color: PALETTE.ink });

    const roleColors = {
      worker: PALETTE.coral,
      researcher: PALETTE.cream,
      farmer: PALETTE.foliage2,
      official: PALETTE.teal,
      cyclist: PALETTE.yellow,
      traveler: PALETTE.pastelBlue
    };
    const suitMat = new THREE.MeshStandardMaterial({ color: roleColors[role] || PALETTE.coral, roughness: 0.78 });
    const legMat = new THREE.MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.85 });

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.18 * S, 12),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    group.add(shadow);

    const legGeo = new THREE.CylinderGeometry(0.038 * S, 0.035 * S, 0.14 * S, 8);
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.05 * S, 0.07 * S, 0);
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.05 * S, 0.07 * S, 0);
    group.add(legL, legR);

    const armGeo = new THREE.CylinderGeometry(0.032 * S, 0.03 * S, 0.14 * S, 8);
    const armL = new THREE.Mesh(armGeo, suitMat);
    armL.position.set(-0.11 * S, 0.21 * S, 0);
    const armR = new THREE.Mesh(armGeo, suitMat);
    armR.position.set(0.11 * S, 0.21 * S, 0);
    group.add(armL, armR);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * S, 0.095 * S, 0.16 * S, 10), suitMat);
    body.position.y = 0.20 * S;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.115 * S, 14, 12), skinMat);
    head.position.y = 0.36 * S;
    head.castShadow = true;
    group.add(head);

    const eyeGeo = new THREE.SphereGeometry(0.016 * S, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeo, inkMat);
    eyeL.position.set(-0.04 * S, 0.37 * S, 0.105 * S);
    const eyeR = new THREE.Mesh(eyeGeo, inkMat);
    eyeR.position.set(0.04 * S, 0.37 * S, 0.105 * S);
    group.add(eyeL, eyeR);

    const hatMat = new THREE.MeshStandardMaterial({ color: role === "farmer" ? PALETTE.wood : PALETTE.yellow, roughness: 0.65 });
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.13 * S, 0.08 * S, 10), hatMat);
    hat.position.y = 0.46 * S;
    group.add(hat);

    const badgeSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: createBadgeTexture(flow.icon), transparent: true })
    );
    badgeSprite.position.set(0, 0.68 * S, 0);
    badgeSprite.scale.set(0.28 * S, 0.28 * S, 1);
    group.add(badgeSprite);

    const speechDiv = document.createElement("div");
    speechDiv.className = "walker-speech-tag";
    speechDiv.innerText = flow.cargo;
    speechDiv.style.display = "none";
    const speechObj = new CSS2DObject(speechDiv);
    speechObj.position.set(0, 0.88 * S, 0);
    group.add(speechObj);

    group.userData = { legL, legR, armL, armR, badgeSprite, speechDiv, type: "walker", flow };
    return group;
  }

  buildFlowsAndWalkers() {
    this.flowsData.forEach((flow, fIdx) => {
      const pathNodes = this.islandsBuilder.findShortestPath(flow.from, flow.to);
      if (!pathNodes || pathNodes.length < 2) return;

      const curvePoints = pathNodes.map((n) => new THREE.Vector3(n.x, WORLD.TOP + 0.08, n.z));
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const totalLen = curve.getLength();

      const modeInt = flow.level === "official" ? 0 : (flow.level === "thematic" ? 1 : 2);
      const tubeGeo = new THREE.TubeGeometry(curve, 96, 0.085, 8, false);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uLen: { value: totalLen },
          uMode: { value: modeInt },
          uColor: { value: new THREE.Color(PALETTE.coral) }
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
          uniform float uLen;
          uniform int uMode;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float u = vUv.x * uLen * 0.55 - uTime * 1.4;
            float f = fract(u);
            if (uMode == 1 && f > 0.6) discard;
            if (uMode == 2 && f > 0.3) discard;
            float pulse = 0.75 + 0.25 * sin(u * 6.283);
            gl_FragColor = vec4(uColor * pulse, 0.84);
          }
        `
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, mat);
      tubeMesh.userData = { type: "flow", flow };
      this.scene.add(tubeMesh);
      this.flowMeshes.push(tubeMesh);
      this.flowMaterials.push(mat);

      // 每座島（每條路線）嚴格只配 2 位職人小人！
      for (let w = 0; w < 2; w++) {
        const mesh = this.createChibiWalkerMesh(flow.role, flow);
        this.scene.add(mesh);
        this.walkerPickMeshes.push(mesh);

        this.walkers.push({
          mesh,
          flow,
          curve,
          totalLen,
          t: w === 0 ? 0.22 : 0.72,
          dir: w === 0 ? 1 : -1,
          speed: (flow.role === "cyclist" ? 2.8 : 1.75) + (w * 0.15),
          waitTimer: 0,
          phase: fIdx * 3.1 + w * 2.5
        });
      }
    });
  }

  setSwitches({ badges, cargo, flows }) {
    if (badges !== undefined) this.showBadges = badges;
    if (cargo !== undefined) this.showCargo = cargo;
    if (flows !== undefined) {
      this.showFlows = flows;
      this.flowMeshes.forEach((m) => { m.visible = flows; });
    }
  }

  highlightRelatedFlows(selectedIslandId, selectedFlowId) {
    this.flowMeshes.forEach((m) => {
      const f = m.userData.flow;
      if (this.showFlows) {
        m.visible = true;
      } else {
        m.visible = (f.id === selectedFlowId) || (f.from === selectedIslandId) || (f.to === selectedIslandId);
      }
    });
  }

  update(elapsedTime, dt, cameraPos) {
    this.flowMaterials.forEach((m) => {
      m.uniforms.uTime.value = elapsedTime;
    });

    const pos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();

    this.walkers.forEach((w) => {
      const ud = w.mesh.userData;
      const distToCam = cameraPos.distanceTo(w.mesh.position);

      const distScale = THREE.MathUtils.clamp(distToCam / 65, 1.0, 1.3);
      w.mesh.scale.setScalar(WORLD.WALKER_SCALE * distScale);

      ud.badgeSprite.visible = this.showCargo && (distToCam < 85);
      ud.speechDiv.style.display = (this.showBadges && distToCam < 45) ? "block" : "none";

      if (w.waitTimer > 0) {
        w.waitTimer -= dt;
        ud.legL.rotation.x = 0;
        ud.legR.rotation.x = 0;
        ud.armL.rotation.x = 0;
        ud.armR.rotation.x = 0;
        return;
      }

      w.t += (w.speed * dt * w.dir) / Math.max(w.totalLen, 1);

      if (w.t >= 0.98) {
        w.t = 0.98;
        w.dir = -1;
        w.waitTimer = 1.4;
        if (this.onLogEvent) this.onLogEvent("handoff", w.flow);
      } else if (w.t <= 0.02) {
        w.t = 0.02;
        w.dir = 1;
        w.waitTimer = 1.4;
        if (this.onLogEvent) this.onLogEvent("depart", w.flow);
      }

      w.curve.getPointAt(w.t, pos);
      const nextT = THREE.MathUtils.clamp(w.t + w.dir * 0.02, 0, 1);
      w.curve.getPointAt(nextT, lookTarget);

      const ph = elapsedTime * 9.0 + w.phase * 20.0;
      const hop = Math.abs(Math.sin(ph)) * 0.04;

      w.mesh.position.set(pos.x, pos.y + hop, pos.z);
      w.mesh.lookAt(lookTarget.x, w.mesh.position.y, lookTarget.z);

      ud.legL.rotation.x = Math.sin(ph) * 0.55;
      ud.legR.rotation.x = -Math.sin(ph) * 0.55;
      ud.armL.rotation.x = -Math.sin(ph) * 0.45;
      ud.armR.rotation.x = Math.sin(ph) * 0.45;
    });
  }
}
