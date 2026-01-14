/**
 * DrillDownRenderer - Renders tree in drill-down mode (shows root, then expands on double-click)
 */
export class DrillDownRenderer {
    constructor() {
        this.currentNodes = [];
        this.history = [];
        this.onNodeSelect = null;
        this.onNodeDoubleClick = null;
    }

    /**
     * Renders the tree in drill-down mode
     * @param {Tree|TreeNode} treeOrNode - Tree or TreeNode to render
     * @param {HTMLElement} element - Target element
     * @param {Object} options - Rendering options
     * @param {boolean} options.showIcon - Show icons
     * @param {boolean} options.showDescription - Show descriptions
     * @param {boolean} options.showBreadcrumb - Show navigation breadcrumb
     * @param {Function} options.onNodeSelect - Callback for node selection
     * @param {Function} options.onNodeDoubleClick - Callback for double clicks
     */
    render(treeOrNode, element, options = {}) {
        const {
            showIcon = true,
            showDescription = true,
            showBreadcrumb = true,
            onNodeSelect = null,
            onNodeDoubleClick = null
        } = options;

        this.onNodeSelect = onNodeSelect;
        this.onNodeDoubleClick = onNodeDoubleClick;
        this.showIcon = showIcon;
        this.showDescription = showDescription;
        this.showBreadcrumb = showBreadcrumb;

        // Handle both Tree and TreeNode
        const rootNode = treeOrNode.root || treeOrNode;
        
        if (!rootNode) {
            element.innerHTML = '<div class="drilldown-empty">Empty tree</div>';
            return;
        }

        this.rootNode = rootNode;
        this.element = element;
        
        // Initialize with root node
        this.currentNodes = [rootNode];
        this.history = [];
        
        this._renderView();
        this._applyStyles();
    }

    /**
     * Renders the current view
     * @private
     */
    _renderView() {
        this.element.innerHTML = '';
        this.element.className = 'drilldown-tree';
        
        // Breadcrumb navigation
        if (this.showBreadcrumb && this.history.length > 0) {
            const breadcrumb = this._createBreadcrumb();
            this.element.appendChild(breadcrumb);
        }
        
        // Current level container
        const container = document.createElement('div');
        container.className = 'drilldown-container';
        
        // Current level title
        if (this.history.length > 0) {
            const currentParent = this.history[this.history.length - 1];
            const levelTitle = document.createElement('div');
            levelTitle.className = 'drilldown-level-title';
            levelTitle.innerHTML = `
                <span class="level-icon">${this.showIcon ? currentParent.icon : ''}</span>
                <span class="level-text">${currentParent.title}</span>
            `;
            container.appendChild(levelTitle);
        }
        
        // Node list
        const nodeList = document.createElement('div');
        nodeList.className = 'drilldown-node-list';
        
        this.currentNodes.forEach(node => {
            const nodeCard = this._createNodeCard(node);
            nodeList.appendChild(nodeCard);
        });
        
        container.appendChild(nodeList);
        this.element.appendChild(container);
    }

    /**
     * Creates a breadcrumb navigation
     * @private
     */
    _createBreadcrumb() {
        const breadcrumb = document.createElement('div');
        breadcrumb.className = 'drilldown-breadcrumb';
        
        // Home button
        const home = document.createElement('span');
        home.className = 'breadcrumb-item';
        home.textContent = '🏠 Root';
        home.onclick = () => this.goToRoot();
        breadcrumb.appendChild(home);
        
        // History items
        this.history.forEach((node, index) => {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = ' › ';
            breadcrumb.appendChild(separator);
            
            const item = document.createElement('span');
            item.className = 'breadcrumb-item';
            const icon = this.showIcon ? `${node.icon} ` : '';
            item.textContent = `${icon}${node.title}`;
            
            // Don't make the last item clickable (it's the current level)
            if (index < this.history.length - 1) {
                item.onclick = () => this.goToHistoryIndex(index);
            } else {
                item.classList.add('active');
            }
            
            breadcrumb.appendChild(item);
        });
        
        return breadcrumb;
    }

    /**
     * Creates a node card
     * @private
     */
    _createNodeCard(node) {
        const card = document.createElement('div');
        card.className = 'drilldown-node-card';
        card.dataset.nodeId = node.id;
        
        // Icon section
        if (this.showIcon) {
            const iconDiv = document.createElement('div');
            iconDiv.className = 'node-icon';
            iconDiv.textContent = node.icon;
            card.appendChild(iconDiv);
        }
        
        // Content section
        const content = document.createElement('div');
        content.className = 'node-content';
        
        const title = document.createElement('div');
        title.className = 'node-title';
        title.textContent = node.title;
        content.appendChild(title);
        
        if (this.showDescription && node.description) {
            const description = document.createElement('div');
            description.className = 'node-description';
            description.innerHTML = node.description;
            content.appendChild(description);
        }
        
        card.appendChild(content);
        
        // Indicator for nodes with children
        if (node.children.length > 0) {
            const indicator = document.createElement('div');
            indicator.className = 'node-indicator';
            indicator.innerHTML = `
                <span class="child-count">${node.children.length}</span>
                <span class="arrow">›</span>
            `;
            card.appendChild(indicator);
        }
        
        // Click handlers
        card.onclick = () => {
            this._selectNode(node, card);
        };
        
        card.ondblclick = () => {
            this._drillInto(node);
        };
        
        return card;
    }

