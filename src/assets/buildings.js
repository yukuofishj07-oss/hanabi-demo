import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { getIslandPos } from "../island/grid.js";
import { GRID, COLORS, rng } from "../config/constants.js";

export class BuildingsManager {
  constructor(scene, islandDataList) {
    this.scene = scene;
    this.animatedProps = []; // 儲存水車、木臼、造粒滾筒、壓模機、風車、X光環等動態機關

    this.buildAll(islandDataList);
  }

  buildAll(islandDataList) {
    const wallMat = new THREE.MeshStandardMaterial({ color: COLORS.wall, roughness: 0.8 });
    const creamMat = new THREE.MeshStandardMaterial({ color: COLORS.wallCream, roughness: 0.8 });
    const roofCoralMat = new THREE.MeshStandardMaterial({ color: COLORS.roofCoral, roughness: 0.65 });
    const roofDarkMat = new THREE.MeshStandardMaterial({ color: COLORS.roofDark, roughness: 0.7 });
    const roofTealMat = new THREE.MeshStandardMaterial({ color: COLORS.roofTeal, roughness: 0.65 });
    const woodMat = new THREE.MeshStandardMaterial({ color: COLORS.wood, roughness: 0.75 });
    const woodDarkMat = new THREE.MeshStandardMaterial({ color: COLORS.woodDark, roughness: 0.8 });
    const brassMat = new THREE.MeshStandardMaterial({ color: COLORS.brass, roughness: 0.35, metalness: 0.4 });
    const steelMat = new THREE.MeshStandardMaterial({ color: COLORS.steel, roughness: 0.45, metalness: 0.45 });
    const winMat = new THREE.MeshStandardMaterial({ color: 0xffe8a3, emissive: 0xffa834, emissiveIntensity: 0.85 });
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0xff5238, emissive: 0xff6b38, emissiveIntensity: 1.6 });
    const glowYellowMat = new THREE.MeshStandardMaterial({ color: 0xffe885, emissive: 0xffb834, emissiveIntensity: 2.0 });

    // 範本 1：精緻日式微縮工坊建築（含屋簷、雙層窗格、門口掛燈籠、木棧底座）
    const createDetailedWorkshop = (w, h, d, wallM, roofM) => {
      const g = new THREE.Group();
      // 木棧基座
      const deck = new THREE.Mesh(new RoundedBoxGeometry(w + 0.25, 0.12, d + 0.25, 2, 0.04), woodDarkMat);
      deck.position.y = 0.06;
      deck.receiveShadow = true;
      g.add(deck);

      // 牆體
      const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.08), wallM);
      body.position.y = 0.12 + h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      // 雙層厚屋簷與四坡屋頂
      const eave = new THREE.Mesh(new RoundedBoxGeometry(w + 0.32, 0.09, d + 0.32, 2, 0.03), woodDarkMat);
      eave.position.y = 0.12 + h;
      eave.castShadow = true;
      g.add(eave);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.82, h * 0.68, 4), roofM);
      roof.position.y = 0.12 + h + (h * 0.68) / 2;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      g.add(roof);

      // 發光格子窗
      const win = new THREE.Mesh(new THREE.BoxGeometry(w * 0.48, h * 0.36, 0.05), winMat);
      win.position.set(0, 0.12 + h * 0.55, d / 2 + 0.01);
      g.add(win);

      // 屋簷下兩顆紅燈籠
      for (let sx of [-w * 0.35, w * 0.35]) {
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), lanternMat);
        l.scale.set(0.85, 1.25, 0.85);
        l.position.set(sx, 0.12 + h - 0.12, d / 2 + 0.14);
        g.add(l);
      }

      return g;
    };

    // 範本 2：自然不規則蓬鬆多球體樹簇 (告別單顆死板圓球！)
    const createFluffyTree = (foliageColorHex, scale = 1.0) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * scale, 0.14 * scale, 0.55 * scale, 8), woodDarkMat);
      trunk.position.y = 0.27 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      const fMat = new THREE.MeshStandardMaterial({ color: foliageColorHex, roughness: 0.85 });
      const puffs = [
        { x: 0, y: 0.72, z: 0, r: 0.42 },
        { x: -0.24, y: 0.58, z: 0.15, r: 0.32 },
        { x: 0.26, y: 0.62, z: -0.12, r: 0.34 },
        { x: 0.05, y: 0.92, z: -0.08, r: 0.30 }
      ];
      puffs.forEach((p) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(p.r * scale, 10, 10), fMat);
        s.position.set(p.x * scale, p.y * scale, p.z * scale);
        s.castShadow = true;
        tree.add(s);
      });
      return tree;
    };

    // 範本 3：堆疊原料麻布袋與木桶群 (增加生活感細節)
    const createCratesAndBarrels = () => {
      const cGroup = new THREE.Group();
      const sackMat = new THREE.MeshStandardMaterial({ color: 0xd9c2a3, roughness: 0.9 });
      for (let i = 0; i < 3; i++) {
        const sack = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.18, 0.24, 2, 0.06), sackMat);
        sack.position.set((i % 2) * 0.26, 0.09 + Math.floor(i / 2) * 0.16, 0);
        sack.rotation.y = i * 0.3;
        sack.castShadow = true;
        cGroup.add(sack);
      }
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 12), woodMat);
      barrel.position.set(-0.32, 0.17, 0.15);
      barrel.castShadow = true;
      cGroup.add(barrel);
      return cGroup;
    };

    islandDataList.forEach((island, idx) => {
      const { x: ix, z: iz } = getIslandPos(island);
      const by = GRID.TOP;
      const prop = new THREE.Group();
      prop.position.set(ix, by, iz);

      // 每座島中心配置一盞柔和暖橘色點光源 (營造 Teal & Orange 電影級冷暖光影！)
      const islandLight = new THREE.PointLight(0xff9d47, 2.2, 11, 1.5);
      islandLight.position.set(0, 2.4, 0.5);
      prop.add(islandLight);

      switch (island.num) {
        case "01": {
          // 01 配藥：主工坊 + 轉動水車 + 上下交替舂搗的雙木臼 + 硝石麻布袋堆
          const house = createDetailedWorkshop(1.8, 1.05, 1.35, wallMat, roofDarkMat);
          house.position.set(-0.85, 0, -0.55);
          prop.add(house);

          // 側面旋轉水車
          const wheel = new THREE.Group();
          wheel.position.set(-1.82, 0.65, -0.55);
          const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.06, 8, 16), woodDarkMat);
          wheelRing.rotation.y = Math.PI / 2;
          wheel.add(wheelRing);
          for (let b = 0; b < 6; b++) {
            const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.96, 0.06), woodMat);
            spoke.rotation.x = (b * Math.PI) / 6;
            wheel.add(spoke);
          }
          prop.add(wheel);
          this.animatedProps.push({ type: "wheel", mesh: wheel });

          // 雙座動態舂藥木臼
          for (let m = 0; m < 2; m++) {
            const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.45, 14), woodMat);
            mortar.position.set(0.95, 0.23, -0.45 + m * 0.95);
            mortar.castShadow = true;
            prop.add(mortar);

            const hammer = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.78, 10), woodDarkMat);
            hammer.position.set(0.95, 0.72, -0.45 + m * 0.95);
            prop.add(hammer);
            this.animatedProps.push({ type: "piston", mesh: hammer, baseY: 0.72, phase: m * Math.PI });
          }

          const crates = createCratesAndBarrels();
          crates.position.set(-0.3, 0, 1.15);
          prop.add(crates);
          break;
        }

        case "02": {
          // 02 調色：光學實驗樓 + 5座發光玻璃調色釜 (頂部攪拌葉片持續旋轉)
          const lab = createDetailedWorkshop(1.7, 1.15, 1.3, creamMat, roofTealMat);
          lab.position.set(-0.85, 0, -0.5);
          prop.add(lab);

          const saltColors = [0xff3b30, 0x2ecc71, 0x00a8ff, 0xfbc531, 0x9c88ff];
          saltColors.forEach((col, cIdx) => {
            const angle = (cIdx / 5) * Math.PI * 1.3 - 0.6;
            const tx = 0.85 + Math.cos(angle) * 0.92;
            const tz = 0.25 + Math.sin(angle) * 0.92;
            const tankMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.2, emissive: col, emissiveIntensity: 0.45 });
            const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.65, 16), tankMat);
            tank.position.set(tx, 0.33, tz);
            tank.castShadow = true;
            prop.add(tank);

            // 旋轉攪拌十字槳
            const mixer = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.08), brassMat);
            mixer.position.set(tx, 0.70, tz);
            prop.add(mixer);
            this.animatedProps.push({ type: "spinY", mesh: mixer, speed: 3.5 });
          });
          break;
        }

        case "03": {
          // 03 滾珠：工坊 + 3座大型自轉黃銅造粒滾筒 + 漿液輸送管
          const workshop = createDetailedWorkshop(1.65, 1.0, 1.25, wallMat, roofCoralMat);
          workshop.position.set(-0.9, 0, -0.6);
          prop.add(workshop);

          for (let d = 0; d < 3; d++) {
            const dx = 0.55 + (d - 1) * 0.88;
            const dz = 0.45;
            const stand = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.38, 0.58, 2, 0.04), woodDarkMat);
            stand.position.set(dx, 0.19, dz);
            prop.add(stand);

            const drumGroup = new THREE.Group();
            drumGroup.position.set(dx, 0.62, dz);
            drumGroup.rotation.z = Math.PI / 5;
            const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.34, 0.68, 16), brassMat);
            drum.castShadow = true;
            drumGroup.add(drum);

            const rib = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 8, 16), steelMat);
            rib.rotation.x = Math.PI / 2;
            drumGroup.add(rib);

            prop.add(drumGroup);
            this.animatedProps.push({ type: "drumSpin", mesh: drum, speed: 2.2 });
          }
          break;
        }

        case "04": {
          // 04 曬場：溫控風車塔（葉片旋轉）+ 9座擺滿五彩立體星珠的階梯竹篩曬台
          const fanTower = createDetailedWorkshop(1.25, 1.35, 1.15, creamMat, roofCoralMat);
          fanTower.position.set(-1.15, 0, -0.55);
          prop.add(fanTower);

          // 旋轉木製測風車葉片
          const blades = new THREE.Group();
          blades.position.set(-1.15, 1.25, 0.08);
          for (let b = 0; b < 4; b++) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, 0.04), woodMat);
            blade.rotation.z = (b * Math.PI) / 4;
            blades.add(blade);
          }
          prop.add(blades);
          this.animatedProps.push({ type: "spinZ", mesh: blades, speed: 1.8 });

          // 階梯竹篩與立體彩珠
          const starColors = [0xff4757, 0x2ed573, 0xffa502, 0x1e90ff, 0xeccc68, 0xff6b81];
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              const tx = 0.25 + (c - 1) * 0.85;
              const tz = -0.75 + r * 0.82;
              const ty = 0.18 + (2 - r) * 0.12;
              const tray = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.09, 0.68, 2, 0.02), woodMat);
              tray.position.set(tx, ty, tz);
              tray.castShadow = true;
              prop.add(tray);

              const bMat = new THREE.MeshStandardMaterial({ color: starColors[(r * 3 + c) % starColors.length], roughness: 0.4 });
              for (let bx of [-0.16, 0, 0.16]) {
                for (let bz of [-0.14, 0.14]) {
                  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), bMat);
                  bead.position.set(tx + bx, ty + 0.07, tz + bz);
                  prop.add(bead);
                }
              }
            }
          }
          break;
        }

        case "05": {
          // 05 紙殼：大型龍門液壓機（壓頭上下往復壓合）+ 蒸汽鍋爐 + 堆疊半球紙殼
          const boiler = createDetailedWorkshop(1.3, 1.0, 1.1, wallMat, roofDarkMat);
          boiler.position.set(-1.05, 0, -0.5);
          prop.add(boiler);

          const arch = new THREE.Mesh(new RoundedBoxGeometry(1.45, 1.55, 0.85, 2, 0.08), steelMat);
          arch.position.set(0.55, 0.78, -0.35);
          arch.castShadow = true;
          prop.add(arch);

          const pressHead = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.55, 16), brassMat);
          pressHead.position.set(0.55, 0.95, -0.35);
          prop.add(pressHead);
          this.animatedProps.push({ type: "piston", mesh: pressHead, baseY: 0.95, phase: 0.5 });

          for (let s = 0; s < 6; s++) {
            const shell = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), woodMat);
            shell.position.set(0.2 + (s % 3) * 0.75, 0.04, 0.65 + Math.floor(s / 3) * 0.72);
            shell.castShadow = true;
            prop.add(shell);
          }
          break;
        }

        case "06": {
          // 06 排珠：匠人屋 + 巨型自轉「花火球同心圓解剖工作台」
          const house = createDetailedWorkshop(1.5, 1.0, 1.2, wallMat, roofDarkMat);
          house.position.set(-0.95, 0, -0.55);
          prop.add(house);

          const table = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.88, 0.36, 24), woodDarkMat);
          table.position.set(0.75, 0.18, 0.25);
          table.castShadow = true;
          prop.add(table);

          const cutaway = new THREE.Group();
          cutaway.position.set(0.75, 0.42, 0.25);

          const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.12, 12, 24), new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff3b30, emissiveIntensity: 0.3 }));
          ring1.rotation.x = Math.PI / 2;
          cutaway.add(ring1);

          const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.10, 12, 20), new THREE.MeshStandardMaterial({ color: 0xfbc531, emissive: 0xfbc531, emissiveIntensity: 0.3 }));
          ring2.rotation.x = Math.PI / 2;
          cutaway.add(ring2);

          const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), steelMat);
          cutaway.add(core);

          prop.add(cutaway);
          this.animatedProps.push({ type: "spinY", mesh: cutaway, speed: 0.8 });
          break;
        }

        case "07": {
          // 07 糊玉：纏帶工坊 + 自動翻轉纏帶機（大圓球自轉）+ 懸掛陰乾尺玉木架
          const house = createDetailedWorkshop(1.55, 1.05, 1.2, creamMat, roofCoralMat);
          house.position.set(-0.9, 0, -0.5);
          prop.add(house);

          // 旋轉纏帶機與大圓球
          const winderBall = new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 16), woodMat);
          winderBall.position.set(0.85, 0.65, -0.45);
          winderBall.castShadow = true;
          prop.add(winderBall);
          const bandRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 8, 20), roofCoralMat);
          winderBall.add(bandRing);
          this.animatedProps.push({ type: "tumble", mesh: winderBall });

          // 懸掛陰乾尺玉木架
          const beam = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.10, 0.10), woodDarkMat);
          beam.position.set(0.45, 1.25, 0.75);
          prop.add(beam);
          for (let b = 0; b < 3; b++) {
            const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14), woodMat);
            ball.position.set(-0.15 + b * 0.62, 0.68, 0.75);
            ball.castShadow = true;
            prop.add(ball);
          }
          break;
        }

        case "08": {
          // 08 裝底：高聳定量火藥漏斗塔 + 安裝紅色錐形推進杯的成品尺玉列
          const house = createDetailedWorkshop(1.4, 0.95, 1.1, wallMat, roofTealMat);
          house.position.set(-1.05, 0, -0.55);
          prop.add(house);

          const hopper = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.25, 16), roofTealMat);
          hopper.position.set(0.55, 1.05, -0.55);
          hopper.rotation.x = Math.PI;
          hopper.castShadow = true;
          prop.add(hopper);

          for (let s = 0; s < 3; s++) {
            const sx = 0.25 + (s - 1) * 0.78;
            const coneBase = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.36, 14), roofCoralMat);
            coneBase.position.set(sx, 0.18, 0.65);
            prop.add(coneBase);

            const shellBall = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 14), woodMat);
            shellBall.position.set(sx, 0.60, 0.65);
            shellBall.castShadow = true;
            prop.add(shellBall);
          }
          break;
        }

        case "09": {
          // 09 探傷：圓頂鉛防護艙 + 上下移動的發光 X 光掃描環 + 斷層監控大螢幕
          const dome = new THREE.Mesh(new THREE.SphereGeometry(0.98, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2), wallMat);
          dome.position.set(-0.65, 0, -0.25);
          dome.castShadow = true;
          prop.add(dome);

          // 動態 X 光掃描光環
          const scanMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00ffcc, emissiveIntensity: 2.2 });
          const scanRing = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.045, 10, 24), scanMat);
          scanRing.rotation.x = Math.PI / 2;
          scanRing.position.set(0.85, 0.55, -0.25);
          prop.add(scanRing);
          this.animatedProps.push({ type: "piston", mesh: scanRing, baseY: 0.55, phase: 0 });

          const targetBall = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 14), woodMat);
          targetBall.position.set(0.85, 0.52, -0.25);
          prop.add(targetBall);

          const screenFrame = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.78, 0.18, 2, 0.04), steelMat);
          screenFrame.position.set(0.45, 0.45, 0.85);
          prop.add(screenFrame);
          const screenGlow = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.58, 0.20), scanMat);
          screenGlow.position.set(0.45, 0.45, 0.85);
          prop.add(screenGlow);
          break;
        }

        case "10": {
          // 10 施放台：氣派雙層朱紅日式觀禮指揮櫓 + 8門重型尺玉迫擊鋼砲陣列
          const tower1 = createDetailedWorkshop(2.1, 1.0, 1.4, wallMat, roofDarkMat);
          tower1.position.set(0, 0, -0.85);
          prop.add(tower1);

          const tower2 = createDetailedWorkshop(1.45, 0.85, 1.05, creamMat, roofCoralMat);
          tower2.position.set(0, 1.05, -0.85);
          prop.add(tower2);

          // 重型迫擊砲防爆基座與 8 門巨砲
          const bunker = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.34, 0.95, 2, 0.06), woodDarkMat);
          bunker.position.set(0, 0.17, 0.85);
          bunker.castShadow = true;
          prop.add(bunker);

          for (let m = 0; m < 8; m++) {
            const mx = (m - 3.5) * 0.38;
            const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 1.25, 16), steelMat);
            mortar.position.set(mx, 0.72, 0.85);
            mortar.rotation.x = 0.06;
            mortar.castShadow = true;
            prop.add(mortar);

            const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 8, 16), brassMat);
            muzzle.rotation.x = Math.PI / 2 + 0.06;
            muzzle.position.set(mx, 1.34, 0.89);
            prop.add(muzzle);
          }
          break;
        }
      }

      // 隨機錯落的自然蓬鬆樹簇與祭典石燈籠 (打破每座島複製貼上的機械感！)
      const treePalette = [COLORS.pine, COLORS.leafLight, COLORS.cherry, COLORS.autumn];
      const treePositions = [
        { x: -2.4, z: -1.6, s: 1.15 },
        { x: 2.35, z: -1.5, s: 1.05 },
        { x: -2.5, z: 1.2, s: 0.92 }
      ];
      treePositions.forEach((tp, tIdx) => {
        const col = treePalette[(idx + tIdx) % treePalette.length];
        const tree = createFluffyTree(col, tp.s * (0.9 + (rng() - 0.5) * 0.25));
        tree.position.set(tp.x + (rng() - 0.5) * 0.35, 0, tp.z + (rng() - 0.5) * 0.35);
        tree.rotation.y = rng() * Math.PI * 2;
        prop.add(tree);
      });

      // 步道轉角日式暖光木燈籠柱
      for (let lx of [-2.1, 2.1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.92, 8), woodDarkMat);
        post.position.set(lx, 0.46, 1.65);
        prop.add(post);
        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), glowYellowMat);
        lantern.position.set(lx, 0.96, 1.65);
        prop.add(lantern);
      }

      this.scene.add(prop);
    });
  }

  update(time) {
    for (let i = 0; i < this.animatedProps.length; i++) {
      const p = this.animatedProps[i];
      if (p.type === "wheel") {
        p.mesh.rotation.x = time * 1.4;
      } else if (p.type === "piston") {
        p.mesh.position.y = p.baseY + Math.sin(time * 5.0 + p.phase) * 0.18;
      } else if (p.type === "spinY") {
        p.mesh.rotation.y = time * p.speed;
      } else if (p.type === "spinZ") {
        p.mesh.rotation.z = time * p.speed;
      } else if (p.type === "drumSpin") {
        p.mesh.rotation.y = time * p.speed;
      } else if (p.type === "tumble") {
        p.mesh.rotation.x = time * 1.6;
        p.mesh.rotation.y = time * 2.1;
      }
    }
  }
}
