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
        document.body.classList.add('builder-mode-active');
        this._attachBuilderEvents();
        this._updateGraphForBuilder();
        this._updateLegend();
        
        // Show floating add node button
        const floatingBtn = document.getElementById('floating-add-node-btn');
        if (floatingBtn) {
            floatingBtn.style.display = 'flex';
        }
        
        console.log('Builder mode enabled');
    }

    disableBuilderMode() {
        this.isBuilderMode = false;
        document.body.classList.remove('builder-mode-active');
        this._detachBuilderEvents();
        this._removeBuilderElements();
        this._updateLegend();
        
        // Hide floating add node button
        const floatingBtn = document.getElementById('floating-add-node-btn');
        if (floatingBtn) {
            floatingBtn.style.display = 'none';
        }
        
        console.log('Builder mode disabled');
    }

    // Centralized legend update method
    _updateLegend() {
        this.groups.renderLegend('#legend', this.isBuilderMode);
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
            group: '3f4e5d6c-7b8a-49f0-ae1d-2c3b4a5e6d7f', // Default group UUID
            desc: '',
            x: x,
            y: y
        };
        
        // Set radius from group
        newNode.r = this.groups.getRadius(newNode.group);

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
                group: updatedNode.group
            });
            
            // Update radius from group
            node.r = this.groups.getRadius(updatedNode.group);

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

        // Remove associated links using graph's helper method
        this.graph._cleanupNodeLinks(nodeId, currentData);

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
        
        // Restore link icons to info icon in view mode
        const links = this.graph.g.selectAll('.icon-interaction-info');
        links.select('text')
            .text('i')
            .attr('dy', '3.5px');
        
        links.select('circle')
            .attr('stroke', '#f97316');
        
        links.select('text')
            .attr('fill', '#f97316');
    }

    _addBuilderIcons() {
        const nodes = this.graph.g.selectAll('.node');

        // Add Join Icon (empty dot at bottom for linking)
        this.builderElements.joinIcons = nodes.append('g')
            .attr('class', 'builder-icon join-icon')
            .attr('transform', d => `translate(0, ${d.r})`)
            .style('cursor', 'crosshair')
            .on('mousedown', (event, d) => {
                event.preventDefault();
                event.stopPropagation();
                this._startLinkDrag(event, d);
            })
            .on('mouseenter', function() {
                d3.select(this).select('circle').attr('r', 9.2);
            })
            .on('mouseleave', function() {
                d3.select(this).select('circle').attr('r', 8);
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
            })
            .on('mouseenter', function() {
                d3.select(this).select('circle').attr('r', 10.35);
                d3.select(this).select('text').style('font-size', '11.5px');
            })
            .on('mouseleave', function() {
                d3.select(this).select('circle').attr('r', 9);
                d3.select(this).select('text').style('font-size', '10px');
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
            })
            .on('mouseenter', function() {
                d3.select(this).select('circle').attr('r', 10.35);
                d3.select(this).select('text').style('font-size', '16.1px');
            })
            .on('mouseleave', function() {
                d3.select(this).select('circle').attr('r', 9);
                d3.select(this).select('text').style('font-size', '14px');
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
            })
            .on('mouseenter', function() {
                d3.select(this).select('circle').attr('r', 11.5);
                d3.select(this).select('text').style('font-size', '11.5px');
            })
            .on('mouseleave', function() {
                d3.select(this).select('circle').attr('r', 10);
                d3.select(this).select('text').style('font-size', '10px');
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

        // Add context menu for links in builder mode
        const links = this.graph.g.selectAll('.icon-interaction-info');
        
        // Change icon to pencil in builder mode to show it's editable
        links.select('text')
            .text('✏')
            .attr('dy', '4px');
        
        links.select('circle')
            .attr('stroke', '#f59e0b');
        
        links.select('text')
            .attr('fill', '#f59e0b');
        
        links
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                // Only allow editing in builder mode
                if (this.isBuilderMode) {
                    event.preventDefault();
                    event.stopPropagation();
                    this._editLink(d);
                }
                // In view mode, the original onFlowClick callback will handle it
            })
            .on('contextmenu', (event, d) => {
                // Only show context menu in builder mode
                if (this.isBuilderMode) {
                    event.preventDefault();
                    event.stopPropagation();
                    this._showLinkContextMenu(event.pageX, event.pageY, d);
                }
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

        console.log('Starting link drag from node:', sourceNode.label, { x: sourceNode.x, y: sourceNode.y });

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

            // Find the target node by checking what element is under the cursor
            const targetNode = this._findNodeAtMousePosition(e.clientX, e.clientY);

            console.log('Link drag ended:', { targetNode, sourceNode });

            if (targetNode && targetNode.id !== sourceNode.id) {
                console.log('Valid target found, creating link');
                // Validate no self-loop
                if (GraphUtils.validateNoSelfLoop(sourceNode.id, targetNode.id)) {
                    this._createLink(sourceNode, targetNode);
                }
            } else {
                console.log('No valid target found');
            }

            // Cleanup
            if (this.dragState.line) {
                this.dragState.line.remove();
            }
            this.dragState.active = false;
            this.dragState.sourceNode = null;
            this.dragState.line = null;

            d3.select(document).on('mousemove.linkdrag', null);
            d3.select(document).on('mouseup.linkdrag', null);
        };

        d3.select(document).on('mousemove.linkdrag', onMouseMove);
        d3.select(document).on('mouseup.linkdrag', onMouseUp);
    }

    _findNodeAtMousePosition(clientX, clientY) {
        // Temporarily hide the drag line so elementFromPoint can see through it
        if (this.dragState.line) {
            this.dragState.line.style('pointer-events', 'none');
        }

        // Get the element under the mouse cursor
        const element = document.elementFromPoint(clientX, clientY);
        
        // Restore drag line pointer events
        if (this.dragState.line) {
            this.dragState.line.style('pointer-events', null);
        }

        if (!element) return null;

        // Find the closest .node group element
        const nodeElement = element.closest('.node');
        if (!nodeElement) return null;

        // Get the node data from D3
        const nodeData = d3.select(nodeElement).datum();
        console.log('Found node via DOM:', nodeData?.label);
        return nodeData;
    }

    // Show modal to add a new group
    showAddGroupModal() {
        const modal = document.getElementById('add-group-modal');
        if (!modal) return;
        
        // Reset form
        document.getElementById('new-group-label').value = '';
        document.getElementById('new-group-color').value = '#3b82f6';
        document.getElementById('new-group-radius').value = '25';
        
        modal.style.display = 'flex';
    }

    // Hide add group modal
    hideAddGroupModal() {
        const modal = document.getElementById('add-group-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Add a new group
    addNewGroup(label, color, radius) {
        // Generate UUID for the new group
        const groupId = GraphUtils.generateUUID();
        
        // Add group
        this.groups.add(groupId, {
            id: groupId,
            title: label,
            label: label,
            color: color || '#3b82f6',
            radius: parseInt(radius) || 25,
            description: ''
        });
        
        // Re-render legend
        this._updateLegend();
        
        // Update settings sidebar
        if (typeof initializeSettingsSidebar === 'function') {
            initializeSettingsSidebar();
        }
        
        return true;
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

    // Get current metadata
    _getMetadata() {
        const title = document.getElementById('graph-title')?.textContent || 'Untitled Graph';
        const subtitle = document.getElementById('graph-subtitle')?.textContent || '';
        
        // Get legend data from groups
        const legend = {};
        this.groups.groups.forEach((groupData, key) => {
            legend[key] = {
                color: groupData.color,
                label: groupData.label,
                radius: groupData.radius
            };
        });

        return {
            title,
            subtitle,
            legend,
            exportDate: new Date().toISOString()
        };
    }

    // Apply metadata to current state
    _applyMetadata(metadata) {
        if (metadata.title) {
            const titleEl = document.getElementById('graph-title');
            if (titleEl) {
                titleEl.textContent = metadata.title;
            }
        }
        
        if (metadata.subtitle) {
            const subtitleEl = document.getElementById('graph-subtitle');
            if (subtitleEl) {
                subtitleEl.textContent = metadata.subtitle;
            }
        }
        
        if (metadata.legend) {
            // Update groups with imported legend data
            Object.entries(metadata.legend).forEach(([key, value]) => {
                this.groups.update(key, value);
            });
            this._updateLegend();
        }
    }

    // Generate download-safe filename from title
    _generateFilename(title) {
        // Sanitize title for filename
        const safeName = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .substring(0, 50) || 'graph';
        
        const timestamp = new Date().toISOString().split('T')[0];
        return `${safeName}_${timestamp}.json`;
    }

    // Export current graph data with metadata
    exportData() {
        const metadata = this._getMetadata();
        const exportPackage = {
            metadata,
            data: this.graph.rootData
        };
        
        const filename = this._generateFilename(metadata.title);
        GraphUtils.exportToJSON(exportPackage, filename);
    }

    // Import graph data with metadata
    importData(callback) {
        GraphUtils.importFromJSON((importedData) => {
            let graphData;
            let metadata = null;
            
            // Check if it's a new format with metadata
            if (importedData.metadata && importedData.data) {
                metadata = importedData.metadata;
                graphData = importedData.data;
            } else if (importedData.nodes && importedData.links) {
                // Old format without metadata
                graphData = importedData;
            } else {
                alert('Invalid graph data format');
                return;
            }
            
            // Apply metadata if present
            if (metadata) {
                this._applyMetadata(metadata);
            }
            
            // Validate and load graph data
            this.graph.rootData = graphData;
            this.graph.viewStack = [];
            this.graph._hydrateData(graphData);
            this.graph.navigateTo(graphData);
            
            if (this.isBuilderMode) {
                this._updateGraphForBuilder();
            }

            if (callback) callback(graphData, metadata);
        });
    }
}
