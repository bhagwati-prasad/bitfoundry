// Ecosystem Graph Builder - Builder Mode Logic

class EcosystemGraphBuilder {
    constructor(graph, entityGroups, config = {}) {
        this.graph = graph;
        this.groups = entityGroups;
        this.config = {
            linkSnapDistance: 40,
            ...config
        };

        this.isBuilderMode = false;
        this.contextMenu = new ContextMenu('builder-context-menu');
        this.propertyEditor = new PropertyEditor('property-editor-modal');
        this.propertyEditor.setGroups(this.groups);

        // Drag state for link creation
        this.dragState = {
            active: false,
            sourceNode: null,
            line: null
        };

        // Store references to builder elements
        this.builderElements = {
            joinIcons: null,
            editIcons: null,
            deleteIcons: null,
            drillDownIcons: null
        };

        this._initContextMenu();
    }

    _initContextMenu() {
        // Context menu is populated dynamically based on what was clicked
        // (canvas, node, link, etc.)
    }

    enableBuilderMode() {
        this.isBuilderMode = true;
        this._attachBuilderEvents();
        this._updateGraphForBuilder();
        console.log('Builder mode enabled');
    }

    disableBuilderMode() {
        this.isBuilderMode = false;
        this._detachBuilderEvents();
        this._removeBuilderElements();
        console.log('Builder mode disabled');
    }

    _attachBuilderEvents() {
        // Right-click on canvas to create node
        this.graph.svg.on('contextmenu', (event) => {
            event.preventDefault();
            if (this.isBuilderMode) {
                const [x, y] = d3.pointer(event);
                this._showCanvasContextMenu(event.pageX, event.pageY, x, y);
            }
        });
    }

    _detachBuilderEvents() {
        this.graph.svg.on('contextmenu', null);
        this.contextMenu.hide();
    }

    _showCanvasContextMenu(pageX, pageY, graphX, graphY) {
        this.contextMenu.clear();
        this.contextMenu.addItem({
            label: 'Create Node',
            icon: '➕',
            action: () => this._createNewNode(graphX, graphY)
        });
        this.contextMenu.show(pageX, pageY);
    }

    _showNodeContextMenu(pageX, pageY, nodeData) {
        this.contextMenu.clear();
        this.contextMenu.addItem({
            label: 'Edit Properties',
            icon: '✏️',
            action: () => this._editNode(nodeData)
        });
        this.contextMenu.addItem({
            label: 'Delete Node',
            icon: '🗑️',
            action: () => this._deleteNode(nodeData.id)
        });
        this.contextMenu.addSeparator();
        this.contextMenu.addItem({
            label: nodeData.subGraph ? 'Enter Subgraph' : 'Create Subgraph',
            icon: '📊',
            action: () => this._handleDrillDown(nodeData)
        });
        this.contextMenu.show(pageX, pageY);
    }

    _showLinkContextMenu(pageX, pageY, linkData) {
        this.contextMenu.clear();
        this.contextMenu.addItem({
            label: 'Edit Properties',
            icon: '✏️',
            action: () => this._editLink(linkData)
        });
        this.contextMenu.addItem({
            label: 'Delete Link',
            icon: '🗑️',
            action: () => this._deleteLink(linkData.id)
        });
        this.contextMenu.show(pageX, pageY);
    }

    _createNewNode(x, y) {
        const nodeId = GraphUtils.generateUUID();
        const currentData = this.graph.getCurrentData();

        // Validate unique ID
        if (!GraphUtils.validateUniqueNodeId(nodeId, currentData.nodes)) {
            return;
        }

        const newNode = {
            id: nodeId,
            label: 'New Node',
            group: 'default',
            desc: '',
            r: this.groups.getRadius('default'),
            x: x,
            y: y
        };

        currentData.nodes.push(newNode);
        this.graph.render(currentData);
        this._updateGraphForBuilder();

        // Open property editor immediately
        this._editNode(newNode);
    }

    _editNode(nodeData) {
        // Find the actual node in current data
        const currentData = this.graph.getCurrentData();
        const node = currentData.nodes.find(n => n.id === nodeData.id);
        
        if (!node) return;

        this.propertyEditor.openForNode(node, (updatedNode) => {
            // Update node properties
            Object.assign(node, {
                label: updatedNode.label,
                desc: updatedNode.desc,
                group: updatedNode.group,
                r: this.groups.getRadius(updatedNode.group)
            });

            this.graph.render(currentData);
            this._updateGraphForBuilder();
        });
    }

