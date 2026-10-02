// ==========================================
// EMERGENCY EVACUATION PLANNER
// STEP 5 - GRAPH + BFS + ROUTE HIGHLIGHT
// ==========================================


// ------------------------------------------
// 1. BUILDING GRAPH
// ------------------------------------------

const graph = {

    A: ["B", "D"],

    B: ["A", "C", "E"],

    C: ["B", "F"],

    D: ["A", "E"],

    E: ["B", "D", "F", "G"],

    F: ["C", "E"],

    G: ["E", "EXIT"],

    EXIT: ["G"]

};

// ------------------------------------------
// BLOCKED PATHS
// ------------------------------------------

const blockedEdges = new Set();
let currentRouteStatus = "NOT CALCULATED";
// ------------------------------------------
// 2. BFS FUNCTION
// ------------------------------------------

function findRoute(start, destination) {

    // Queue stores paths that we still need to check
    const queue = [[start]];

    // Keep track of locations we have already visited
    const visited = new Set();

    visited.add(start);


    // Continue until queue becomes empty
    while (queue.length > 0) {

        // Take the first path from the queue
        const currentPath = queue.shift();

        // Get the last location in this path
        const currentLocation =
            currentPath[currentPath.length - 1];


        // Check if we reached the destination
        if (currentLocation === destination) {

            return currentPath;
        }


        // Check all connected locations
        for (const neighbour of graph[currentLocation]) {

        // Create a key for the connection
        const edge1 = currentLocation + "-" + neighbour;
        const edge2 = neighbour + "-" + currentLocation;

        // Skip this connection if it is blocked
        if (blockedEdges.has(edge1) || blockedEdges.has(edge2)) {
            continue;
        }

        // Only visit a location once
        if (!visited.has(neighbour)) {

            visited.add(neighbour);

            // Create a new path
            const newPath = [...currentPath, neighbour];

            // Add the new path to the queue
            queue.push(newPath);
        }
    }
    }


    // No route found
    return null;
}


// ------------------------------------------
// 3. GET HTML ELEMENTS
// ------------------------------------------

const startSelect =
    document.getElementById("start");

const exitSelect =
    document.getElementById("exit");

const findRouteBtn =
    document.getElementById("findRouteBtn");

const routeResult =
    document.getElementById("routeResult");

const routeStatus =
    document.getElementById("routeStatus");

const blockedPathSelect = document.getElementById("blockedPath");
const blockPathBtn = document.getElementById("blockPathBtn");
const resetPathsBtn = document.getElementById("resetPathsBtn");

const blockedPathResult =
    document.getElementById("blockedPathResult");


// ------------------------------------------
// 4. EDGE MAP
// ------------------------------------------

// Maps graph connections to SVG line IDs

const edgeMap = {

    "A-B": "edge-A-B",
    "B-A": "edge-A-B",

    "B-C": "edge-B-C",
    "C-B": "edge-B-C",

    "A-D": "edge-A-D",
    "D-A": "edge-A-D",

    "B-E": "edge-B-E",
    "E-B": "edge-B-E",

    "C-F": "edge-C-F",
    "F-C": "edge-C-F",

    "D-E": "edge-D-E",
    "E-D": "edge-D-E",

    "E-F": "edge-E-F",
    "F-E": "edge-E-F",

    "E-G": "edge-E-G",
    "G-E": "edge-E-G",

    "G-EXIT": "edge-G-EXIT",
    "EXIT-G": "edge-G-EXIT"

};


// ------------------------------------------
// 5. CLEAR PREVIOUS ROUTE
// ------------------------------------------

function clearRouteHighlight() {

    const edges =
        document.querySelectorAll(".graph-lines line");

    edges.forEach(function (edge) {

        edge.classList.remove("route-edge");

    });
}


// ------------------------------------------
// 6. HIGHLIGHT ROUTE
// ------------------------------------------

