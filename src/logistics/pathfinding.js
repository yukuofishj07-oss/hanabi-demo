import { axialToWorld } from "../island/grid.js";
import { GRID } from "../config/constants.js";

export class NetworkGraph {
  constructor(islandDataList, bridgeList) {
    this.nodes = {};
    this.adjacency = {};
    this.buildGraph(islandDataList, bridgeList);
  }

  addNode(id, x, z, islandId) {
    this.nodes[id] = { x, z, islandId };
    this.adjacency[id] = [];
  }

  addEdge(u, v) {
    const n1 = this.nodes[u];
    const n2 = this.nodes[v];
    if (!n1 || !n2) return;
    const dist = Math.hypot(n1.x - n2.x, n1.z - n2.z);
    this.adjacency[u].push({ to: v, weight: dist });
    this.adjacency[v].push({ to: u, weight: dist });
  }

  buildGraph(islandDataList, bridgeList) {
    // 走島內寬廣平整的中央石板路 (半徑 0.5~0.8)，絕不在外緣 1.8 邊角走
    islandDataList.forEach((isl) => {
      const center = axialToWorld(isl.axial.q, isl.axial.r);
      const centerId = `${isl.id}_center`;
      this.addNode(centerId, center.x, center.z, isl.id);

      // 島內寬闊主幹道節點 (半徑 0.65)
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const ex = center.x + Math.cos(angle) * 0.65;
        const ez = center.z + Math.sin(angle) * 0.65;
        const innerId = `${isl.id}_inner_${i}`;
        this.addNode(innerId, ex, ez, isl.id);

        this.addEdge(centerId, innerId);
      }
      for (let i = 0; i < 6; i++) {
        const next = (i + 1) % 6;
        this.addEdge(`${isl.id}_inner_${i}`, `${isl.id}_inner_${next}`);
      }
    });

    // 連接橋樑口：從島內內圈平滑引導上橋
    bridgeList.forEach((b) => {
      const findClosestInner = (islandId, mid) => {
        let bestId = null;
        let minDist = Infinity;
        for (let i = 0; i < 6; i++) {
          const innerId = `${islandId}_inner_${i}`;
          const n = this.nodes[innerId];
          const d = Math.hypot(n.x - mid.x, n.z - mid.z);
          if (d < minDist) {
            minDist = d;
            bestId = innerId;
          }
        }
        return bestId;
      };

      const u = findClosestInner(b.from, b.mid);
      const v = findClosestInner(b.to, b.mid);
      if (u && v) {
        this.addEdge(u, v);
      }
    });
  }

  findPath(startIslandId, endIslandId) {
    const startNode = `${startIslandId}_center`;
    const endNode = `${endIslandId}_center`;

    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(this.nodes));

    for (let node of unvisited) {
      distances[node] = Infinity;
    }
    distances[startNode] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let minDis = Infinity;
      for (let node of unvisited) {
        if (distances[node] < minDis) {
          minDis = distances[node];
          current = node;
        }
      }

      if (!current || minDis === Infinity || current === endNode) {
        break;
      }

      unvisited.delete(current);

      for (let edge of this.adjacency[current]) {
        if (unvisited.has(edge.to)) {
          const alt = distances[current] + edge.weight;
          if (alt < distances[edge.to]) {
            distances[edge.to] = alt;
            previous[edge.to] = current;
          }
        }
      }
    }

    const path = [];
    let curr = endNode;
    while (curr) {
      path.unshift(this.nodes[curr]);
      curr = previous[curr];
    }
    return path;
  }
}
