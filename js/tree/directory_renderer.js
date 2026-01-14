/**
 * DirectoryRenderer - Renders tree as a collapsible directory structure
 */
export class DirectoryRenderer {
    constructor() {
        this.expandedNodes = new Set();
        this.onNodeClick = null;
        this.onNodeDoubleClick = null;
    }

    /**
     * Renders the tree as an interactive directory structure
     * @param {Tree|TreeNode} treeOrNode - Tree or TreeNode to render
     * @param {HTMLElement} element - Target element
     * @param {Object} options - Rendering options
     * @param {boolean} options.showIcon - Show icons
     * @param {boolean} options.showDescription - Show descriptions on hover
     * @param {boolean} options.expandAll - Expand all nodes initially
     * @param {Function} options.onNodeClick - Callback for node clicks
     * @param {Function} options.onNodeDoubleClick - Callback for double clicks
     */
    render(treeOrNode, element, options = {}) {
        const {
            showIcon = true,
            showDescription = true,
            expandAll = false,
            onNodeClick = null,
            onNodeDoubleClick = null
        } = options;

        this.onNodeClick = onNodeClick;
        this.onNodeDoubleClick = onNodeDoubleClick;

        // Handle both Tree and TreeNode
        const rootNode = treeOrNode.root || treeOrNode;
        
        if (!rootNode) {
            element.innerHTML = '<div class="tree-empty">Empty tree</div>';
            return;
        }

        // Initialize expanded state
        if (expandAll) {
            this._expandAllNodes(rootNode);
        } else {
            this.expandedNodes.clear();
            this.expandedNodes.add(rootNode.id); // Always expand root
        }

        // Clear and render
        element.innerHTML = '';
        element.className = 'directory-tree';
        
        const container = document.createElement('div');
        container.className = 'directory-tree-container';
        
        this._renderNode(rootNode, container, 0, showIcon, showDescription);
        
        element.appendChild(container);
        this._applyStyles(element);
    }

    /**
     * Expands all nodes in the tree
     * @private
     */
    _expandAllNodes(node) {
        this.expandedNodes.add(node.id);
        node.children.forEach(child => this._expandAllNodes(child));
    }

    /**
     * Recursively renders a node
     * @private
     */
    _renderNode(node, container, depth, showIcon, showDescription) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        nodeDiv.dataset.nodeId = node.id;
        nodeDiv.dataset.depth = depth;
        
        // Node header
        const header = document.createElement('div');
        header.className = 'tree-node-header';
        header.style.paddingLeft = `${depth * 20}px`;
        
        // Expand/collapse button
        if (node.children.length > 0) {
            const toggle = document.createElement('span');
            toggle.className = 'tree-toggle';
            const isExpanded = this.expandedNodes.has(node.id);
            toggle.textContent = isExpanded ? '▼' : '▶';
            toggle.onclick = (e) => {
                e.stopPropagation();
                this._toggleNode(node.id, nodeDiv);
            };
            header.appendChild(toggle);
        } else {
            const spacer = document.createElement('span');
            spacer.className = 'tree-toggle-spacer';
            spacer.textContent = '  ';
            header.appendChild(spacer);
        }
        
        // Icon
        if (showIcon) {
            const icon = document.createElement('span');
            icon.className = 'tree-icon';
            icon.textContent = node.icon;
            header.appendChild(icon);
        }
        
        // Title
        const title = document.createElement('span');
        title.className = 'tree-title';
        title.textContent = node.title;
        header.appendChild(title);
        
        // Description tooltip
        if (showDescription && node.description) {
            header.title = this._stripHtml(node.description);
        }
        
        // Click handlers
        header.onclick = () => {
            if (this.onNodeClick) {
                this.onNodeClick(node);
            }
        };
        
        header.ondblclick = () => {
            if (this.onNodeDoubleClick) {
                this.onNodeDoubleClick(node);
            }
        };
        
        nodeDiv.appendChild(header);
        
        // Children container
        if (node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            const isExpanded = this.expandedNodes.has(node.id);
            childrenContainer.style.display = isExpanded ? 'block' : 'none';
            
            node.children.forEach(child => {
                this._renderNode(child, childrenContainer, depth + 1, showIcon, showDescription);
            });
            
            nodeDiv.appendChild(childrenContainer);
        }
        
