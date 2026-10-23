import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { GRID, COLORS } from "../config/constants.js";

export function getIslandPos(island) {
  return { x: island.pos.x, z: island.pos.z };
}

export function createGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // 溫暖柔和的奶油陶土底色
  ctx.fillStyle = "#f2e5d4";
  ctx.fillRect(0, 0, 512, 512);

  // 微縮模型細膩肌理點
  ctx.fillStyle = "#e5d5c0";
  for (let i = 0; i < 900; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, 3, 3);
  }

  // 柔和石板格紋
  ctx.strokeStyle = "rgba(180, 155, 130, 0.28)";
  ctx.lineWidth = 2;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(512, x);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export function buildHexIslands(scene, islandDataList, onIslandClick) {
  const group = new THREE.Group();
  const groundTex = createGroundTexture();

  // 上層草地/陶土台面
  const hexGeo = new THREE.CylinderGeometry(GRID.R, GRID.R * 0.95, GRID.TOP * 0.65, 6);
  hexGeo.rotateY(Math.PI / 6);
  const topMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.85, metalness: 0.04 });

  // 下層深色岩土底座 (讓島嶼有立體微縮模型厚度層次)
  const baseGeo = new THREE.CylinderGeometry(GRID.R * 0.95, GRID.R * 0.82, GRID.TOP * 0.55, 6);
  baseGeo.rotateY(Math.PI / 6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x8c6d53, roughness: 0.9 });

  const islandMeshes = [];

  islandDataList.forEach((data) => {
    const { x, z } = getIslandPos(data);

    const mesh = new THREE.Mesh(hexGeo, topMat);
    mesh.position.set(x, GRID.TOP * 0.68, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.userData = { isIsland: true, data };
    group.add(mesh);
    islandMeshes.push(mesh);

    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(x, GRID.TOP * 0.15, z);
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 1. 寬敞的環島石板步道 (半徑 3.05 ~ 3.65)
    const walkGeo = new THREE.RingGeometry(3.05, 3.65, 6);
    walkGeo.rotateX(-Math.PI / 2);
    walkGeo.rotateY(Math.PI / 6);
    const walkMat = new THREE.MeshStandardMaterial({ color: COLORS.pathway, roughness: 0.85 });
    const walkway = new THREE.Mesh(walkGeo, walkMat);
    walkway.position.set(x, GRID.TOP + 0.005, z);
    walkway.receiveShadow = true;
    group.add(walkway);

    // 2. 島嶼中央木造與石板工作廣場
    const plazaGeo = new THREE.CircleGeometry(2.45, 24);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xe6d4c0, roughness: 0.8 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(x, GRID.TOP + 0.008, z);
    plaza.receiveShadow = true;
    group.add(plaza);

    // 3. 外緣立體路緣石
    const rimGeo = new THREE.RingGeometry(GRID.R - 0.18, GRID.R, 6);
    rimGeo.rotateX(-Math.PI / 2);
    rimGeo.rotateY(Math.PI / 6);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdfcfb7, roughness: 0.7 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(x, GRID.TOP + 0.01, z);
    group.add(rim);

    // 4. 島側工序識別色帶
    const bandGeo = new THREE.CylinderGeometry(GRID.R + 0.01, GRID.R + 0.01, 0.16, 6, 1, true);
    bandGeo.rotateY(Math.PI / 6);
    const bandMat = new THREE.MeshStandardMaterial({ color: data.cargoColor, roughness: 0.65, side: THREE.DoubleSide });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.set(x, GRID.TOP - 0.12, z);
    group.add(band);

    // 5. 海水柔和白泡環
    const foamGeo = new THREE.RingGeometry(GRID.R * 0.92, GRID.R + 0.38, 6);
    foamGeo.rotateX(-Math.PI / 2);
    foamGeo.rotateY(Math.PI / 6);
    const foamMat = new THREE.MeshBasicMaterial({ color: 0x88c9d8, transparent: true, opacity: 0.32 });
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.set(x, GRID.WATER_Y + 0.015, z);
    group.add(foam);

    // 6. 極簡 4 字深色毛玻璃小標籤 (浮在島嶼側前緣，完全不擋中間的工坊細節！)
    const pill = document.createElement("div");
    pill.className = "island-label-pill";
    pill.dataset.islandId = data.id;
    pill.innerHTML = `<span class="step-num">${data.num}</span>${data.shortName}`;
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onIslandClick) onIslandClick(data);
    });

    const c2dObj = new CSS2DObject(pill);
    c2dObj.position.set(x, GRID.TOP + 0.25, z + GRID.R * 0.88);
    group.add(c2dObj);
  });

  scene.add(group);
  return { islandGroup: group, islandMeshes };
}