function highlightRoute(route) {

    // Remove old highlighted route first
    clearRouteHighlight();


    // Go through every pair of locations in the route
    for (let i = 0; i < route.length - 1; i++) {

        const from = route[i];

        const to = route[i + 1];

        const edgeKey = from + "-" + to;

        const edgeId = edgeMap[edgeKey];

        const edge = document.getElementById(edgeId);


        // Highlight the edge
        if (edge) {

            edge.classList.add("route-edge");

        }
    }
}


// ------------------------------------------
// 7. BUTTON EVENT
// ------------------------------------------

findRouteBtn.addEventListener("click", function () {

    // Get selected starting location
    const start = startSelect.value;

    // Get selected exit
    const destination = exitSelect.value;


    // Find route using BFS
    const route =
        findRoute(start, destination);


    // Check whether route exists
      if (route !== null) {

    // Check whether the exit is available
    const exitAvailable =
        exitAvailability.value === "available";


    // Display the route
    routeResult.innerHTML =
        "<strong>Route Found:</strong> " +
        route.join(" → ");


    // Highlight the route
    highlightRoute(route);

    // Highlight route nodes
    highlightRouteNodes(route);

    // Update logic values
    updateSafetyLogic(route);


    // Check final safety condition
    const isSafe =
        route !== null && exitAvailable;


    if (isSafe) {

        routeStatus.innerHTML =
            "✅ SAFE ROUTE — " +
            "Steps: " +
            (route.length - 1);
        currentRouteStatus = "SAFE ROUTE FOUND";

    } else {

        routeStatus.innerHTML =
            "⚠️ ROUTE FOUND, BUT IT IS NOT SAFE " +
            "because the emergency exit is unavailable.";
            currentRouteStatus = "ROUTE FOUND - NOT SAFE";
    }
    updateStatusPanel();

}
    else {

        // No route found
        routeResult.innerHTML =
            "<strong>No route available.</strong>";

        routeStatus.innerHTML =
            "❌ The selected location cannot reach the exit.";

        // Remove previous highlighted route
        clearRouteHighlight();
        clearNodeHighlights();
        // Update logic safety check
        updateSafetyLogic(route);
        currentRouteStatus = "NO ROUTE AVAILABLE";
        updateStatusPanel();
    }

});
// ------------------------------------------
// BLOCK A PATH
// ------------------------------------------

blockPathBtn.addEventListener("click", function () {

    const selectedPath = blockedPathSelect.value;

    blockedEdges.add(selectedPath);

    const edgeId = edgeMap[selectedPath];

    const edge = document.getElementById(edgeId);

    if (edge) {
        edge.classList.add("blocked-edge");
    }

    blockedPathResult.innerHTML =
        "🚧 Blocked Path: " + selectedPath.replace("-", " ↔ ");
    currentRouteStatus = "RECALCULATE ROUTE";

    updateStatusPanel();  
});
// ------------------------------------------
// RESET ALL BLOCKED PATHS
// ------------------------------------------

resetPathsBtn.addEventListener("click", function () {

    blockedEdges.clear();

    const edges =
        document.querySelectorAll(".graph-lines line");

    edges.forEach(function (edge) {

        edge.classList.remove("blocked-edge");

    });

    blockedPathResult.innerHTML =
        "No paths are currently blocked.";

    clearRouteHighlight();
    clearNodeHighlights();
    routeResult.innerHTML =
        "Select a starting location and click " +
        "<strong>Find Safe Route</strong>.";

    routeStatus.innerHTML = "";
    currentRouteStatus = "NOT CALCULATED";
    updateStatusPanel();
});
// ==========================================
// STEP 7 - WARSHALL'S ALGORITHM
// ==========================================


// ------------------------------------------
// 1. LIST OF LOCATIONS
// ------------------------------------------

const locations = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "EXIT"
];


// ------------------------------------------
// 2. CREATE ADJACENCY MATRIX
// ------------------------------------------

