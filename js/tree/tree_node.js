/**
 * TreeNode - Represents a node in the tree structure
 */
export class TreeNode {
    /**
     * Creates a new TreeNode
     * @param {Object} options - Node configuration
     * @param {string} options.id - UUID (auto-generated if not provided)
     * @param {string} options.title - Node title
     * @param {string} options.description - Node description (can contain HTML)
     * @param {string} options.icon - Icon identifier (e.g., emoji, icon class, or unicode)
     * @param {TreeNode[]} options.children - Child nodes
     */
    constructor({ id = null, title = '', description = '', icon = '📄', children = [] } = {}) {
        this.id = id || this.generateUUID();
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.children = children;
        this.metadata = {
            createdAt: new Date().toISOString()
        };
        this.parent = null;
        
        // Set parent reference for all children
        this.children.forEach(child => {
            child.parent = this;
        });
    }

    /**
     * Generates a UUID v4
     * @returns {string} UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Adds a child node
     * @param {TreeNode} node - Child node to add
     */
    addChild(node) {
        if (!(node instanceof TreeNode)) {
            throw new Error('Child must be an instance of TreeNode');
        }
        node.parent = this;
        this.children.push(node);
    }

    /**
     * Removes a child node
     * @param {string} nodeId - ID of the child node to remove
     * @returns {boolean} True if node was removed
     */
    removeChild(nodeId) {
        const index = this.children.findIndex(child => child.id === nodeId);
        if (index !== -1) {
            this.children[index].parent = null;
            this.children.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Finds a node by ID in this subtree
     * @param {string} nodeId - ID to search for
     * @returns {TreeNode|null} Found node or null
     */
    findById(nodeId) {
        if (this.id === nodeId) {
            return this;
        }
        
        for (const child of this.children) {
            const found = child.findById(nodeId);
            if (found) {
                return found;
            }
        }
        
        return null;
    }

    /**
     * Gets the depth of this node in the tree
     * @returns {number} Depth (root is 0)
     */
    getDepth() {
        let depth = 0;
        let current = this.parent;
        while (current) {
            depth++;
            current = current.parent;
        }
        return depth;
    }

    /**
     * Gets the path from root to this node
     * @returns {TreeNode[]} Array of nodes from root to this node
     */
    getPath() {
        const path = [this];
        let current = this.parent;
        while (current) {
            path.unshift(current);
            current = current.parent;
        }
        return path;
    }

    /**
     * Checks if this node is a leaf (has no children)
     * @returns {boolean} True if leaf node
     */
    isLeaf() {
        return this.children.length === 0;
    }

    /**
     * Gets the total number of descendants
     * @returns {number} Total count of descendants
     */
    getDescendantCount() {
        let count = this.children.length;
        for (const child of this.children) {
            count += child.getDescendantCount();
        }
        return count;
    }

    /**
     * Serializes the node to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            icon: this.icon,
            metadata: this.metadata,
            children: this.children.map(child => child.toJSON())
        };
    }

    /**
     * Creates a TreeNode from JSON
     * @param {Object} json - JSON representation
     * @returns {TreeNode} New TreeNode instance
     */
    static fromJSON(json) {
        const children = (json.children || []).map(childJson => TreeNode.fromJSON(childJson));
        const node = new TreeNode({
            id: json.id,
            title: json.title,
            description: json.description,
            icon: json.icon,
            children: children
        });
        
        // Restore metadata
        if (json.metadata) {
            node.metadata = { ...json.metadata };
        }
        
        return node;
    }
}
