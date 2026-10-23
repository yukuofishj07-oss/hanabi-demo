import * as THREE from "three";
import { axialToWorld } from "../island/grid.js";
import { GRID, COLORS } from "../config/constants.js";

export function buildAllBuildings(scene, islandDataList) {
  const group = new THREE.Group();

  // 共用材質 (溫暖黏土高質感，杜絕黑剪影)
  const wallMat = new THREE.MeshStandardMaterial({ color: COLORS.wall, roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({ color: COLORS.roof, roughness: 0.65 });
  const woodMat = new THREE.MeshStandardMaterial({ color: COLORS.wood, roughness: 0.75 });
  const drumMat = new THREE.MeshStandardMaterial({ color: COLORS.drum, roughness: 0.5 });
  const steelMat = new THREE.MeshStandardMaterial({ color: COLORS.steel, roughness: 0.45, metalness: 0.3 });
  const pineMat = new THREE.MeshStandardMaterial({ color: COLORS.pine, roughness: 0.85 });
  const cherryMat = new THREE.MeshStandardMaterial({ color: COLORS.cherry, roughness: 0.8 });
  const lampMat = new THREE.MeshStandardMaterial({ color: COLORS.lampPost, roughness: 0.6 });
  const glowMat = new THREE.MeshStandardMaterial({ color: COLORS.lightGlow, emissive: 0xffe066, emissiveIntensity: 1.5 });

  islandDataList.forEach((island, islandIdx) => {
    const { x: ix, z: iz } = axialToWorld(island.axial.q, island.axial.r);
    const by = GRID.TOP;

    // 1. 各島特色黏土工坊
    switch (island.step) {
      case "01": // 黑火藥配研室：雙圓形研磨槽 + 研磨主樓
        const millBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.48, 0.35, 16), wallMat);
        millBase.position.set(ix - 0.35, by + 0.18, iz - 0.25);
        millBase.castShadow = true;
        group.add(millBase);

        const pestle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.55, 12), woodMat);
        pestle.position.set(ix - 0.35, by + 0.38, iz - 0.25);
        pestle.rotation.z = 0.2;
        group.add(pestle);

        const vat = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.45, 16), roofMat);
        vat.position.set(ix + 0.38, by + 0.23, iz - 0.25);
        vat.castShadow = true;
        group.add(vat);
        break;

      case "03": // 星珠造粒廠：斜向金黃色旋轉造粒滾筒
        const drumStand = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.45), woodMat);
        drumStand.position.set(ix, by + 0.18, iz - 0.25);
        drumStand.castShadow = true;
        group.add(drumStand);

        const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.65, 16), drumMat);
        drum.position.set(ix, by + 0.45, iz - 0.25);
        drum.rotation.z = Math.PI / 4;
        drum.castShadow = true;
        group.add(drum);
        break;

      case "04": // 陽光乾燥棚：階梯狀木造竹篩曬架
        for (let s = 0; s < 3; s++) {
          const rack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.28), woodMat);
          rack.position.set(ix, by + 0.15 + s * 0.16, iz - 0.45 + s * 0.22);
          rack.castShadow = true;
          group.add(rack);
        }
        break;

      case "10": // 迫擊鋼砲盛典陣地：4門整齊排列的合金迫擊砲管
        const bunker = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.7), wallMat);
        bunker.position.set(ix, by + 0.11, iz - 0.25);
        bunker.castShadow = true;
        group.add(bunker);

        for (let m = 0; m < 4; m++) {
          const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.85, 16), steelMat);
          mortar.position.set(ix + (m - 1.5) * 0.32, by + 0.46, iz - 0.25);
          mortar.rotation.x = 0.14;
          mortar.castShadow = true;
          group.add(mortar);
        }
        break;

      default: // 典雅四坡屋頂黏土小屋
        const house = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.7), wallMat);
        house.position.set(ix, by + 0.28, iz - 0.25);
        house.castShadow = true;
        group.add(house);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.45, 4), roofMat);
        roof.position.set(ix, by + 0.75, iz - 0.25);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);
        break;
    }

    // 2. 美化：精緻微縮針葉松 (多層圓錐疊加，不再是小黑木樁)
    const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.32, 8), woodMat);
    trunk1.position.set(ix - 1.15, by + 0.16, iz - 0.65);
    trunk1.castShadow = true;
    group.add(trunk1);

    const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.52, 8), pineMat);
    foliage1.position.set(ix - 1.15, by + 0.48, iz - 0.65);
    foliage1.castShadow = true;
    group.add(foliage1);

    const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 8), pineMat);
    foliage2.position.set(ix - 1.15, by + 0.72, iz - 0.65);
    foliage2.castShadow = true;
    group.add(foliage2);

    // 3. 美化：櫻花粉闊葉樹（微縮公仔圓球造型）
    if (islandIdx % 2 === 0) {
      const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.32, 8), woodMat);
      trunk2.position.set(ix + 1.15, by + 0.16, iz - 0.55);
      trunk2.castShadow = true;
      group.add(trunk2);

      const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), cherryMat);
      cherry.position.set(ix + 1.15, by + 0.48, iz - 0.55);
      cherry.castShadow = true;
      group.add(cherry);
    } else {
      // 綠色圓球灌木
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), pineMat);
      bush.position.set(ix + 1.15, by + 0.22, iz - 0.55);
      bush.castShadow = true;
      group.add(bush);
    }

    // 4. 美化：島上休閒木造長椅
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.10, 0.14), woodMat);
    bench.position.set(ix - 0.85, by + 0.08, iz + 0.85);
    bench.rotation.y = Math.PI / 4;
    bench.castShadow = true;
    group.add(bench);

    // 5. 美化：微縮暖光路燈
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.62, 8), lampMat);
    lampPost.position.set(ix + 0.95, by + 0.31, iz + 0.85);
    lampPost.castShadow = true;
    group.add(lampPost);

    const lampLight = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), glowMat);
    lampLight.position.set(ix + 0.95, by + 0.64, iz + 0.85);
    group.add(lampLight);
  });

  scene.add(group);
}
