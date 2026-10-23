import * as THREE from "three";
import { axialToWorld } from "../island/grid.js";
import { GRID, COLORS } from "../config/constants.js";

export function buildAllBuildings(scene, kit, islandDataList) {
  const dummy = new THREE.Object3D();

  islandDataList.forEach((island, islandIdx) => {
    const { x: ix, z: iz } = axialToWorld(island.axial.q, island.axial.r);

    // 1. 各島代表性核心工坊設備
    island.items.forEach((item, idx) => {
      const offsetX = (idx === 0 ? -0.42 : 0.42);
      const offsetZ = -0.32;
      const bx = ix + offsetX;
      const bz = iz + offsetZ;
      const by = GRID.TOP;

      switch (item.model) {
        case "vat":
          dummy.scale.set(0.65, 0.52, 0.65);
          dummy.position.set(bx, by + 0.26, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("cylinder", dummy.matrix, COLORS.teal);
          break;

        case "kiln":
          dummy.scale.set(0.60, 0.62, 0.60);
          dummy.position.set(bx, by + 0.31, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("rbox", dummy.matrix, COLORS.coral);
          break;

        case "drum":
          dummy.scale.set(0.70, 0.45, 0.45);
          dummy.position.set(bx, by + 0.28, bz);
          dummy.rotation.set(0, 0, Math.PI / 4);
          dummy.updateMatrix();
          kit.push("cylinder", dummy.matrix, COLORS.gold);
          break;

        case "mortar":
          // 發射迫擊砲群 (呈梯次排布，口徑向天空)
          for (let m = 0; m < 4; m++) {
            dummy.scale.set(0.18, 0.88, 0.18);
            dummy.position.set(bx + (m - 1.5) * 0.26, by + 0.44, bz);
            dummy.rotation.set(0.12, 0, 0);
            dummy.updateMatrix();
            kit.push("cylinder", dummy.matrix, COLORS.ink);
          }
          break;

        case "tower":
          dummy.scale.set(0.55, 1.1, 0.55);
          dummy.position.set(bx, by + 0.55, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("rbox", dummy.matrix, COLORS.wood);
          break;

        default:
          dummy.scale.set(0.52, 0.60, 0.52);
          dummy.position.set(bx, by + 0.30, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("rbox", dummy.matrix, COLORS.stone);
          break;
      }
    });

    // 2. 美化：茂盛微縮黏土松樹 (針葉松：2層錐體)
    dummy.scale.set(0.42, 0.45, 0.42);
    dummy.position.set(ix - 1.15, GRID.TOP + 0.22, iz - 0.7);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    kit.push("cone", dummy.matrix, COLORS.green);

    dummy.scale.set(0.32, 0.38, 0.32);
    dummy.position.set(ix - 1.15, GRID.TOP + 0.45, iz - 0.7);
    dummy.updateMatrix();
    kit.push("cone", dummy.matrix, COLORS.green);

    // 樹幹
    dummy.scale.set(0.10, 0.25, 0.10);
    dummy.position.set(ix - 1.15, GRID.TOP + 0.12, iz - 0.7);
    dummy.updateMatrix();
    kit.push("cylinder", dummy.matrix, COLORS.wood);

    // 3. 美化：櫻花粉闊葉樹 (櫻花微縮公仔感)
    if (islandIdx % 2 === 0) {
      dummy.scale.set(0.38, 0.38, 0.38);
      dummy.position.set(ix + 1.18, GRID.TOP + 0.38, iz - 0.6);
      dummy.updateMatrix();
      kit.push("sphere", dummy.matrix, COLORS.cherry);

      dummy.scale.set(0.09, 0.32, 0.09);
      dummy.position.set(ix + 1.18, GRID.TOP + 0.16, iz - 0.6);
      dummy.updateMatrix();
      kit.push("cylinder", dummy.matrix, COLORS.wood);
    } else {
      // 圓球綠植灌木
      dummy.scale.set(0.32, 0.32, 0.32);
      dummy.position.set(ix + 1.18, GRID.TOP + 0.22, iz - 0.6);
      dummy.updateMatrix();
      kit.push("sphere", dummy.matrix, COLORS.green);
    }

    // 4. 美化：島上休閒木造長椅
    dummy.scale.set(0.38, 0.10, 0.14);
    dummy.position.set(ix - 0.85, GRID.TOP + 0.08, iz + 0.85);
    dummy.rotation.set(0, Math.PI / 4, 0);
    dummy.updateMatrix();
    kit.push("rbox", dummy.matrix, COLORS.wood);

    // 5. 美化：微縮暖光路燈
    dummy.scale.set(0.06, 0.58, 0.06);
    dummy.position.set(ix + 0.95, GRID.TOP + 0.29, iz + 0.85);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    kit.push("cylinder", dummy.matrix, COLORS.ink);

    // 燈罩
    dummy.scale.set(0.16, 0.10, 0.16);
    dummy.position.set(ix + 0.95, GRID.TOP + 0.58, iz + 0.85);
    dummy.updateMatrix();
    kit.push("cone", dummy.matrix, COLORS.yellow);
  });

  kit.build(scene);
}
