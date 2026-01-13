function constructGraph() {
    const modalHandler = new GraphModal("#modal");

    const groupData = {
        central: { color: "#2563eb", label: "Central Unit" },
        ou: { color: "#059669", label: "Operating Unit" },
        end: { color: "#d97706", label: "End User" },
        support: { color: "#7c3aed", label: "Support System" },
        internal: { color: "#475569", label: "Internal Component" }
    };
    const myGroups = new EntityGroups(groupData);
    myGroups.renderLegend("#legend");

    const graph = new EcosystemGraph(ecosystemData, myGroups, {
        containerId: "#graph-container",
        callbacks: {
            onEntityClick: (data) => modalHandler.open(data, 'entity'),
            onFlowClick: (data) => modalHandler.open(data, 'interaction')
        }
    });
}
function sampleGraph() {
    const groups = new EntityGroups({ central: { color: 'blue' } });
    const graph = new EcosystemGraph(data, groups, { containerId: '#graph-container' });

    // 2. Add a new node (e.g., via a button click)
    const newNode = graph.addNode({
        id: "new_service",
        label: "New Service",
        group: "central",
        x: 400, // Optional initial X
        y: 300  // Optional initial Y
    });

    // 3. Link it to an existing node
    graph.addLink("new_service", "bbpcu");

    // 4. Update it later
    graph.updateNode("new_service", { label: "Updated Service Name" });

    // 5. Delete it
    // graph.removeNode("new_service");
}

