// ==========================================================================
// EMERGENCY EVACUATION PLANNER - DAISYUI + VUE 3 APPLICATION
// Discrete Mathematics Mini Project: Graphs, BFS, Relations, Warshall, Logic
// ==========================================================================

function initEvacuationApp() {
  if (typeof Vue === 'undefined') {
    setTimeout(initEvacuationApp, 50);
    return;
  }

  const { createApp, ref, reactive, computed, watch, onMounted, nextTick } = Vue;

  const app = createApp({
    setup() {
      // ------------------------------------------------------------------------
      // 1. THEME MANAGEMENT
      // ------------------------------------------------------------------------
      const currentTheme = ref('night');
      try {
        currentTheme.value = localStorage.getItem('daisy_theme') || 'night';
      } catch (e) {
        currentTheme.value = 'night';
      }

      function toggleTheme() {
        currentTheme.value = currentTheme.value === 'night' ? 'light' : 'night';
        document.documentElement.setAttribute('data-theme', currentTheme.value);
        try {
          localStorage.setItem('daisy_theme', currentTheme.value);
        } catch (e) {}
      }

      // ------------------------------------------------------------------------
      // 2. GRAPH SPECIFICATIONS & TOPOLOGY
      // ------------------------------------------------------------------------
      const nodes = [
        { id: 'A', name: 'Zone A', x: 90, y: 80, icon: '🧯', resource: 'Fire Extinguisher' },
        { id: 'B', name: 'Zone B', x: 300, y: 80, icon: '🩹', resource: 'First Aid Kit' },
        { id: 'C', name: 'Zone C', x: 510, y: 80, icon: '🧯', resource: 'Fire Extinguisher' },
        { id: 'D', name: 'Zone D', x: 90, y: 200, icon: '🩹', resource: 'First Aid Kit' },
        { id: 'E', name: 'Zone E', x: 300, y: 200, icon: '🔔', resource: 'Emergency Alarm' },
        { id: 'F', name: 'Zone F', x: 510, y: 200, icon: '🧯', resource: 'Fire Extinguisher' },
        { id: 'G', name: 'Zone G', x: 300, y: 320, icon: '🔔', resource: 'Emergency Alarm' },
        { id: 'EXIT', name: 'EXIT', x: 510, y: 320, icon: '🚪', resource: 'Emergency Exit' }
      ];

      const nodeIds = nodes.map(n => n.id);
      const startOptions = nodes.filter(n => n.id !== 'EXIT').map(n => n.id);

      const baseGraph = {
        A: ['B', 'D'],
        B: ['A', 'C', 'E'],
        C: ['B', 'F'],
        D: ['A', 'E'],
        E: ['B', 'D', 'F', 'G'],
        F: ['C', 'E'],
        G: ['E', 'EXIT'],
        EXIT: ['G']
      };

      const edges = [
        { id: 'A-B', u: 'A', v: 'B', x1: 90, y1: 80, x2: 300, y2: 80 },
        { id: 'B-C', u: 'B', v: 'C', x1: 300, y1: 80, x2: 510, y2: 80 },
        { id: 'A-D', u: 'A', v: 'D', x1: 90, y1: 80, x2: 90, y2: 200 },
        { id: 'B-E', u: 'B', v: 'E', x1: 300, y1: 80, x2: 300, y2: 200 },
        { id: 'C-F', u: 'C', v: 'F', x1: 510, y1: 80, x2: 510, y2: 200 },
        { id: 'D-E', u: 'D', v: 'E', x1: 90, y1: 200, x2: 300, y2: 200 },
        { id: 'E-F', u: 'E', v: 'F', x1: 300, y1: 200, x2: 510, y2: 200 },
        { id: 'E-G', u: 'E', v: 'G', x1: 300, y1: 200, x2: 300, y2: 320 },
        { id: 'G-EXIT', u: 'G', v: 'EXIT', x1: 300, y1: 320, x2: 510, y2: 320 }
      ];

      // ------------------------------------------------------------------------
      // 3. REACTIVE STATE
      // ------------------------------------------------------------------------
      const selectedStart = ref('A');
      const selectedExit = ref('EXIT');
      const exitStatus = ref('available'); // 'available' | 'unavailable'
      const blockedEdges = ref(new Set());
      const selectedBlockedEdge = ref('A-B');
      const activeTab = ref('matrix'); // 'matrix' | 'warshall' | 'logic' | 'resources'

      const calculatedRoute = ref(null);
      const routeStatusText = ref('NOT CALCULATED');
      const isRouteSafe = ref(false);

      // ------------------------------------------------------------------------
      // 4. BFS ROUTE FINDING
      // ------------------------------------------------------------------------
      function isEdgeBlocked(u, v) {
        return (
          blockedEdges.value.has(`${u}-${v}`) ||
          blockedEdges.value.has(`${v}-${u}`)
        );
      }

      function findRoute(start, dest) {
        if (start === dest) return [start];
        const queue = [[start]];
        const visited = new Set([start]);

        while (queue.length > 0) {
          const path = queue.shift();
          const current = path[path.length - 1];

          if (current === dest) return path;

          const neighbors = baseGraph[current] || [];
          for (const neighbor of neighbors) {
            if (isEdgeBlocked(current, neighbor)) continue;
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push([...path, neighbor]);
            }
          }
        }
        return null;
      }

      function calculateSafeRoute() {
        const route = findRoute(selectedStart.value, selectedExit.value);
        calculatedRoute.value = route;

        const exitAvailable = exitStatus.value === 'available';

        if (route !== null && exitAvailable) {
          routeStatusText.value = `SAFE ROUTE FOUND (${route.length - 1} steps)`;
          isRouteSafe.value = true;
        } else if (route !== null && !exitAvailable) {
          routeStatusText.value = 'ROUTE FOUND BUT EXIT IS UNAVAILABLE';
          isRouteSafe.value = false;
        } else {
          routeStatusText.value = 'NO ROUTE AVAILABLE';
          isRouteSafe.value = false;
        }

        syncLegacyDom();
      }

      function toggleEdge(edgeId) {
        const edge = edges.find(e => e.id === edgeId);
        if (!edge) return;

        const k1 = `${edge.u}-${edge.v}`;
        const k2 = `${edge.v}-${edge.u}`;

        if (blockedEdges.value.has(k1) || blockedEdges.value.has(k2)) {
          blockedEdges.value.delete(k1);
          blockedEdges.value.delete(k2);
        } else {
          blockedEdges.value.add(k1);
        }

        blockedEdges.value = new Set(blockedEdges.value);
        calculateSafeRoute();
      }

      function blockSelectedEdge() {
        toggleEdge(selectedBlockedEdge.value);
      }

      function resetAllPaths() {
        blockedEdges.value.clear();
        blockedEdges.value = new Set();
        calculateSafeRoute();
      }

      function selectNodeAsStart(nodeId) {
        if (nodeId === 'EXIT') return;
        selectedStart.value = nodeId;
        calculateSafeRoute();
      }

      // Check if an edge is part of the active route
      function isEdgeInRoute(u, v) {
        if (!calculatedRoute.value) return false;
        const r = calculatedRoute.value;
        for (let i = 0; i < r.length - 1; i++) {
          if ((r[i] === u && r[i + 1] === v) || (r[i] === v && r[i + 1] === u)) {
            return true;
          }
        }
        return false;
      }

      // ------------------------------------------------------------------------
      // 5. ADJACENCY MATRIX (Relations)
      // ------------------------------------------------------------------------
      const adjacencyMatrix = computed(() => {
        const n = nodeIds.length;
        const mat = Array.from({ length: n }, () => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
          const u = nodeIds[i];
          const neighbors = baseGraph[u] || [];
          for (const v of neighbors) {
            if (!isEdgeBlocked(u, v)) {
              const j = nodeIds.indexOf(v);
              if (j !== -1) mat[i][j] = 1;
            }
          }
        }
        return mat;
      });

      // ------------------------------------------------------------------------
      // 6. WARSHALL'S ALGORITHM (Reachability & Transitive Closure)
      // ------------------------------------------------------------------------
      const transitiveClosure = computed(() => {
        const n = adjacencyMatrix.value.length;
        const closure = adjacencyMatrix.value.map(row => [...row]);

        for (let k = 0; k < n; k++) {
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              if (closure[i][j] === 1 || (closure[i][k] === 1 && closure[k][j] === 1)) {
                closure[i][j] = 1;
              }
            }
          }
        }
        return closure;
      });

      const reachStart = ref('A');
      const reachDestination = ref('EXIT');
      const reachResultText = ref('Click "Check Reachability" to test.');
      const isReachable = ref(null);

      function checkReachability() {
        const u = nodeIds.indexOf(reachStart.value);
        const v = nodeIds.indexOf(reachDestination.value);

        if (u === -1 || v === -1) return;

        const reachable = transitiveClosure.value[u][v] === 1;
        isReachable.value = reachable;
        reachResultText.value = reachable
          ? `✅ YES — Location ${reachStart.value} can reach Location ${reachDestination.value}.`
          : `❌ NO — Location ${reachStart.value} cannot reach Location ${reachDestination.value}.`;

        syncLegacyDom();
      }

      // ------------------------------------------------------------------------
      // 7. PROPOSITIONAL LOGIC
      // ------------------------------------------------------------------------
      const logicP = computed(() => calculatedRoute.value !== null);
      const logicQ = computed(() => exitStatus.value === 'available');
      const logicPandQ = computed(() => logicP.value && logicQ.value);

      // ------------------------------------------------------------------------
      // 8. EMERGENCY RESOURCES (Function Mapping f: V -> R)
      // ------------------------------------------------------------------------
      const resourceLocation = ref('A');
      const resourceResult = computed(() => {
        const node = nodes.find(n => n.id === resourceLocation.value);
        return node ? `${node.icon} ${node.resource}` : 'None';
      });

      // ------------------------------------------------------------------------
      // 9. BACKWARD COMPATIBILITY DOM SYNC
      // ------------------------------------------------------------------------
      function syncLegacyDom() {
        nextTick(() => {
          const elExit = document.getElementById('statusExit');
          if (elExit) elExit.textContent = exitStatus.value === 'available' ? 'AVAILABLE' : 'UNAVAILABLE';

          const elBlocked = document.getElementById('statusBlocked');
          if (elBlocked) elBlocked.textContent = blockedEdges.value.size;

          const elRoute = document.getElementById('statusRoute');
          if (elRoute) elRoute.textContent = routeStatusText.value;

          const elRouteRes = document.getElementById('routeResult');
          if (elRouteRes) {
            elRouteRes.innerHTML = calculatedRoute.value
              ? `<strong>Route Found:</strong> ${calculatedRoute.value.join(' → ')}`
              : `<strong>No route available.</strong>`;
          }

          const elRouteStat = document.getElementById('routeStatus');
          if (elRouteStat) elRouteStat.textContent = routeStatusText.value;

          const elBlockedRes = document.getElementById('blockedPathResult');
          if (elBlockedRes) {
            elBlockedRes.textContent = blockedEdges.value.size === 0
              ? 'No paths are currently blocked.'
              : `Blocked: ${Array.from(blockedEdges.value).join(', ')}`;
          }

          const elReach = document.getElementById('reachabilityResult');
          if (elReach && reachResultText.value) elReach.textContent = reachResultText.value;

          const elP = document.getElementById('logicP');
          if (elP) elP.textContent = logicP.value ? 'TRUE ✓' : 'FALSE ✗';
          const elQ = document.getElementById('logicQ');
          if (elQ) elQ.textContent = logicQ.value ? 'TRUE ✓' : 'FALSE ✗';
          const elRes = document.getElementById('logicResult');
          if (elRes) elRes.textContent = logicPandQ.value ? 'TRUE ✓' : 'FALSE ✗';
        });
      }

      watch([selectedStart, selectedExit, exitStatus], () => {
        calculateSafeRoute();
      });

      onMounted(() => {
        document.documentElement.setAttribute('data-theme', currentTheme.value);
        calculateSafeRoute();
        checkReachability();
      });

      return {
        currentTheme,
        toggleTheme,
        nodes,
        nodeIds,
        startOptions,
        edges,
        selectedStart,
        selectedExit,
        exitStatus,
        blockedEdges,
        selectedBlockedEdge,
        activeTab,
        calculatedRoute,
        routeStatusText,
        isRouteSafe,
        isEdgeBlocked,
        isEdgeInRoute,
        calculateSafeRoute,
        toggleEdge,
        blockSelectedEdge,
        resetAllPaths,
        selectNodeAsStart,
        adjacencyMatrix,
        transitiveClosure,
        reachStart,
        reachDestination,
        reachResultText,
        isReachable,
        checkReachability,
        logicP,
        logicQ,
        logicPandQ,
        resourceLocation,
        resourceResult
      };
    }
  });

  app.mount('#app');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEvacuationApp);
} else {
  initEvacuationApp();
}