    _deleteNode(nodeId) {
        const currentData = this.graph.getCurrentData();
        
        // Remove node
        const nodeIndex = currentData.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;

        currentData.nodes.splice(nodeIndex, 1);

        // Remove associated links
        currentData.links = currentData.links.filter(
            link => link.source.id !== nodeId && link.target.id !== nodeId
        );

        this.graph.render(currentData);
        this._updateGraphForBuilder();
    }

    _handleDrillDown(nodeData) {
        const currentData = this.graph.getCurrentData();
        const node = currentData.nodes.find(n => n.id === nodeData.id);
        
        if (!node) return;

        if (node.subGraph) {
            // Navigate to existing subgraph
            this.graph.navigateTo(node.subGraph);
        } else {
            // Create new empty subgraph
            node.subGraph = {
                id: GraphUtils.generateUUID(),
                label: `${node.label} Subgraph`,
                nodes: [],
                links: []
            };
            this.graph.navigateTo(node.subGraph);
        }
        
        this._updateGraphForBuilder();
    }

    _editLink(linkData) {
        const currentData = this.graph.getCurrentData();
        const link = currentData.links.find(l => l.id === linkData.id);
        
        if (!link) return;

        this.propertyEditor.openForLink(link, (updatedLink) => {
            // Update link properties
            Object.assign(link, {
                type: updatedLink.type,
                label: updatedLink.label,
                direction: updatedLink.direction
            });

            this.graph.render(currentData);
            this._updateGraphForBuilder();
        });
    }

    _deleteLink(linkId) {
        const currentData = this.graph.getCurrentData();
        
        const linkIndex = currentData.links.findIndex(l => l.id === linkId);
        if (linkIndex === -1) return;

        currentData.links.splice(linkIndex, 1);
        this.graph.render(currentData);
        this._updateGraphForBuilder();
    }

    _updateGraphForBuilder() {
        if (!this.isBuilderMode) return;

        // Remove existing builder elements
        this._removeBuilderElements();

        // Add builder-specific elements
        this._addBuilderIcons();
    }

    _removeBuilderElements() {
        if (this.builderElements.joinIcons) {
            this.builderElements.joinIcons.remove();
        }
        if (this.builderElements.editIcons) {
            this.builderElements.editIcons.remove();
        }
        if (this.builderElements.deleteIcons) {
            this.builderElements.deleteIcons.remove();
        }
        if (this.builderElements.drillDownIcons) {
            this.builderElements.drillDownIcons.remove();
        }
        if (this.dragState.line) {
            this.dragState.line.remove();
            this.dragState.line = null;
        }
    }

    _addBuilderIcons() {
        const nodes = this.graph.g.selectAll('.node');

        // Add Join Icon (empty dot at bottom for linking)
        this.builderElements.joinIcons = nodes.append('g')
            .attr('class', 'builder-icon join-icon')
            .attr('transform', d => `translate(0, ${d.r})`)
            .style('cursor', 'crosshair')
            .on('mousedown', (event, d) => {
                event.stopPropagation();
                this._startLinkDrag(event, d);
            });

        this.builderElements.joinIcons.append('circle')
            .attr('r', 8)
            .attr('fill', '#fff')
            .attr('stroke', '#16a34a')
            .attr('stroke-width', 2);

        // Add Edit Icon (pencil at top-right)
        this.builderElements.editIcons = nodes.append('g')
            .attr('class', 'builder-icon edit-icon')
            .attr('transform', d => `translate(${d.r * 0.7}, -${d.r * 0.7})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                this._editNode(d);
            });

        this.builderElements.editIcons.append('circle')
            .attr('r', 9)
            .attr('fill', '#fff')
            .attr('stroke', '#f59e0b');

        this.builderElements.editIcons.append('text')
            .text('✏')
            .attr('text-anchor', 'middle')
            .attr('dy', '4px')
            .attr('fill', '#f59e0b')
            .style('font-size', '10px')
            .style('pointer-events', 'none');

        // Add Delete Icon (minus at top-left)
        this.builderElements.deleteIcons = nodes.append('g')
            .attr('class', 'builder-icon delete-icon')
            .attr('transform', d => `translate(-${d.r * 0.7}, -${d.r * 0.7})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                if (confirm(`Delete node "${d.label}"?`)) {
                    this._deleteNode(d.id);
                }
            });

        this.builderElements.deleteIcons.append('circle')
            .attr('r', 9)
            .attr('fill', '#fff')
            .attr('stroke', '#ef4444');