function constructGraphByDrillLevel(containerId, legendId) {
    //Adds entire subgraph in one go.
    // 1. Setup Groups & Legend (Matching the 'r' values in your data)
    const groups = new EntityGroups({
        central: { color: "#2563eb", label: "Central Unit", radius: 40 }, // Matches BBPCU
        ou: { color: "#059669", label: "Operating Unit", radius: 30 }, // Matches COU/BOU
        end: { color: "#d97706", label: "End User", radius: 25 }, // Matches Agent/Biller
        support: { color: "#7c3aed", label: "Support System", radius: 25 }, // Matches DMS/SGF
        internal: { color: "#475569", label: "Internal", radius: 25 } // Matches internal components
    });

    // Render visual legend
    groups.renderLegend(legendId);

    // 2. Initialize Graph with Empty Root
    // We start with an empty shell and build into it
    const emptyRoot = { id: "root", label: "Ecosystem", nodes: [], links: [] };

    const graph = new EcosystemGraph(emptyRoot, groups, {
        containerId: containerId
    });

    // =========================================================
    // LEVEL 3: Deepest Nested Structures
    // =========================================================

    const clearingDeepData = {
        id: "clearing_deep",
        label: "Clearing Logic",
        nodes: [
            { id: "net_calc", label: "Net Calc", group: "internal", r: 25, desc: "Calculates Pay-in/Pay-out." },
            { id: "collateral", label: "Collateral", group: "internal", r: 25, desc: "Checks bank guarantees." },
            { id: "file_gen", label: "File Gen", group: "end", r: 20, desc: "Generates settlement files for RTGS (Real Time Gross Settlement)." }
        ],
        links: [
            { source: "net_calc", target: "collateral", type: "internal", label: "Check" },
            { source: "net_calc", target: "file_gen", type: "internal", label: "Export" }
        ]
    };

    // =========================================================
    // LEVEL 2: Internal Architectures
    // =========================================================

    // BBPCU Internal (Contains Level 3)
    const bbpcuInternalData = {
        id: "bbpcu_internal",
        label: "BBPCU Internal",
        nodes: [
            { id: "switch", label: "Core Switch", group: "central", r: 35, desc: "Transaction Switching Engine." },
            { id: "router", label: "Router", group: "internal", r: 25, desc: "Routes based on Biller ID." },
            { id: "risk", label: "Risk Engine", group: "internal", r: 25, desc: "Fraud checks & velocity limits." },
            {
                id: "clearing", label: "Clearing Sys", group: "internal", r: 30,
                desc: "Net Settlement Calculation.<br>Click for Deep Dive.",
                subGraph: clearingDeepData // ATTACH LEVEL 3
            }
        ],
        links: [
            { source: "switch", target: "router", type: "internal", label: "Lookup" },
            { source: "switch", target: "risk", type: "internal", label: "Validate" },
            { source: "switch", target: "clearing", type: "internal", label: "Log" }
        ]
    };

    // COU Internal
    const couInternalData = {
        id: "cou_internal",
        label: "COU Internal",
        nodes: [
            { id: "cou_app", label: "App UI", group: "end", r: 25, desc: "Mobile/Web Interface." },
            { id: "cou_gw", label: "API Gateway", group: "ou", r: 30, desc: "Security & Rate Limiting." },
            { id: "cou_cbs", label: "Core Banking", group: "internal", r: 25, desc: "Ledger system." }
        ],
        links: [
            { source: "cou_app", target: "cou_gw", type: "flow", label: "HTTPS" },
            { source: "cou_gw", target: "cou_cbs", type: "internal", label: "Debit" }
        ]
    };

    // BOU Internal
    const bouInternalData = {
        id: "bou_internal",
        label: "BOU Internal",
        nodes: [
            { id: "bou_adapter", label: "Biller Adapter", group: "ou", r: 30, desc: "Format translation." },
            { id: "bou_recon", label: "Recon Engine", group: "internal", r: 25, desc: "Matches transactions." },
            { id: "ext_utility", label: "Utility API", group: "end", r: 25, desc: "External Biller System." }
        ],
        links: [
            { source: "bou_adapter", target: "ext_utility", type: "flow", label: "Fetch" },
            { source: "bou_adapter", target: "bou_recon", type: "internal", label: "Log" }
        ]
    };

    // =========================================================
    // LEVEL 1: Imperative Root Construction
    // =========================================================

    // 1. Add Nodes (Attaching the Level 2 subGraphs created above)

    // -- Central Node --
    graph.addNode({
        id: "bbpcu", label: "BBPCU", group: "central",
        desc: "<strong>Central Unit (NBBL)</strong>. The Hub.<br>Click to drill down into Switch Architecture.",
        subGraph: bbpcuInternalData
    });

    // -- Operating Units --
    graph.addNode({
        id: "cou", label: "COU", group: "ou",
        desc: "<strong>Customer Operating Unit</strong>. Bank/App.<br>Click for Internal Architecture.",
        subGraph: couInternalData
    });

    graph.addNode({
        id: "bou", label: "BOU", group: "ou",
        desc: "<strong>Biller Operating Unit</strong>. Connects Billers.<br>Click for Internal Architecture.",
        subGraph: bouInternalData
    });

    // -- Support Systems --
    graph.addNode({ id: "dms", label: "DMS", group: "support", desc: "Dispute Management System." });
    graph.addNode({ id: "sgf", label: "SGF", group: "support", desc: "Settlement Guarantee Fund." });

    // -- End Points --
    graph.addNode({ id: "agent", label: "Agent", group: "end", desc: "Physical or Digital touchpoint." });
    graph.addNode({ id: "customer", label: "Customer", group: "end", desc: "End User." });
    graph.addNode({ id: "biller", label: "Biller", group: "end", desc: "The Utility Company." });


    // 2. Add Links

    // We add a small helper to force labels onto links, 
    // in case the Class definition didn't fully support the label param in addLink.
    const addLabeledLink = (s, t, type, label) => {
        graph.addLink(s, t, type);
        // Post-update the link data to ensure label is present
        const data = graph.getCurrentData();
        const link = data.links.find(l =>
            (l.source.id === s || l.source === s) &&
            (l.target.id === t || l.target === t)
        );
        if (link) link.label = label;
    };

    // Customer Flow
    addLabeledLink("customer", "agent", "flow", "1. Init");
    addLabeledLink("agent", "cou", "flow", "2. Req");
    addLabeledLink("cou", "bbpcu", "flow", "3. Route");
    addLabeledLink("bbpcu", "bou", "flow", "4. Switch");
    addLabeledLink("bou", "biller", "flow", "5. Fetch");

    // Return Flow
    addLabeledLink("biller", "bou", "flow", "6. Data");
    addLabeledLink("bou", "bbpcu", "flow", "7. Resp");
    addLabeledLink("bbpcu", "cou", "flow", "8. Resp");
    addLabeledLink("cou", "agent", "flow", "9. Show");

    // Admin/Support Links
    addLabeledLink("bbpcu", "dms", "admin", "Disputes");
    addLabeledLink("bbpcu", "sgf", "admin", "Risk");

    // Force a re-render to ensure labels appear
    graph.render(graph.getCurrentData());

    return graph;
}

