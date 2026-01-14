class EcosystemGraph {
    constructor(data, entityGroups, config) {
        this.config = {
            containerId: "#graph-container",
            breadcrumbId: "#breadcrumbs",
            width: window.innerWidth,
            height: window.innerHeight,
            chargeStrength: -800,
            linkDistance: 160,
            collideStrength: 1,
            enforceBounds: true, // Keep nodes within viewport bounds
            // New Callbacks Config
            callbacks: {
                onEntityClick: null, // Click on Node "i" icon
                onFlowClick: null,   // Click on Link "i" icon
                onNodeClick: null    // Click on Node body (optional hook)
            },
            ...config
        };

        this.rootData = data;
        this.groups = entityGroups instanceof EntityGroups ? entityGroups : new EntityGroups();
        
        // If data has groups, load them into EntityGroups
        if (data.groups) {
            this.groups.groups.clear();
            Object.entries(data.groups).forEach(([key, value]) => {
                this.groups.add(key, value);
            });
        }
        
        this.viewStack = [];
        this.simulation = null;

        this.container = document.querySelector(this.config.containerId);
        this.breadcrumbContainer = document.querySelector(this.config.breadcrumbId);

        this.init();
    }

    init() {
        if (!this.container) throw new Error("Graph container not found");

        this.svg = d3.select(this.config.containerId).append("svg")
            .attr("width", this.config.width)
            .attr("height", this.config.height)
            .attr("viewBox", [0, 0, this.config.width, this.config.height]);

        this._createDefs();
        this.g = this.svg.append("g");

        this.svg.call(d3.zoom()
            .extent([[0, 0], [this.config.width, this.config.height]])
            .scaleExtent([0.1, 4])
            .on("zoom", ({ transform }) => this.g.attr("transform", transform)));

        this._hydrateData(this.rootData);
        this.navigateTo(this.rootData);

        window.addEventListener("resize", this._handleResize.bind(this));
    }

    _hydrateData(data) {
        if (data.nodes) {
            data.nodes.forEach(node => {
                node.r = this.groups.getRadius(node.group);
                if (node.subGraph) this._hydrateData(node.subGraph);
            });
        }
        // Ensure links have IDs
        if (data.links) {
            data.links.forEach(link => {
                if (!link.id) {
                    link.id = GraphUtils.generateUUID();
                }
            });
        }
    }

    getCurrentData() {
        return this.viewStack[this.viewStack.length - 1] || this.rootData;
    }

    addNode(props) {
        const currentData = this.getCurrentData();
        const groupKey = props.group || '3f4e5d6c-7b8a-49f0-ae1d-2c3b4a5e6d7f'; // Default group UUID

        if (currentData.nodes.find(n => n.id === props.id)) return;

        const newNode = {
            id: props.id,
            label: props.label || "New Node",
            group: groupKey,
            desc: props.desc || "",
            subGraph: props.subGraph || null,
            x: this.config.width / 2,
            y: this.config.height / 2
        };
        
        // Set radius from group
        newNode.r = this.groups.getRadius(groupKey);

        currentData.nodes.push(newNode);
        this.render(currentData);
        return newNode;
    }

    addLink(sourceId, targetId, type = "flow") {
        const currentData = this.getCurrentData();
        const s = currentData.nodes.find(n => n.id === sourceId);
        const t = currentData.nodes.find(n => n.id === targetId);

        if (!s || !t) return;

        const linkId = GraphUtils.generateUUID();
        currentData.links.push({ id: linkId, source: sourceId, target: targetId, type, label: "Link" });
        this.render(currentData);
    }

    updateNode(nodeId, updates) {
        const currentData = this.getCurrentData();
        const node = currentData.nodes.find(n => n.id === nodeId);
        if (!node) return;

        Object.assign(node, updates);
        if (updates.group) {
            node.r = this.groups.getRadius(updates.group);
        }
        this.render(currentData);
    }

    removeNode(nodeId) {
        const currentData = this.getCurrentData();
        const index = currentData.nodes.findIndex(n => n.id === nodeId);
        if (index === -1) return;

        currentData.nodes.splice(index, 1);
        this._cleanupNodeLinks(nodeId, currentData);
        this.render(currentData);
    }

    // Helper method to cleanup links when a node is removed
    _cleanupNodeLinks(nodeId, data) {
        data.links = data.links.filter(
            l => l.source.id !== nodeId && l.target.id !== nodeId
        );
    }

    removeLink(linkId) {
        const currentData = this.getCurrentData();
        const index = currentData.links.findIndex(l => l.id === linkId);
        if (index === -1) return;

        currentData.links.splice(index, 1);
        this.render(currentData);
    }

    navigateTo(graphData) {
        this.viewStack.push(graphData);
        this._hydrateData(graphData);
        this.render(graphData);
        this.updateBreadcrumbs();
    }

    navigateBackTo(index) {
        this.viewStack = this.viewStack.slice(0, index + 1);
        const targetData = this.viewStack[this.viewStack.length - 1];
        this.render(targetData);
        this.updateBreadcrumbs();
    }

    updateBreadcrumbs() {
        if (!this.breadcrumbContainer) return;
        this.breadcrumbContainer.innerHTML = "";

        this.viewStack.forEach((item, index) => {
            const crumb = document.createElement("div");
            crumb.className = `crumb ${index === this.viewStack.length - 1 ? 'active' : ''}`;
            crumb.innerText = item.label;

            if (index < this.viewStack.length - 1) {
                crumb.onclick = () => this.navigateBackTo(index);
            }

            this.breadcrumbContainer.appendChild(crumb);
            if (index < this.viewStack.length - 1) {
                const sep = document.createElement("span");
                sep.className = "separator";
                sep.innerText = ">";
                this.breadcrumbContainer.appendChild(sep);
            }
        });
    }

    render(data) {
        const nodes = data.nodes.map(d => ({ ...d }));
        const links = data.links.map(d => ({ ...d }));

        this.g.selectAll("*").remove();
        if (this.simulation) this.simulation.stop();

        this.simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(this.config.linkDistance))
            .force("charge", d3.forceManyBody().strength(this.config.chargeStrength))
            .force("center", d3.forceCenter(this.config.width / 2, this.config.height / 2))
            .force("collide", d3.forceCollide(d => d.r * this.config.collideStrength + 10));

        // Draw Links
        const link = this.g.append("g").selectAll("path")
            .data(links).join("path")
            .attr("class", "link")
            .attr("marker-end", "url(#arrow)")
            .attr("stroke-dasharray", d => d.type === 'admin' ? "4,4" : "0")
            .attr("fill", "none")
            .attr("stroke", "#94a3b8");

        // Draw Link Icons (Interaction)
        const linkIcon = this.g.append("g").selectAll("g")
            .data(links).join("g").attr("class", "icon-group icon-interaction-info")
            .style("cursor", "pointer")
            .on("click", (e, d) => {
                // Trigger callback
                if (this.config.callbacks.onFlowClick) {
                    this.config.callbacks.onFlowClick(d);
                }
            });

        linkIcon.append("circle").attr("r", 9).attr("fill", "#fff").attr("stroke", "#f97316");
        linkIcon.append("text").text("i").attr("text-anchor", "middle").attr("dy", "3.5px").attr("fill", "#f97316").style("font-size", "10px");

        // Draw Nodes
        const node = this.g.append("g").selectAll("g")
            .data(nodes).join("g")
            .attr("class", d => `node ${d.subGraph ? 'has-children' : ''}`)
            .style("cursor", d => d.subGraph ? "pointer" : "default")
            .call(d3.drag()
                .on("start", (e, d) => this._dragstarted(e, d))
                .on("drag", (e, d) => this._dragged(e, d))
                .on("end", (e, d) => this._dragended(e, d))
            )
            .on("click", (e, d) => {
                if (d.subGraph && !e.defaultPrevented) {
                    this.navigateTo(d.subGraph);
                }
                if (this.config.callbacks.onNodeClick) {
                    this.config.callbacks.onNodeClick(d);
                }
            });

        node.append("circle")
            .attr("r", d => d.r)
            .attr("fill", d => this.groups.getColor(d.group))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

        node.append("text").text(d => d.label)
            .attr("dy", d => d.r + 15).attr("text-anchor", "middle").style("font-size", "12px");

        // Draw Node Icons (Entity Info)
        const nodeIcon = node.append("g")
            .attr("class", "icon-group icon-node-info")
            .attr("transform", d => `translate(${d.r * 0.7}, -${d.r * 0.7})`)
            .style("cursor", "pointer")
            .on("click", (e, d) => {
                e.stopPropagation(); // Prevent drill-down
                // Trigger callback
                if (this.config.callbacks.onEntityClick) {
                    this.config.callbacks.onEntityClick(d);
                }
            });

        nodeIcon.append("circle").attr("r", 9).attr("fill", "#fff").attr("stroke", "#2563eb");
        nodeIcon.append("text").text("i").attr("text-anchor", "middle").attr("dy", "3.5px").attr("fill", "#2563eb").style("font-size", "10px");

        // Tick
        this.simulation.on("tick", () => {
            // Enforce bounds to keep nodes within viewport
            if (this.config.enforceBounds) {
                nodes.forEach(d => {
                    const padding = d.r || 20; // Use node radius or default padding
                    d.x = Math.max(padding, Math.min(this.config.width - padding, d.x));
                    d.y = Math.max(padding, Math.min(this.config.height - padding, d.y));
                });
            }

            link.attr("d", d => {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
            });
            linkIcon.attr("transform", d => {
                /*
                if (!d.source.x) return "";
                const midX = (d.source.x + d.target.x) / 2;
                const midY = (d.source.y + d.target.y) / 2;
                //return `translate(${midX},${midY})`;
                */

                const path = link.filter(l => l === d).node()
                if (!path) return

                const length = path.getTotalLength()
                const point = path.getPointAtLength(length / 2)
                return `translate(${point.x},${point.y})`;
            });
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });
    }

    _createDefs() {
        this.svg.append("defs").append("marker")
            .attr("id", "arrow").attr("viewBox", "0 -5 10 10")
            .attr("refX", 35).attr("refY", 0)
            .attr("markerWidth", 6).attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#cbd5e1");
    }
    _dragstarted(event, d) { if (!event.active) this.simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
    _dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    _dragended(event, d) { if (!event.active) this.simulation.alphaTarget(0); d.fx = null; d.fy = null; }
    _handleResize() {
        this.config.width = window.innerWidth;
        this.config.height = window.innerHeight;
        this.svg.attr("width", this.config.width).attr("height", this.config.height);
        if (this.simulation) this.simulation.force("center", d3.forceCenter(this.config.width / 2, this.config.height / 2)).alpha(1).restart();
    }
    destroy() {
        window.removeEventListener("resize", this._handleResize);
        this.svg.remove();
        if (this.simulation) this.simulation.stop();
    }
}