    /**
     * Selects a node
     * @private
     */
    _selectNode(node, cardElement) {
        // Remove previous selection
        this.element.querySelectorAll('.drilldown-node-card').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection
        cardElement.classList.add('selected');
        
        if (this.onNodeSelect) {
            this.onNodeSelect(node);
        }
    }

    /**
     * Drills into a node (shows its children)
     * @private
     */
    _drillInto(node) {
        if (node.children.length === 0) {
            return; // Can't drill into leaf nodes
        }
        
        if (this.onNodeDoubleClick) {
            this.onNodeDoubleClick(node);
        }
        
        this.history.push(node);
        this.currentNodes = node.children;
        this._renderView();
    }

    /**
     * Goes back to the previous level
     */
    goBack() {
        if (this.history.length === 0) {
            return; // Already at root
        }
        
        this.history.pop();
        
        if (this.history.length === 0) {
            this.currentNodes = [this.rootNode];
        } else {
            const parent = this.history[this.history.length - 1];
            this.currentNodes = parent.children;
        }
        
        this._renderView();
    }

    /**
     * Goes to root level
     */
    goToRoot() {
        this.history = [];
        this.currentNodes = [this.rootNode];
        this._renderView();
    }

    /**
     * Goes to a specific history index
     * @param {number} index - History index
     */
    goToHistoryIndex(index) {
        if (index < 0 || index >= this.history.length) {
            return;
        }
        
        this.history = this.history.slice(0, index + 1);
        const parent = this.history[this.history.length - 1];
        this.currentNodes = parent.children;
        this._renderView();
    }

    /**
     * Drills into a specific node by ID
     * @param {string} nodeId - Node ID to drill into
     */
    drillIntoById(nodeId) {
        const node = this.rootNode.findById(nodeId);
        if (node && node.children.length > 0) {
            // Build history path to this node
            const path = node.getPath();
            this.history = path.slice(0, -1); // Exclude the node itself
            this.currentNodes = node.children;
            this._renderView();
        }
    }

    /**
     * Applies default styles
     * @private
     */
    _applyStyles() {
        if (!document.getElementById('drilldown-tree-styles')) {
            const style = document.createElement('style');
            style.id = 'drilldown-tree-styles';
            style.textContent = `
                .drilldown-tree {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                }
                
                .drilldown-breadcrumb {
                    padding: 12px 16px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 4px;
                }
                
                .breadcrumb-item {
                    cursor: pointer;
                    color: #007bff;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }
                
                .breadcrumb-item:hover {
                    background-color: #e9ecef;
                }
                
                .breadcrumb-item.active {
                    color: #495057;
                    cursor: default;
                    font-weight: 500;
                }
                
                .breadcrumb-item.active:hover {
                    background-color: transparent;
                }
                
                .breadcrumb-separator {
                    color: #6c757d;
                }
                
                .drilldown-container {
                    padding: 16px;
                }
                
                .drilldown-level-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: #212529;
                }
                
                .level-icon {
                    font-size: 24px;
                }
                
                .drilldown-node-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 12px;
                }
                
                .drilldown-node-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                }
                
                .drilldown-node-card:hover {
                    border-color: #007bff;
                    box-shadow: 0 2px 8px rgba(0,123,255,0.1);
                    transform: translateY(-2px);
                }
                
                .drilldown-node-card.selected {
                    border-color: #007bff;
                    background-color: #e7f3ff;
                }
                
                .node-icon {
                    font-size: 32px;
                    flex-shrink: 0;
                }
                
                .node-content {
                    flex: 1;
                    min-width: 0;
                }
                
                .node-title {
                    font-weight: 500;
                    color: #212529;
                    margin-bottom: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .node-description {
                    font-size: 12px;
                    color: #6c757d;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                
                .node-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #6c757d;
                    flex-shrink: 0;
                }
                
                .child-count {
                    background: #e9ecef;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .arrow {
                    font-size: 20px;
                    font-weight: bold;
                }
                
                .drilldown-empty {
                    padding: 40px;
                    text-align: center;
                    color: #999;
                }
            `;
            document.head.appendChild(style);
        }
    }
}
