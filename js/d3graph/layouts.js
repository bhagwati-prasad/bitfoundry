(function(window){
    const d3 = window.d3;

    function resolveLayoutName(data, viewStack, rootData) {
        if (data && data.d3Layout) return data.d3Layout;
        if (!viewStack || viewStack.length === 0) {
            return (rootData && rootData.d3Layout) || 'hierarchy.tree';
        }
        for (let i = viewStack.length - 2; i >= 0; i--) {
            const item = viewStack[i];
            if (item && item.d3Layout) return item.d3Layout;
        }
        return (rootData && rootData.d3Layout) || 'hierarchy.tree';
    }

    // Apply a rope layout: a dominant spine (longest path) with compact side-branches.
    function applyRopeLayout(nodes, links, config = {}) {
        if (!d3) return false;
        if (!nodes || nodes.length === 0) return false;
        const width = config.width || 800;
        const height = config.height || 600;
        const margin = config.margin || 50;

        // Build neighbor map (undirected)
        const neighbors = new Map();
        function addEdge(a,b){ if(!neighbors.has(a)) neighbors.set(a, new Set()); neighbors.get(a).add(b); }
        links.forEach(l => {
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            if (!s || !t) return;
            addEdge(s,t); addEdge(t,s);
        });

        const ids = nodes.map(n => n.id);
        if (!ids.length) return false;

        // BFS farthest helper
        function bfsFarthest(startId){
            const q = [startId];
            const visited = new Set([startId]);
            const parent = new Map();
            let last = startId;
            while(q.length){
                const u = q.shift();
                last = u;
                const neigh = neighbors.get(u) ? Array.from(neighbors.get(u)) : [];
                for(const v of neigh){
                    if(!visited.has(v)){
                        visited.add(v);
                        parent.set(v,u);
                        q.push(v);
                    }
                }
            }
            return { node: last, parent };
        }

        // Pick an arbitrary start and find diameter endpoints A,B
        const start = ids[0];
        const A = bfsFarthest(start).node;
        const bfsFromA = bfsFarthest(A);
        const B = bfsFromA.node;

        // Reconstruct path A->B
        const pathIds = [];
        let cur = B;
        while(cur !== undefined){ pathIds.push(cur); if (cur === A) break; cur = bfsFromA.parent.get(cur); }
        pathIds.reverse();
        if (pathIds.length === 0) return false;

        // Map id->node
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        // Layout spine
        const spine = pathIds;
        const spineSet = new Set(spine);
        const maxR = Math.max(20, ...nodes.map(n => n.r || 20));
        const centerX = width / 2;
        const amplitude = config.amplitude || Math.min(width * 0.22, Math.max(80, maxR * 6));
        const vy = (height - margin * 2) / (spine.length + 1);
        const branchStep = config.branchStep || Math.max(maxR * 3, 60);
        const spacing = config.branchSpacing || Math.min(vy * 0.6, 40);

        spine.forEach((id, i) => {
            const n = nodeMap.get(id);
            if (!n) return;
            const sign = (i % 2 === 0) ? 1 : -1;
            n.x = centerX + sign * amplitude;
            n.y = margin + (i + 1) * vy;
            n.__spineIndex = i;
        });

        // Discover and layout branches per spine node
        const globalVisited = new Set(spine);
        for (const id of spine) {
            const anchor = nodeMap.get(id);
            if (!anchor) continue;
            const neigh = neighbors.get(id) ? Array.from(neighbors.get(id)) : [];
            const sign = (anchor.__spineIndex % 2 === 0) ? 1 : -1;
            for (const nb of neigh) {
                if (spineSet.has(nb) || globalVisited.has(nb)) continue;
                // BFS to collect branch nodes and depths
                const queue = [{id: nb, depth: 1}];
                const branchNodes = [];
                const localVisited = new Set([id]);
                localVisited.add(nb);
                globalVisited.add(nb);
                while(queue.length){
                    const item = queue.shift();
                    branchNodes.push(item);
                    const adj = neighbors.get(item.id) ? Array.from(neighbors.get(item.id)) : [];
                    for (const v of adj) {
                        if (localVisited.has(v) || spineSet.has(v)) continue;
                        localVisited.add(v); globalVisited.add(v);
                        queue.push({id: v, depth: item.depth + 1});
                    }
                }

                // Group by depth
                const depthBuckets = new Map();
                branchNodes.forEach(b => {
                    if (!depthBuckets.has(b.depth)) depthBuckets.set(b.depth, []);
                    depthBuckets.get(b.depth).push(b.id);
                });

                // Assign positions: for each depth, spread vertically around anchor.y
                for (const [depth, idsAtDepth] of depthBuckets.entries()){
                    const len = idsAtDepth.length;
                    const yStart = anchor.y - ((len - 1) / 2) * spacing;
                    idsAtDepth.forEach((nid, idx) => {
                        const nobj = nodeMap.get(nid);
                        if (!nobj) return;
                        nobj.x = anchor.x + sign * (depth * branchStep);
                        nobj.y = yStart + idx * spacing;
                    });
                }
            }
        }

        // Rewire link endpoints to node objects so rendering can use d.source.x / d.target.x
        links.forEach(l => {
            const sId = typeof l.source === 'object' ? l.source.id : l.source;
            const tId = typeof l.target === 'object' ? l.target.id : l.target;
            l.source = nodeMap.get(sId) || l.source;
            l.target = nodeMap.get(tId) || l.target;
        });

        return true;
    }

    // Apply a simple hierarchy-based layout using links as parent->child edges.
    // `config` should contain { width, height } to size the layout; if omitted defaults are used.
    function applyHierarchyLayout(nodes, links, options = {}, config = {}) {
        if (!d3) return false;
        const width = config.width || 800;
        const height = config.height || 600;
        const margin = options.margin || 50;

        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const clones = new Map();
        nodes.forEach(n => clones.set(n.id, { id: n.id, __orig: n, children: [] }));

        const childSet = new Set();
        links.forEach(l => {
            const sId = typeof l.source === 'object' ? l.source.id : l.source;
            const tId = typeof l.target === 'object' ? l.target.id : l.target;
            const sClone = clones.get(sId);
            const tClone = clones.get(tId);
            if (sClone && tClone) {
                sClone.children.push(tClone);
                childSet.add(tId);
            }
        });

        const roots = Array.from(clones.values()).filter(c => !childSet.has(c.id));
        if (!roots || roots.length === 0) return false;

        const virtualRoot = { id: '__virtual_root__', children: roots };
        const hierarchyRoot = d3.hierarchy(virtualRoot, d => d.children);

        const treeLayout = d3.tree().size([height - margin * 2, width - margin * 2]);
        treeLayout(hierarchyRoot);

        hierarchyRoot.each(d => {
            if (!d.data || !d.data.id || d.data.id === '__virtual_root__') return;
            const clone = clones.get(d.data.id);
            if (!clone || !clone.__orig) return;
            const orig = clone.__orig;
            if (options.orientation === 'vertical') {
                orig.x = d.y + margin;
                orig.y = d.x + margin;
            } else {
                orig.x = d.x + margin;
                orig.y = d.y + margin;
            }
        });

        links.forEach(l => {
            const sId = typeof l.source === 'object' ? l.source.id : l.source;
            const tId = typeof l.target === 'object' ? l.target.id : l.target;
            l.source = nodeMap.get(sId) || l.source;
            l.target = nodeMap.get(tId) || l.target;
        });

        return true;
    }

    const layoutRegistry = {
        'hierarchy.tree': (nodes, links, config) => applyHierarchyLayout(nodes, links, { orientation: 'vertical' }, config),
        'hierarchy.rope': (nodes, links, config) => applyRopeLayout(nodes, links, config)
    };

    window.D3Layouts = {
        resolveLayoutName,
        applyHierarchyLayout,
        applyRopeLayout,
        layoutRegistry
    };

})(window);