function createAdjacencyMatrix() {

    const n = locations.length;

    // Create an n x n matrix filled with 0
    const matrix = Array.from(
        { length: n },
        () => Array(n).fill(0)
    );


    // Add available graph connections
    for (let i = 0; i < n; i++) {

        const currentLocation = locations[i];

        for (const neighbour of graph[currentLocation]) {

            // Check whether this edge is blocked
            const edge1 =
                currentLocation + "-" + neighbour;

            const edge2 =
                neighbour + "-" + currentLocation;

            if (
                blockedEdges.has(edge1) ||
                blockedEdges.has(edge2)
            ) {
                continue;
            }


            // Find neighbour's index
            const j = locations.indexOf(neighbour);

            if (j !== -1) {
                matrix[i][j] = 1;
            }
        }
    }

    return matrix;
}


// ------------------------------------------
// 3. WARSHALL'S ALGORITHM
// ------------------------------------------

function warshall(matrix) {

    const n = matrix.length;

    // Make a copy so the original matrix
    // is not changed
    const closure = matrix.map(row => [...row]);


    // Warshall's algorithm
    for (let k = 0; k < n; k++) {

        for (let i = 0; i < n; i++) {

            for (let j = 0; j < n; j++) {

                if (
                    closure[i][j] === 1 ||
                    (
                        closure[i][k] === 1 &&
                        closure[k][j] === 1
                    )
                ) {
                    closure[i][j] = 1;
                }
            }
        }
    }

    return closure;
}
// ------------------------------------------
// 4. GET REACHABILITY ELEMENTS
// ------------------------------------------

const reachStart =
    document.getElementById("reachStart");

const reachDestination =
    document.getElementById("reachDestination");

const checkReachabilityBtn =
    document.getElementById("checkReachabilityBtn");

const reachabilityResult =
    document.getElementById("reachabilityResult");
// Logic safety elements

const logicP =
    document.getElementById("logicP");

const logicQ =
    document.getElementById("logicQ");

const logicResult =
    document.getElementById("logicResult");

const exitAvailability =
    document.getElementById("exitAvailability");

const showMatrixBtn =
    document.getElementById("showMatrixBtn");

const matrixContainer =
    document.getElementById("matrixContainer");
const statusExit =
    document.getElementById("statusExit");

const statusBlocked =
    document.getElementById("statusBlocked");

const statusRoute =
    document.getElementById("statusRoute");
// ------------------------------------------
// 5. CHECK REACHABILITY
// ------------------------------------------

checkReachabilityBtn.addEventListener(
    "click",
    function () {

        const start = reachStart.value;

        const destination =
            reachDestination.value;


        // Create adjacency matrix
        const matrix =
            createAdjacencyMatrix();


        // Find transitive closure
        const closure =
            warshall(matrix);


        // Find matrix positions
        const startIndex =
            locations.indexOf(start);

        const destinationIndex =
            locations.indexOf(destination);


        // Check closure result
        if (
            closure[startIndex][destinationIndex] === 1
        ) {

            reachabilityResult.innerHTML =
                "✅ YES — " +
                start +
                " can reach " +
                destination +
                ".";

        } else {

            reachabilityResult.innerHTML =
                "❌ NO — " +
                start +
                " cannot reach " +
                destination +
                ".";

        }

    }
);
// ------------------------------------------
// LOGIC-BASED SAFETY CHECK
// ------------------------------------------

function updateSafetyLogic(route) {

    // P = A usable route exists
    const P = route !== null;


    // Q = Emergency exit is available
    const Q = exitAvailability.value === "available";


    // Logical AND
    const safe = P && Q;


    // Display P
    logicP.innerHTML = P
        ? "TRUE ✓"
        : "FALSE ✗";


    // Display Q
    logicQ.innerHTML = Q
        ? "TRUE ✓"
        : "FALSE ✗";


    // Display P AND Q
    logicResult.innerHTML = safe
        ? "TRUE ✓"
        : "FALSE ✗";
}

// ==========================================
// STEP 9 - EMERGENCY RESOURCE FUNCTION
// ==========================================


// ------------------------------------------
// 1. LOCATION → RESOURCE FUNCTION
// ------------------------------------------

