import * as THREE from "three";
import { axialToWorld } from "../island/grid.js";
import { GRID, COLORS } from "../config/constants.js";

export function buildAllBuildings(scene, kit, islandDataList) {
  const dummy = new THREE.Object3D();

  islandDataList.forEach((island) => {
    const { x: ix, z: iz } = axialToWorld(island.axial.q, island.axial.r);

    island.items.forEach((item, idx) => {
      const offsetX = (idx === 0 ? -0.45 : 0.45);
      const offsetZ = -0.3;
      const bx = ix + offsetX;
      const bz = iz + offsetZ;
      const by = GRID.TOP;

      switch (item.model) {
        case "vat":
          dummy.scale.set(0.65, 0.5, 0.65);
          dummy.position.set(bx, by + 0.25, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("cylinder", dummy.matrix, COLORS.teal);
          break;

        case "kiln":
          dummy.scale.set(0.6, 0.6, 0.6);
          dummy.position.set(bx, by + 0.3, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("rbox", dummy.matrix, COLORS.coral);
          break;

        case "drum":
          dummy.scale.set(0.7, 0.45, 0.45);
          dummy.position.set(bx, by + 0.25, bz);
          dummy.rotation.set(0, 0, Math.PI / 4);
          dummy.updateMatrix();
          kit.push("cylinder", dummy.matrix, COLORS.yellow);
          break;

        case "mortar":
        case "mortar_multi":
          for (let m = 0; m < 3; m++) {
            dummy.scale.set(0.18, 0.75, 0.18);
            dummy.position.set(bx + (m - 1) * 0.25, by + 0.35, bz);
            dummy.rotation.set(0.1, 0, 0);
            dummy.updateMatrix();
            kit.push("cylinder", dummy.matrix, COLORS.ink);
          }
          break;

        default:
          dummy.scale.set(0.5, 0.6, 0.5);
          dummy.position.set(bx, by + 0.3, bz);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          kit.push("rbox", dummy.matrix, COLORS.stone);
          break;
      }
    });
  });

  kit.build(scene);
}