        this.builderElements.deleteIcons.append('text')
            .text('−')
            .attr('text-anchor', 'middle')
            .attr('dy', '4px')
            .attr('fill', '#ef4444')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none');

        // Add Drill-Down Icon (center icon for subgraph)
        this.builderElements.drillDownIcons = nodes.append('g')
            .attr('class', 'builder-icon drilldown-icon')
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                this._handleDrillDown(d);
            });

        this.builderElements.drillDownIcons.append('circle')
            .attr('r', 10)
            .attr('fill', '#fff')
            .attr('stroke', '#8b5cf6');

        this.builderElements.drillDownIcons.append('text')
            .text('📊')
            .attr('text-anchor', 'middle')
            .attr('dy', '4px')
            .attr('fill', '#8b5cf6')
            .style('font-size', '10px')
            .style('pointer-events', 'none');

        // Add context menu for links
        const links = this.graph.g.selectAll('.icon-interaction-info');
        links.on('contextmenu', (event, d) => {
            event.preventDefault();
            event.stopPropagation();
            this._showLinkContextMenu(event.pageX, event.pageY, d);
        });

        // Add context menu for nodes
        nodes.on('contextmenu', (event, d) => {
            event.preventDefault();
            event.stopPropagation();
            this._showNodeContextMenu(event.pageX, event.pageY, d);
        });
    }

    _startLinkDrag(event, sourceNode) {
        this.dragState.active = true;
        this.dragState.sourceNode = sourceNode;

        // Create temporary line
        this.dragState.line = this.graph.g.append('line')
            .attr('class', 'temp-link-line')
            .attr('stroke', '#16a34a')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('x1', sourceNode.x)
            .attr('y1', sourceNode.y)
            .attr('x2', sourceNode.x)
            .attr('y2', sourceNode.y);

        // Mouse move handler
        const onMouseMove = (e) => {
            if (!this.dragState.active) return;
            
            const [x, y] = d3.pointer(e, this.graph.g.node());
            this.dragState.line
                .attr('x2', x)
                .attr('y2', y);
        };

        // Mouse up handler
        const onMouseUp = (e) => {
            if (!this.dragState.active) return;

            const [x, y] = d3.pointer(e, this.graph.g.node());
            const targetNode = this._findNodeAtPosition(x, y);

            if (targetNode && targetNode.id !== sourceNode.id) {
                // Validate no self-loop
                if (GraphUtils.validateNoSelfLoop(sourceNode.id, targetNode.id)) {
                    this._createLink(sourceNode, targetNode);
                }
            }

            // Cleanup
            if (this.dragState.line) {
                this.dragState.line.remove();
            }
            this.dragState.active = false;
            this.dragState.sourceNode = null;
            this.dragState.line = null;

            this.graph.svg.on('mousemove', null);
            this.graph.svg.on('mouseup', null);
        };

        this.graph.svg.on('mousemove', onMouseMove);
        this.graph.svg.on('mouseup', onMouseUp);
    }

    _findNodeAtPosition(x, y) {
        const currentData = this.graph.getCurrentData();
        return currentData.nodes.find(node => {
            return GraphUtils.isWithinDistance(x, y, node.x, node.y, node.r + this.config.linkSnapDistance);
        });
    }

    _createLink(sourceNode, targetNode) {
        const currentData = this.graph.getCurrentData();
        const linkId = GraphUtils.generateUUID();

        const newLink = {
            id: linkId,
            source: sourceNode.id,
            target: targetNode.id,
            type: 'flow',
            label: '',
            direction: 'forward'
        };

        currentData.links.push(newLink);
        this.graph.render(currentData);
        this._updateGraphForBuilder();

        // Open property editor for new link
        // Need to find the link object after render (it gets transformed by D3)
        setTimeout(() => {
            const link = currentData.links.find(l => l.id === linkId);
            if (link) {
                this._editLink(link);
            }
        }, 100);
    }

    // Export current graph data
    exportData() {
        const data = this.graph.rootData;
        GraphUtils.exportToJSON(data, 'ecosystem_graph_export.json');
    }

    // Import graph data
    importData(callback) {
        GraphUtils.importFromJSON((data) => {
            if (data && data.nodes && data.links) {
                // Validate and load data
                this.graph.rootData = data;
                this.graph.viewStack = [];
                this.graph._hydrateData(data);
                this.graph.navigateTo(data);
                
                if (this.isBuilderMode) {
                    this._updateGraphForBuilder();
                }

                if (callback) callback(data);
            } else {
                alert('Invalid graph data format');
            }
        });
    }
}
