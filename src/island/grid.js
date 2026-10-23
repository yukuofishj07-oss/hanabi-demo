import * as THREE from "three";
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

  ctx.fillStyle = "#ede0cc";
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = "#dfd0bc";
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillRect(rx, ry, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  return texture;
}

export function buildHexIslands(scene, islandDataList) {
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

    // 外緣路緣裝飾環
    const rimGeo = new THREE.RingGeometry(GRID.R - 0.12, GRID.R, 6);
    rimGeo.rotateX(-Math.PI / 2);
    rimGeo.rotateY(Math.PI / 6);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xe4d6c3 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(x, GRID.TOP + 0.005, z);
    group.add(rim);
  });

  scene.add(group);
  return { islandGroup: group, islandMeshes };
}
