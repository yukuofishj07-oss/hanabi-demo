import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { GRID, COLORS } from "../config/constants.js";

export function getIslandPos(island) {
  return { x: island.pos.x, z: island.pos.z };
}

export function createGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // 溫暖米白陶土底色
  ctx.fillStyle = "#efe2d0";
  ctx.fillRect(0, 0, 256, 256);

  // 細膩黏土顆粒
  ctx.fillStyle = "#e2d3be";
  for (let i = 0; i < 360; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // 十字石板磚縫
  ctx.strokeStyle = "rgba(175, 152, 130, 0.35)";
  ctx.lineWidth = 2;
  for (let x = 0; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(256, x);
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

  const hexGeo = new THREE.CylinderGeometry(GRID.R, GRID.R * 0.96, GRID.TOP, 6);
  hexGeo.rotateY(Math.PI / 6);

  const mat = new THREE.MeshStandardMaterial({
    map: groundTex,
    roughness: 0.85,
    metalness: 0.04
  });

  const islandMeshes = [];

  islandDataList.forEach((data, idx) => {
    const { x, z } = getIslandPos(data);
    const mesh = new THREE.Mesh(hexGeo, mat);
    mesh.position.set(x, GRID.TOP / 2, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.userData = { isIsland: true, data };
    group.add(mesh);
    islandMeshes.push(mesh);

    // 1. 寬敞的淺磚色環島步道 (半徑 2.05 ~ 2.48)
    const walkGeo = new THREE.RingGeometry(2.05, 2.48, 6);
    walkGeo.rotateX(-Math.PI / 2);
    walkGeo.rotateY(Math.PI / 6);
    const walkMat = new THREE.MeshStandardMaterial({ color: COLORS.pathway, roughness: 0.85 });
    const walkway = new THREE.Mesh(walkGeo, walkMat);
    walkway.position.set(x, GRID.TOP + 0.004, z);
    walkway.receiveShadow = true;
    group.add(walkway);

    // 2. 島嶼中央圓形工作廣場石板
    const plazaGeo = new THREE.CircleGeometry(1.55, 24);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xe5d5c3, roughness: 0.8 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(x, GRID.TOP + 0.005, z);
    plaza.receiveShadow = true;
    group.add(plaza);

    // 3. 外緣立體路緣石 (#dfcfb7)
    const rimGeo = new THREE.RingGeometry(GRID.R - 0.14, GRID.R, 6);
    rimGeo.rotateX(-Math.PI / 2);
    rimGeo.rotateY(Math.PI / 6);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdfcfb7, roughness: 0.7 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(x, GRID.TOP + 0.008, z);
    group.add(rim);

    // 4. 島側頂緣赤陶色裝飾腰帶
    const bandGeo = new THREE.CylinderGeometry(GRID.R + 0.01, GRID.R + 0.01, 0.14, 6, 1, true);
    bandGeo.rotateY(Math.PI / 6);
    const bandMat = new THREE.MeshStandardMaterial({ color: data.cargoColor, roughness: 0.7, side: THREE.DoubleSide });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.set(x, GRID.TOP - 0.10, z);
    group.add(band);

    // 5. 淺水環與白色浪花泡沫環
    const foamGeo = new THREE.RingGeometry(GRID.R + 0.08, GRID.R + 0.30, 6);
    foamGeo.rotateX(-Math.PI / 2);
    foamGeo.rotateY(Math.PI / 6);
    const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.set(x, GRID.WATER_Y + 0.01, z);
    group.add(foam);

    // CSS2D 膠囊標籤 (掛在島嶼前緣)
    const pill = document.createElement("div");
    pill.className = "island-label-pill";
    pill.innerText = data.name;
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onIslandClick) onIslandClick(data);
    });

    const c2dObj = new CSS2DObject(pill);
    c2dObj.position.set(x, GRID.TOP + 0.35, z + GRID.R * 0.86);
    group.add(c2dObj);
  });

  scene.add(group);
  return { islandGroup: group, islandMeshes };
}