function constructGraphStepByStep(containerId, legendId) {
    // 1. Setup Groups & Legend
    const groups = new EntityGroups({
        central: { color: "#2563eb", label: "Central Unit", radius: 40 },
        ou: { color: "#059669", label: "Operating Unit", radius: 30 },
        end: { color: "#d97706", label: "End User", radius: 25 }, // Agents, Billers
        support: { color: "#7c3aed", label: "Support System", radius: 25 },
        internal: { color: "#475569", label: "Internal", radius: 25 },
        end_small: { color: "#d97706", label: "End User (Small)", radius: 20 } // For customer/file_gen
    });

    groups.renderLegend(legendId);

    // 2. Initialize Empty Graph
    const graph = new EcosystemGraph(
        { id: "root", label: "Ecosystem", nodes: [], links: [] },
        groups,
        { containerId: containerId }
    );

    // Helper to update link labels (since addLink defaults to "Link")
    const addLabeledLink = (s, t, type, label) => {
        graph.addLink(s, t, type);
        const data = graph.getCurrentData();
        const link = data.links.find(l =>
            (l.source.id === s || l.source === s) &&
            (l.target.id === t || l.target === t)
        );
        if (link) link.label = label;
    };

    // =========================================================
    // STEP 1: ROOT LAYER
    // =========================================================

    // -- Central Node --
    const bbpcu = graph.addNode({
        id: "bbpcu", label: "BBPCU", group: "central",
        desc: "<strong>Central Unit (NBBL)</strong>. The Hub.<br>Click to drill down into Switch Architecture."
    });

    // -- Operating Units --
    const cou = graph.addNode({
        id: "cou", label: "COU", group: "ou",
        desc: "<strong>Customer Operating Unit</strong>. Bank/App.<br>Click for Internal Architecture."
    });

    const bou = graph.addNode({
        id: "bou", label: "BOU", group: "ou",
        desc: "<strong>Biller Operating Unit</strong>. Connects Billers.<br>Click for Internal Architecture."
    });

    // -- Support & Ends --
    graph.addNode({ id: "dms", label: "DMS", group: "support", desc: "Dispute Management System." });
    graph.addNode({ id: "sgf", label: "SGF", group: "support", desc: "Settlement Guarantee Fund." });
    graph.addNode({ id: "agent", label: "Agent", group: "end", desc: "Physical or Digital touchpoint." });
    graph.addNode({ id: "customer", label: "Customer", group: "end_small", desc: "End User." });
    graph.addNode({ id: "biller", label: "Biller", group: "end", desc: "The Utility Company." });

    // -- Root Links --
    addLabeledLink("customer", "agent", "flow", "1. Init");
    addLabeledLink("agent", "cou", "flow", "2. Req");
    addLabeledLink("cou", "bbpcu", "flow", "3. Route");
    addLabeledLink("bbpcu", "bou", "flow", "4. Switch");
    addLabeledLink("bou", "biller", "flow", "5. Fetch");
    addLabeledLink("biller", "bou", "flow", "6. Data");
    addLabeledLink("bou", "bbpcu", "flow", "7. Resp");
    addLabeledLink("bbpcu", "cou", "flow", "8. Resp");
    addLabeledLink("cou", "agent", "flow", "9. Show");
    addLabeledLink("bbpcu", "dms", "admin", "Disputes");
    addLabeledLink("bbpcu", "sgf", "admin", "Risk");


    // =========================================================
    // STEP 2: BUILD BBPCU INTERNAL (Level 2)
    // =========================================================

    // 1. Prepare Parent
    bbpcu.subGraph = { id: "bbpcu_internal", label: "BBPCU Internal", nodes: [], links: [] };

    // 2. Dive In
    graph.navigateTo(bbpcu.subGraph);

    // 3. Add Level 2 Nodes
    graph.addNode({ id: "switch", label: "Core Switch", group: "central", desc: "Transaction Switching Engine. Receive and forward transaction requests.", r: 35 });
    graph.addNode({ id: "router", label: "Router", group: "internal", desc: "Routes based on Biller ID." });
    graph.addNode({ id: "risk", label: "Risk Engine", group: "internal", desc: "Fraud checks & velocity limits." });

    const clearing = graph.addNode({
        id: "clearing", label: "Clearing Sys", group: "internal",
        desc: "Net Settlement Calculation.<br>Click for Deep Dive.", r: 30
    });

    // 4. Add Level 2 Links
    addLabeledLink("switch", "router", "internal", "Lookup");
    addLabeledLink("switch", "risk", "internal", "Validate");
    addLabeledLink("switch", "clearing", "internal", "Log");

    // =========================================================
    // STEP 3: BUILD CLEARING LOGIC (Level 3 - Inside BBPCU)
    // =========================================================

    // 1. Prepare Parent
    clearing.subGraph = { id: "clearing_deep", label: "Clearing Logic", nodes: [], links: [] };

    // 2. Dive In (We are now 2 levels deep)
    graph.navigateTo(clearing.subGraph);

    // 3. Add Level 3 Nodes
    graph.addNode({ id: "net_calc", label: "Net Calc", group: "internal", desc: "Calculates Pay-in/Pay-out." });
    graph.addNode({ id: "collateral", label: "Collateral", group: "internal", desc: "Checks bank guarantees." });
    graph.addNode({ id: "file_gen", label: "File Gen", group: "end_small", desc: "Generates settlement files for RTGS (Real Time Gross Settlement)." });

    // 4. Add Level 3 Links
    addLabeledLink("net_calc", "collateral", "internal", "Check");
    addLabeledLink("net_calc", "file_gen", "internal", "Export");

    // 5. Exit Level 3 & Level 2 (Back to Root)
    graph.navigateBackTo(0);


    // =========================================================
    // STEP 4: BUILD COU INTERNAL (Level 2)
    // =========================================================

    // 1. Prepare Parent
    cou.subGraph = { id: "cou_internal", label: "COU Internal", nodes: [], links: [] };

    // 2. Dive In
    graph.navigateTo(cou.subGraph);

    // 3. Add Nodes
    graph.addNode({ id: "cou_app", label: "App UI", group: "end", desc: "Mobile/Web Interface." });
    graph.addNode({ id: "cou_gw", label: "API Gateway", group: "ou", desc: "Security & Rate Limiting." });
    graph.addNode({ id: "cou_cbs", label: "Core Banking", group: "internal", desc: "Ledger system." });

    // 4. Add Links
    addLabeledLink("cou_app", "cou_gw", "flow", "HTTPS");
    addLabeledLink("cou_gw", "cou_cbs", "internal", "Debit");

    // 5. Exit (Back to Root)
    graph.navigateBackTo(0);


    // =========================================================
    // STEP 5: BUILD BOU INTERNAL (Level 2)
    // =========================================================

    // 1. Prepare Parent
    bou.subGraph = { id: "bou_internal", label: "BOU Internal", nodes: [], links: [] };

    // 2. Dive In
    graph.navigateTo(bou.subGraph);

    // 3. Add Nodes
    graph.addNode({ id: "bou_adapter", label: "Biller Adapter", group: "ou", desc: "Format translation." });
    graph.addNode({ id: "bou_recon", label: "Recon Engine", group: "internal", desc: "Matches transactions." });
    graph.addNode({ id: "ext_utility", label: "Utility API", group: "end", desc: "External Biller System." });

    // 4. Add Links
    addLabeledLink("bou_adapter", "ext_utility", "flow", "Fetch");
    addLabeledLink("bou_adapter", "bou_recon", "internal", "Log");

    // 5. Final Exit (Back to Root)
    graph.navigateBackTo(0);

    return graph;
}