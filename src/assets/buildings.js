import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { getIslandPos } from "../island/grid.js";
import { GRID, COLORS } from "../config/constants.js";

export function buildAllBuildings(scene, islandDataList) {
  const group = new THREE.Group();

  // 共享高品質黏土材質
  const wallMat = new THREE.MeshStandardMaterial({ color: COLORS.wall, roughness: 0.82 });
  const creamMat = new THREE.MeshStandardMaterial({ color: COLORS.wallCream, roughness: 0.82 });
  const roofCoralMat = new THREE.MeshStandardMaterial({ color: COLORS.roofCoral, roughness: 0.68 });
  const roofDarkMat = new THREE.MeshStandardMaterial({ color: COLORS.roofDark, roughness: 0.72 });
  const roofTealMat = new THREE.MeshStandardMaterial({ color: COLORS.roofTeal, roughness: 0.68 });
  const woodMat = new THREE.MeshStandardMaterial({ color: COLORS.wood, roughness: 0.78 });
  const woodDarkMat = new THREE.MeshStandardMaterial({ color: COLORS.woodDark, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({ color: COLORS.brass, roughness: 0.4, metalness: 0.35 });
  const steelMat = new THREE.MeshStandardMaterial({ color: COLORS.steel, roughness: 0.45, metalness: 0.4 });
  const pineMat = new THREE.MeshStandardMaterial({ color: COLORS.pine, roughness: 0.85 });
  const leafMat = new THREE.MeshStandardMaterial({ color: COLORS.leafLight, roughness: 0.85 });
  const cherryMat = new THREE.MeshStandardMaterial({ color: COLORS.cherry, roughness: 0.8 });
  const winMat = new THREE.MeshStandardMaterial({ color: 0xffe49e, emissive: 0xffb84d, emissiveIntensity: 0.65 });
  const glowMat = new THREE.MeshStandardMaterial({ color: COLORS.lightGlow, emissive: 0xffd24c, emissiveIntensity: 1.8 });

  // 輔助範本：建立帶窗戶與屋頂的精緻日式黏土工坊屋
  function createClayHouse(w, h, d, wallM, roofM) {
    const houseGroup = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.08), wallM);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    houseGroup.add(body);

    // 四坡屋頂
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, h * 0.65, 4), roofM);
    roof.position.y = h + (h * 0.65) / 2 - 0.04;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    houseGroup.add(roof);

    // 溫暖發光小木窗
    const win = new THREE.Mesh(new THREE.BoxGeometry(w * 0.45, h * 0.32, 0.04), winMat);
    win.position.set(0, h * 0.55, d / 2 + 0.01);
    houseGroup.add(win);

    return houseGroup;
  }

  islandDataList.forEach((island, idx) => {
    const { x: ix, z: iz } = getIslandPos(island);
    const by = GRID.TOP;
    const prop = new THREE.Group();
    prop.position.set(ix, by, iz);

    switch (island.step) {
      case "01": {
        // 01 黑火藥配研室：黑瓦白牆防爆屋 + 雙座木臼舂藥機 + 原料桶
        const mainHouse = createClayHouse(1.25, 0.75, 0.95, wallMat, roofDarkMat);
        mainHouse.position.set(-0.45, 0, -0.35);
        prop.add(mainHouse);

        for (let m = 0; m < 2; m++) {
          const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.36, 14), woodMat);
          mortar.position.set(0.65, 0.18, -0.35 + m * 0.72);
          mortar.castShadow = true;
          prop.add(mortar);

          const powder = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 12), steelMat);
          powder.position.set(0.65, 0.37, -0.35 + m * 0.72);
          prop.add(powder);

          const hammer = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 10), woodDarkMat);
          hammer.position.set(0.65, 0.52, -0.35 + m * 0.72);
          hammer.rotation.z = 0.25 * (m === 0 ? 1 : -1);
          prop.add(hammer);
        }
        break;
      }

      case "02": {
        // 02 金屬顯色配方所：光學實驗樓 + 5座五彩顯色化學玻璃槽 (紅、綠、藍、黃、紫)
        const lab = createClayHouse(1.15, 0.85, 0.9, creamMat, roofTealMat);
        lab.position.set(-0.5, 0, -0.3);
        prop.add(lab);

        const saltColors = [0xe74c3c, 0x2ecc71, 0x3498db, 0xf1c40f, 0x9b59b6];
        saltColors.forEach((col, cIdx) => {
          const angle = (cIdx / 5) * Math.PI * 1.2 - 0.5;
          const tx = 0.55 + Math.cos(angle) * 0.55;
          const tz = 0.15 + Math.sin(angle) * 0.55;
          const tankMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.3, emissive: col, emissiveIntensity: 0.25 });
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.48, 14), tankMat);
          tank.position.set(tx, 0.24, tz);
          tank.castShadow = true;
          prop.add(tank);
        });
        break;
      }

      case "03": {
        // 03 星珠滾筒造粒廠：工坊 + 3座大型傾斜旋轉黃銅造粒滾筒
        const workshop = createClayHouse(1.1, 0.7, 0.85, wallMat, roofCoralMat);
        workshop.position.set(-0.6, 0, -0.4);
        prop.add(workshop);

        for (let d = 0; d < 3; d++) {
          const stand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.42), woodDarkMat);
          stand.position.set(0.35 + (d - 1) * 0.55, 0.14, 0.25);
          prop.add(stand);

          const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.48, 16), brassMat);
          drum.position.set(0.35 + (d - 1) * 0.55, 0.42, 0.25);
          drum.rotation.z = Math.PI / 4;
          drum.castShadow = true;
          prop.add(drum);
        }
        break;
      }

      case "04": {
        // 04 星珠陽光乾燥棚：溫風塔 + 6座擺滿彩色星珠的竹篩日照曬架
        const fanTower = createClayHouse(0.75, 0.95, 0.75, creamMat, roofCoralMat);
        fanTower.position.set(-0.75, 0, -0.35);
        prop.add(fanTower);

        const starColors = [0xff4757, 0x2ed573, 0xffa502, 0x1e90ff, 0xeccc68, 0xff6b81];
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 3; c++) {
            const trayX = 0.05 + (c - 1) * 0.65;
            const trayZ = -0.35 + r * 0.75;
            const tray = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.54), woodMat);
            tray.position.set(trayX, 0.22, trayZ);
            tray.castShadow = true;
            prop.add(tray);

            const beadMat = new THREE.MeshStandardMaterial({ color: starColors[(r * 3 + c) % starColors.length], roughness: 0.5 });
            const beads = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12), beadMat);
            beads.position.set(trayX, 0.28, trayZ);
            prop.add(beads);
          }
        }
        break;
      }

      case "05": {
        // 05 半球紙模壓製廠：龍門式液壓熱壓機 + 成排半球牛皮紙殼
        const pressFrame = new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.15, 0.7, 2, 0.06), steelMat);
        pressFrame.position.set(-0.35, 0.58, -0.25);
        pressFrame.castShadow = true;
        prop.add(pressFrame);

        const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.45, 16), brassMat);
        piston.position.set(-0.35, 0.65, -0.25);
        prop.add(piston);

        // 成型半球紙殼堆疊
        for (let s = 0; s < 4; s++) {
          const shell = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), woodMat);
          shell.position.set(0.65 + (s % 2) * 0.58, 0.02, -0.3 + Math.floor(s / 2) * 0.58);
          shell.castShadow = true;
          prop.add(shell);
        }
        break;
      }

      case "06": {
        // 06 內膽排列填裝室：工坊 + 巨型圓形星珠同心圓排列解剖模型檯
        const house = createClayHouse(1.0, 0.75, 0.85, wallMat, roofDarkMat);
        house.position.set(-0.65, 0, -0.3);
        prop.add(house);

        // 展示剖面半球：外殼 + 彩色星珠環 + 中央割火藥
        const table = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.58, 0.28, 18), woodDarkMat);
        table.position.set(0.48, 0.14, 0.15);
        table.castShadow = true;
        prop.add(table);

        const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.09, 10, 20), new THREE.MeshStandardMaterial({ color: 0xff4757 }));
        outerRing.rotation.x = Math.PI / 2;
        outerRing.position.set(0.48, 0.32, 0.15);
        prop.add(outerRing);

        const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.08, 10, 16), new THREE.MeshStandardMaterial({ color: 0xffd32a }));
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.set(0.48, 0.32, 0.15);
        prop.add(innerRing);

        const core = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), steelMat);
        core.position.set(0.48, 0.32, 0.15);
        prop.add(core);
        break;
      }

      case "07": {
        // 07 經緯紙帶糊緊工坊：玉張纏帶屋 + 懸掛晾乾的圓球尺玉架
        const house = createClayHouse(1.05, 0.78, 0.85, creamMat, roofCoralMat);
        house.position.set(-0.6, 0, -0.3);
        prop.add(house);

        // 晾乾木架與懸掛的 3 顆大花火球
        const rackBeam = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.08), woodDarkMat);
        rackBeam.position.set(0.45, 0.88, 0.2);
        prop.add(rackBeam);

        for (let b = 0; b < 3; b++) {
          const ball = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), woodMat);
          ball.position.set(0.05 + b * 0.42, 0.48, 0.2);
          ball.castShadow = true;
          prop.add(ball);
        }
        break;
      }

      case "08": {
        // 08 底部升空推藥組：火藥定量漏斗塔 + 帶紅色推進底座的花火彈
        const hopper = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.85, 14), roofTealMat);
        hopper.position.set(-0.5, 0.65, -0.25);
        hopper.rotation.x = Math.PI;
        hopper.castShadow = true;
        prop.add(hopper);

        for (let s = 0; s < 3; s++) {
          const coneBase = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.25, 12), roofCoralMat);
          coneBase.position.set(0.45 + (s - 1) * 0.48, 0.13, 0.25);
          prop.add(coneBase);

          const shellBall = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), woodMat);
          shellBall.position.set(0.45 + (s - 1) * 0.48, 0.42, 0.25);
          shellBall.castShadow = true;
          prop.add(shellBall);
        }
        break;
      }

      case "09": {
        // 09 X光安全探傷站：圓頂科技感鉛防護掃描艙 + 發光透視螢幕
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.68, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2), wallMat);
        dome.position.set(-0.35, 0, -0.2);
        dome.castShadow = true;
        prop.add(dome);

        const screenFrame = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.55, 0.16, 2, 0.04), steelMat);
        screenFrame.position.set(0.62, 0.32, 0.15);
        prop.add(screenFrame);

        const screenGlow = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.40, 0.18), new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00d2d3, emissiveIntensity: 0.9 }));
        screenGlow.position.set(0.62, 0.32, 0.15);
        prop.add(screenGlow);
        break;
      }

      case "10": {
        // 10 迫擊鋼砲盛典陣地：雙層日式紅欄杆觀禮指揮樓 + 6門重型尺玉迫擊鋼砲陣列
        const tower1 = createClayHouse(1.35, 0.68, 0.95, wallMat, roofDarkMat);
        tower1.position.set(0, 0, -0.65);
        prop.add(tower1);

        const tower2 = createClayHouse(0.95, 0.58, 0.72, creamMat, roofCoralMat);
        tower2.position.set(0, 0.72, -0.65);
        prop.add(tower2);

        // 前排 6 門巨型尺玉迫擊砲筒
        const bunker = new THREE.Mesh(new RoundedBoxGeometry(2.1, 0.24, 0.68, 2, 0.05), woodDarkMat);
        bunker.position.set(0, 0.12, 0.55);
        bunker.castShadow = true;
        prop.add(bunker);

        for (let m = 0; m < 6; m++) {
          const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.95, 14), steelMat);
          mortar.position.set((m - 2.5) * 0.34, 0.55, 0.55);
          mortar.rotation.x = 0.08;
          mortar.castShadow = true;
          prop.add(mortar);

          const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 14), brassMat);
          muzzle.rotation.x = Math.PI / 2 + 0.08;
          muzzle.position.set((m - 2.5) * 0.34, 1.02, 0.59);
          prop.add(muzzle);
        }
        break;
      }
    }

    // 每島外圍豐富景觀美化：雙層針葉松、粉櫻花樹、石燈籠/暖光路燈
    // 左後針葉松
    const trunkL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.38, 8), woodDarkMat);
    trunkL.position.set(-1.65, 0.19, -1.05);
    prop.add(trunkL);
    const pine1 = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.65, 9), pineMat);
    pine1.position.set(-1.65, 0.58, -1.05);
    pine1.castShadow = true;
    prop.add(pine1);
    const pine2 = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.52, 9), leafMat);
    pine2.position.set(-1.65, 0.92, -1.05);
    pine2.castShadow = true;
    prop.add(pine2);

    // 右後浪漫粉櫻花樹
    const trunkR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.42, 8), woodDarkMat);
    trunkR.position.set(1.62, 0.21, -0.95);
    prop.add(trunkR);
    const crownMain = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 10), cherryMat);
    crownMain.position.set(1.62, 0.65, -0.95);
    crownMain.castShadow = true;
    prop.add(crownMain);
    const crownSub = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), cherryMat);
    crownSub.position.set(1.32, 0.55, -0.82);
    prop.add(crownSub);

    // 步道旁日式暖光木路燈
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.68, 8), woodDarkMat);
    post.position.set(1.55, 0.34, 1.05);
    prop.add(post);
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), glowMat);
    lantern.position.set(1.55, 0.72, 1.05);
    prop.add(lantern);

    scene.add(prop);
  });
}