const emergencyResources = {

    A: {
        name: "Fire Extinguisher",
        icon: "🧯"
    },

    B: {
        name: "First Aid Kit",
        icon: "🩹"
    },

    C: {
        name: "Fire Extinguisher",
        icon: "🧯"
    },

    D: {
        name: "First Aid Kit",
        icon: "🩹"
    },

    E: {
        name: "Emergency Alarm",
        icon: "🔔"
    },

    F: {
        name: "Fire Extinguisher",
        icon: "🧯"
    },

    G: {
        name: "Emergency Alarm",
        icon: "🔔"
    },

    EXIT: {
        name: "Emergency Exit",
        icon: "🚪"
    }

};
// ------------------------------------------
// 2. GET RESOURCE ELEMENTS
// ------------------------------------------

const resourceLocation =
    document.getElementById("resourceLocation");

const findResourceBtn =
    document.getElementById("findResourceBtn");

const resourceResult =
    document.getElementById("resourceResult");


// ------------------------------------------
// 3. FIND RESOURCE
// ------------------------------------------

findResourceBtn.addEventListener(
    "click",
    function () {

        const location =
            resourceLocation.value;

        const resource =
            emergencyResources[location];


        if (resource) {

            resourceResult.innerHTML = `
                <strong>${resource.icon}
                ${resource.name}</strong>
                <br>
                Location: ${location}
            `;

        } else {

            resourceResult.innerHTML =
                "No emergency resource available.";

        }

    }
);
// ==========================================
// STEP 12 - DISPLAY ADJACENCY MATRIX
// ==========================================

function displayAdjacencyMatrix() {

    // Create the current matrix
    const matrix = createAdjacencyMatrix();

    let html = '<table class="matrix-table">';


    // -------------------------------
    // Table header
    // -------------------------------

    html += "<tr>";

    html += "<th></th>";

    for (const location of locations) {

        html += `<th>${location}</th>`;

    }

    html += "</tr>";


    // -------------------------------
    // Table rows
    // -------------------------------

    for (let i = 0; i < locations.length; i++) {

        html += "<tr>";

        // Row name
        html += `<th>${locations[i]}</th>`;


        // Matrix values
        for (let j = 0; j < locations.length; j++) {

            html += `<td>${matrix[i][j]}</td>`;

        }

        html += "</tr>";
    }


    html += "</table>";

    // Display the table
    matrixContainer.innerHTML = html;
}
// ------------------------------------------
// SHOW MATRIX BUTTON
// ------------------------------------------

showMatrixBtn.addEventListener(
    "click",
    function () {

        displayAdjacencyMatrix();

    }
);
// ------------------------------------------
// CLEAR NODE HIGHLIGHTS
// ------------------------------------------

function clearNodeHighlights() {

    const nodes =
        document.querySelectorAll(".node");

    nodes.forEach(function (node) {

        node.classList.remove("route-node");
        node.classList.remove("start-node");

    });

}
// ------------------------------------------
// HIGHLIGHT ROUTE NODES
// ------------------------------------------

function highlightRouteNodes(route) {

    clearNodeHighlights();


    // Highlight all nodes in the route
    for (const location of route) {

        const node =
            document.getElementById("node-" + location);

        if (node) {

            node.classList.add("route-node");

        }
    }


    // Highlight the starting location separately
    const startLocation = route[0];

    const startNode =
        document.getElementById(
            "node-" + startLocation
        );

    if (startNode) {

        startNode.classList.add("start-node");

    }
}
// ==========================================
// STEP 15 - SYSTEM STATUS
// ==========================================

function updateStatusPanel() {

    // Update exit status
    const exitAvailable =
        exitAvailability.value === "available";

    statusExit.innerHTML =
        exitAvailable
            ? "AVAILABLE"
            : "UNAVAILABLE";


    // Update blocked path count
    statusBlocked.innerHTML =
        blockedEdges.size;


    // Update route status
    statusRoute.innerHTML =
        currentRouteStatus;
}
// ------------------------------------------
// EXIT STATUS CHANGE
// ------------------------------------------

exitAvailability.addEventListener(
    "change",
    function () {

        updateStatusPanel();

    }
);
updateStatusPanel();