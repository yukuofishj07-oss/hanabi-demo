import * as THREE from "three";
import { axialToWorld } from "../island/grid.js";
import { GRID, COLORS } from "../config/constants.js";

export function buildAllBuildings(scene, kit, islandDataList) {
  const dummy = new THREE.Object3D();

  islandDataList.forEach((island) => {
    const { x: ix, z: iz } = axialToWorld(island.axial.q, island.axial.r);

    // 主工坊建物
    island.items.forEach((item, idx) => {
      const offsetX = (idx === 0 ? -0.45 : 0.45);
      const offsetZ = -0.28;
      const bx = ix + offsetX;
      const bz = iz + offsetZ;
      const by = GRID.TOP;

      switch (item.model) {
        case "vat":
          dummy.scale.set(0.68, 0.55, 0.68);
          dummy.position.set(bx, by + 0.27, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("cylinder", dummy.matrix, COLORS.teal);
          break;

        case "kiln":
          dummy.scale.set(0.62, 0.65, 0.62);
          dummy.position.set(bx, by + 0.32, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("rbox", dummy.matrix, COLORS.coral);
          break;

        case "drum":
          dummy.scale.set(0.72, 0.48, 0.48);
          dummy.position.set(bx, by + 0.28, bz);
          dummy.rotation.set(0, 0, Math.PI / 4);
          dummy.updateMatrix();
          kit.push("cylinder", dummy.matrix, COLORS.gold);
          break;

        case "mortar":
        case "mortar_multi":
          // 金屬發射迫擊砲管陣列
          for (let m = 0; m < 3; m++) {
            dummy.scale.set(0.18, 0.85, 0.18);
            dummy.position.set(bx + (m - 1) * 0.28, by + 0.42, bz);
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
          dummy.scale.set(0.52, 0.62, 0.52);
          dummy.position.set(bx, by + 0.31, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("rbox", dummy.matrix, COLORS.stone);
          break;
      }
    });

    // 街道微縮路燈（夜晚照亮微縮地表）
    dummy.scale.set(0.06, 0.55, 0.06);
    dummy.position.set(ix + 1.2, GRID.TOP + 0.27, iz + 0.9);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    kit.push("cylinder", dummy.matrix, COLORS.ink);

    // 綠化盆栽與矮樹
    dummy.scale.set(0.24, 0.32, 0.24);
    dummy.position.set(ix - 1.1, GRID.TOP + 0.16, iz + 0.8);
    dummy.updateMatrix();
    kit.push("cone", dummy.matrix, COLORS.green);
  });

  kit.build(scene);
}