        container.appendChild(nodeDiv);
    }

    /**
     * Toggles node expansion
     * @private
     */
    _toggleNode(nodeId, nodeDiv) {
        const childrenContainer = nodeDiv.querySelector('.tree-children');
        const toggle = nodeDiv.querySelector('.tree-toggle');
        
        if (!childrenContainer || !toggle) return;
        
        if (this.expandedNodes.has(nodeId)) {
            // Collapse
            this.expandedNodes.delete(nodeId);
            childrenContainer.style.display = 'none';
            toggle.textContent = '▶';
        } else {
            // Expand
            this.expandedNodes.add(nodeId);
            childrenContainer.style.display = 'block';
            toggle.textContent = '▼';
        }
    }

    /**
     * Expands a specific node by ID
     * @param {string} nodeId - Node ID to expand
     */
    expandNode(nodeId) {
        this.expandedNodes.add(nodeId);
        const nodeDiv = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeDiv) {
            const childrenContainer = nodeDiv.querySelector('.tree-children');
            const toggle = nodeDiv.querySelector('.tree-toggle');
            if (childrenContainer) childrenContainer.style.display = 'block';
            if (toggle) toggle.textContent = '▼';
        }
    }

    /**
     * Collapses a specific node by ID
     * @param {string} nodeId - Node ID to collapse
     */
    collapseNode(nodeId) {
        this.expandedNodes.delete(nodeId);
        const nodeDiv = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeDiv) {
            const childrenContainer = nodeDiv.querySelector('.tree-children');
            const toggle = nodeDiv.querySelector('.tree-toggle');
            if (childrenContainer) childrenContainer.style.display = 'none';
            if (toggle) toggle.textContent = '▶';
        }
    }

    /**
     * Expands all nodes
     */
    expandAll(rootNode) {
        this._expandAllNodes(rootNode);
        document.querySelectorAll('.tree-children').forEach(el => {
            el.style.display = 'block';
        });
        document.querySelectorAll('.tree-toggle').forEach(el => {
            el.textContent = '▼';
        });
    }

    /**
     * Collapses all nodes except root
     */
    collapseAll(rootNode) {
        this.expandedNodes.clear();
        this.expandedNodes.add(rootNode.id);
        
        document.querySelectorAll('.tree-children').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.tree-toggle').forEach(el => {
            el.textContent = '▶';
        });
        
        // Re-expand root's immediate children visibility
        const rootDiv = document.querySelector(`[data-node-id="${rootNode.id}"]`);
        if (rootDiv) {
            const rootChildren = rootDiv.querySelector('.tree-children');
            if (rootChildren) {
                rootChildren.style.display = 'block';
                // But collapse the children of children
                rootChildren.querySelectorAll('.tree-children').forEach(el => {
                    el.style.display = 'none';
                });
            }
        }
    }

    /**
     * Strips HTML tags from a string
     * @private
     */
    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    /**
     * Applies default styles to the tree
     * @private
     */
    _applyStyles(element) {
        if (!document.getElementById('directory-tree-styles')) {
            const style = document.createElement('style');
            style.id = 'directory-tree-styles';
            style.textContent = `
                .directory-tree {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    user-select: none;
                }
                
                .directory-tree-container {
                    padding: 10px;
                }
                
                .tree-node {
                    margin: 2px 0;
                }
                
                .tree-node-header {
                    display: flex;
                    align-items: center;
                    padding: 4px 8px;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }
                
                .tree-node-header:hover {
                    background-color: #f0f0f0;
                }
                
                .tree-toggle {
                    display: inline-block;
                    width: 16px;
                    text-align: center;
                    cursor: pointer;
                    font-size: 10px;
                    margin-right: 4px;
                    color: #666;
                }
                
                .tree-toggle-spacer {
                    display: inline-block;
                    width: 16px;
                    margin-right: 4px;
                }
                
                .tree-icon {
                    margin-right: 6px;
                    font-size: 16px;
                }
                
                .tree-title {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .tree-children {
                    overflow: hidden;
                }
                
                .tree-empty {
                    padding: 20px;
                    text-align: center;
                    color: #999;
                }
            `;
            document.head.appendChild(style);
        }
    }
}
