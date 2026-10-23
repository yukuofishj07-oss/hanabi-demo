import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { GRID } from "../config/constants.js";

export function axialToWorld(q, r) {
  const x = Math.sqrt(3) * GRID.SPACING * (q + r / 2);
  const z = 1.5 * GRID.SPACING * r;
  return { x, z };
}

export function createGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // 溫暖黏土陶土底色
  ctx.fillStyle = "#ebdccb";
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = "#dfd0bc";
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // 中心石板步道環紋
  ctx.strokeStyle = "rgba(180, 160, 140, 0.4)";
  ctx.lineWidth = 3;
  for (let x = 0; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  return texture;
}

export function buildHexIslands(scene, islandDataList, onIslandClick) {
  const group = new THREE.Group();
  const groundTex = createGroundTexture();

  const hexGeo = new THREE.CylinderGeometry(GRID.R, GRID.R, GRID.TOP, 6);
  hexGeo.rotateY(Math.PI / 6);

  const mat = new THREE.MeshStandardMaterial({
    map: groundTex,
    roughness: 0.9,
    metalness: 0.05
  });

  const islandMeshes = [];

  islandDataList.forEach((data) => {
    const { x, z } = axialToWorld(data.axial.q, data.axial.r);
    const mesh = new THREE.Mesh(hexGeo, mat);
    mesh.position.set(x, GRID.TOP / 2, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.userData = { isIsland: true, data };
    group.add(mesh);
    islandMeshes.push(mesh);

    // 1. 半徑 1.8 步道環 (淺磚色 #d8bda5)
    const walkGeo = new THREE.RingGeometry(1.52, 1.80, 6);
    walkGeo.rotateX(-Math.PI / 2);
    walkGeo.rotateY(Math.PI / 6);
    const walkMat = new THREE.MeshStandardMaterial({ color: 0xd8bda5, roughness: 0.85 });
    const walkway = new THREE.Mesh(walkGeo, walkMat);
    walkway.position.set(x, GRID.TOP + 0.003, z);
    walkway.receiveShadow = true;
    group.add(walkway);

    // 2. 外緣路緣裝飾環 (#e4d6c3)
    const rimGeo = new THREE.RingGeometry(GRID.R - 0.12, GRID.R, 6);
    rimGeo.rotateX(-Math.PI / 2);
    rimGeo.rotateY(Math.PI / 6);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xe4d6c3 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(x, GRID.TOP + 0.006, z);
    group.add(rim);

    // 3. 白色海水消波泡沫環
    const foamGeo = new THREE.RingGeometry(GRID.R + 0.06, GRID.R + 0.24, 6);
    foamGeo.rotateX(-Math.PI / 2);
    foamGeo.rotateY(Math.PI / 6);
    const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.set(x, GRID.WATER_Y + 0.01, z);
    group.add(foam);

    // CSS2D 膠囊標籤
    const pill = document.createElement("div");
    pill.className = "island-label-pill";
    pill.innerText = `${data.step} ${data.name.split(" ")[1] || data.name}`;
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onIslandClick) onIslandClick(data);
    });

    const c2dObj = new CSS2DObject(pill);
    c2dObj.position.set(x, GRID.TOP + 0.72, z + GRID.R * 0.72);
    group.add(c2dObj);
  });

  scene.add(group);
  return { islandGroup: group, islandMeshes };
}
