import { axialToWorld } from "../island/grid.js";
import { GRID } from "../config/constants.js";

// 建構 12 座工島之間的行人路網圖
export class NetworkGraph {
  constructor(islandDataList, bridgeList) {
    this.nodes = {}; // id -> { x, z, islandId }
    this.adjacency = {}; // id -> [{ to, weight }]

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
    // 1. 每座島建立 1 個中心節點與 6 個邊緣節點
    islandDataList.forEach((isl) => {
      const center = axialToWorld(isl.axial.q, isl.axial.r);
      const centerId = `${isl.id}_center`;
      this.addNode(centerId, center.x, center.z, isl.id);

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const ex = center.x + Math.cos(angle) * (GRID.R * 0.72);
        const ez = center.z + Math.sin(angle) * (GRID.R * 0.72);
        const edgeId = `${isl.id}_edge_${i}`;
        this.addNode(edgeId, ex, ez, isl.id);

        this.addEdge(centerId, edgeId);
      }
      for (let i = 0; i < 6; i++) {
        const next = (i + 1) % 6;
        this.addEdge(`${isl.id}_edge_${i}`, `${isl.id}_edge_${next}`);
      }
    });

    // 2. 依照橋樑連接相鄰島嶼最近的邊緣節點
    bridgeList.forEach((b) => {
      // 尋找兩個島上距離橋中點最近的邊緣點
      const findClosestEdge = (islandId, mid) => {
        let bestId = null;
        let minDist = Infinity;
        for (let i = 0; i < 6; i++) {
          const edgeId = `${islandId}_edge_${i}`;
          const n = this.nodes[edgeId];
          const d = Math.hypot(n.x - mid.x, n.z - mid.z);
          if (d < minDist) {
            minDist = d;
            bestId = edgeId;
          }
        }
        return bestId;
      };

      const u = findClosestEdge(b.from, b.mid);
      const v = findClosestEdge(b.to, b.mid);
      if (u && v) {
        this.addEdge(u, v);
      }
    });
  }

  // Dijkstra 最短路徑尋路
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
