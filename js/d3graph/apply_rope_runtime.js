window.graph = graph;
(function(){
  // Loads layouts.js if not already loaded, then applies rope layout to the current graph.
  function loadLayouts() {
    return new Promise((resolve, reject) => {
      if (window.D3Layouts) return resolve(window.D3Layouts);
      const s = document.createElement('script');
      s.src = '/js/d3graph/layouts.js';
      s.onload = () => {
        if (window.D3Layouts) resolve(window.D3Layouts);
        else reject(new Error('D3Layouts failed to initialize'));
      };
      s.onerror = () => reject(new Error('Failed to load layouts.js'));
      document.head.appendChild(s);
    });
  }

  async function applyRopeToGraph(instance) {
    const g = instance || window.graph;
    if (!g) {
      console.error('No graph instance found on window.graph; pass instance to applyRopeToGraph(graph)');
      return false;
    }

    try {
      await loadLayouts();
    } catch (err) {
      console.error('Could not load D3Layouts:', err);
      return false;
    }

    const D3Layouts = window.D3Layouts;
    if (!D3Layouts || !D3Layouts.layoutRegistry) {
      console.error('D3Layouts.layoutRegistry not available');
      return false;
    }

    const data = (typeof g.getCurrentData === 'function') ? g.getCurrentData() : (g.rootData || null);
    if (!data) {
      console.error('No current graph data found');
      return false;
    }

    // Create shallow clones for layout computation
    const nodes = (data.nodes || []).map(n => ({ ...n }));
    const links = (data.links || []).map(l => ({ ...l }));

    const layoutFn = D3Layouts.layoutRegistry['hierarchy.rope'];
    if (!layoutFn) {
      console.error('hierarchy.rope not registered in D3Layouts.layoutRegistry');
      return false;
    }

    // Run layout (will set x/y on clones and rewire link endpoints to node objects)
    const applied = layoutFn(nodes, links, { width: g.config.width, height: g.config.height });
    if (!applied) {
      console.warn('Rope layout did not apply (empty or unsupported graph)');
      return false;
    }

    // Build position map from layout output (do NOT mutate original data)
    const posMap = new Map(nodes.map(n => [n.id, { x: n.x, y: n.y }]));

    // Stop the simulation so DOM updates persist
    if (g.simulation && typeof g.simulation.stop === 'function') {
      try { g.simulation.stop(); } catch (e) { /* ignore */ }
    }

    // Apply positions only to the DOM elements (non-destructive)
    try {
      const svgg = d3.select(g.config.containerId).select('svg').select('g');

      // Update node positions
      svgg.selectAll('.node').each(function(d) {
        const dId = d && d.id;
        const p = posMap.get(dId);
        if (p) {
          d3.select(this).attr('transform', `translate(${p.x},${p.y})`);
        }
      });

      // Update link paths
      svgg.selectAll('.link').each(function(ld) {
        const sId = (typeof ld.source === 'object') ? ld.source.id : ld.source;
        const tId = (typeof ld.target === 'object') ? ld.target.id : ld.target;
        const sPos = posMap.get(sId);
        const tPos = posMap.get(tId);
        if (sPos && tPos) {
          const dx = tPos.x - sPos.x;
          const dy = tPos.y - sPos.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          d3.select(this).attr('d', `M${sPos.x},${sPos.y}A${dr},${dr} 0 0,1 ${tPos.x},${tPos.y}`);
        }
      });

      // Reposition link icons on actual path midpoints
      const linkNodes = svgg.selectAll('.link').nodes();
      svgg.selectAll('.icon-group.icon-interaction-info').each(function(d, i) {
        const pathNode = linkNodes[i];
        if (!pathNode || !pathNode.getTotalLength) return;
        const len = pathNode.getTotalLength();
        if (!isFinite(len) || len === 0) return;
        const pt = pathNode.getPointAtLength(len / 2);
        d3.select(this).attr('transform', `translate(${pt.x},${pt.y})`);
      });

    } catch (err) {
      console.error('Failed to apply rope layout to DOM:', err);
      return false;
    }

    // Expose a restore function to bring the graph back to its normal rendering
    window.restoreGraphLayout = function(instance) {
      const gg = instance || window.graph || g;
      if (!gg) return false;
      if (typeof gg.getCurrentData === 'function') {
        try {
          gg.render(gg.getCurrentData());
          return true;
        } catch (e) { console.error('restoreGraphLayout failed:', e); return false; }
      }
      return false;
    };

    return true;
  }

  // Expose function globally
  window.applyRopeLayoutToGraph = applyRopeToGraph;

  // Do NOT auto-run. Call `applyRopeLayoutToGraph(graph)` or `applyRopeLayoutToGraph()` from console when ready.
})();