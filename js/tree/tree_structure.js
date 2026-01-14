import { TreeNode } from './tree_node.js';

/**
 * Tree - Manages the tree structure
 */
export class Tree {
    /**
     * Creates a new Tree
     * @param {TreeNode} root - Root node
     */
    constructor(root = null) {
        this.root = root;
    }

    /**
     * Sets the root node
     * @param {TreeNode} node - New root node
     */
    setRoot(node) {
        if (!(node instanceof TreeNode)) {
            throw new Error('Root must be an instance of TreeNode');
        }
        this.root = node;
    }

    /**
     * Finds a node by ID anywhere in the tree
     * @param {string} nodeId - ID to search for
     * @returns {TreeNode|null} Found node or null
     */
    findById(nodeId) {
        if (!this.root) return null;
        return this.root.findById(nodeId);
    }

    /**
     * Traverses the tree in pre-order (parent before children)
     * @param {Function} callback - Function to call for each node
     * @param {TreeNode} node - Starting node (defaults to root)
     */
    traversePreOrder(callback, node = null) {
        const current = node || this.root;
        if (!current) return;
        
        callback(current);
        for (const child of current.children) {
            this.traversePreOrder(callback, child);
        }
    }

    /**
     * Traverses the tree in post-order (children before parent)
     * @param {Function} callback - Function to call for each node
     * @param {TreeNode} node - Starting node (defaults to root)
     */
    traversePostOrder(callback, node = null) {
        const current = node || this.root;
        if (!current) return;
        
        for (const child of current.children) {
            this.traversePostOrder(callback, child);
        }
        callback(current);
    }

    /**
     * Traverses the tree level by level (breadth-first)
     * @param {Function} callback - Function to call for each node
     */
    traverseLevelOrder(callback) {
        if (!this.root) return;
        
        const queue = [this.root];
        while (queue.length > 0) {
            const node = queue.shift();
            callback(node);
            queue.push(...node.children);
        }
    }

    /**
     * Gets all nodes at a specific depth
     * @param {number} depth - Depth level (0 = root)
     * @returns {TreeNode[]} Array of nodes at the specified depth
     */
    getNodesAtDepth(depth) {
        const nodes = [];
        this.traversePreOrder((node) => {
            if (node.getDepth() === depth) {
                nodes.push(node);
            }
        });
        return nodes;
    }

    /**
     * Gets the maximum depth of the tree
     * @returns {number} Maximum depth
     */
    getMaxDepth() {
        let maxDepth = 0;
        this.traversePreOrder((node) => {
            const depth = node.getDepth();
            if (depth > maxDepth) {
                maxDepth = depth;
            }
        });
        return maxDepth;
    }

    /**
     * Gets the total number of nodes in the tree
     * @returns {number} Total node count
     */
    getNodeCount() {
        let count = 0;
        this.traversePreOrder(() => count++);
        return count;
    }

    /**
     * Gets all leaf nodes
     * @returns {TreeNode[]} Array of leaf nodes
     */
    getLeafNodes() {
        const leaves = [];
        this.traversePreOrder((node) => {
            if (node.isLeaf()) {
                leaves.push(node);
            }
        });
        return leaves;
    }

    /**
     * Searches for nodes matching a predicate
     * @param {Function} predicate - Function that returns true for matching nodes
     * @returns {TreeNode[]} Array of matching nodes
     */
    search(predicate) {
        const results = [];
        this.traversePreOrder((node) => {
            if (predicate(node)) {
                results.push(node);
            }
        });
        return results;
    }

    /**
     * Searches for nodes by title (case-insensitive partial match)
     * @param {string} searchText - Text to search for
     * @returns {TreeNode[]} Array of matching nodes
     */
    searchByTitle(searchText) {
        const lowerSearch = searchText.toLowerCase();
        return this.search(node => 
            node.title.toLowerCase().includes(lowerSearch)
        );
    }

    /**
     * Serializes the tree to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            root: this.root ? this.root.toJSON() : null
        };
    }

    /**
     * Creates a Tree from JSON
     * @param {Object} json - JSON representation
     * @returns {Tree} New Tree instance
     */
    static fromJSON(json) {
        const root = json.root ? TreeNode.fromJSON(json.root) : null;
        return new Tree(root);
    }

    /**
     * Creates a sample tree for testing
     * @returns {Tree} Sample tree
     */
    static createSample() {
        const root = new TreeNode({
            title: 'Root',
            description: 'This is the root node',
            icon: '🌳'
        });

        const child1 = new TreeNode({
            title: 'Documents',
            description: 'Document folder',
            icon: '📁'
        });

        const child2 = new TreeNode({
            title: 'Pictures',
            description: 'Picture folder',
            icon: '🖼️'
        });

        const child3 = new TreeNode({
            title: 'Music',
            description: 'Music folder',
            icon: '🎵'
        });

        const grandchild1 = new TreeNode({
            title: 'Report.pdf',
            description: 'Annual report document',
            icon: '📄'
        });

        const grandchild2 = new TreeNode({
            title: 'Notes.txt',
            description: 'Personal notes',
            icon: '📝'
        });

        const grandchild3 = new TreeNode({
            title: 'Vacation.jpg',
            description: 'Vacation photo',
            icon: '📷'
        });

        child1.addChild(grandchild1);
        child1.addChild(grandchild2);
        child2.addChild(grandchild3);

        root.addChild(child1);
        root.addChild(child2);
        root.addChild(child3);

        return new Tree(root);
    }
}
