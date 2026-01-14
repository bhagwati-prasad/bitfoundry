/**
 * Tree Module - Main entry point for tree structure functionality
 * 
 * This module provides a complete tree data structure with three rendering modes:
 * 1. ASCII Graph - Text-based tree visualization
 * 2. Directory View - Collapsible/expandable directory-like structure
 * 3. Drill-Down View - Interactive drill-down interface
 * 
 * @module tree
 */

export { TreeNode } from './tree_node.js';
export { Tree } from './tree_structure.js';
export { ASCIIRenderer } from './ascii_renderer.js';
export { DirectoryRenderer } from './directory_renderer.js';
export { DrillDownRenderer } from './drilldown_renderer.js';

/**
 * Quick setup helper for creating and rendering a tree
 */
export class TreeBuilder {
    constructor() {
        this.tree = null;
    }

    /**
     * Creates a new tree from a simple object structure
     * @param {Object} data - Tree data
     * @param {string} data.title - Root title
     * @param {string} data.description - Root description
     * @param {string} data.icon - Root icon
     * @param {Array} data.children - Child nodes
     * @returns {TreeBuilder} This builder for chaining
     */
    async fromObject(data) {
        const { TreeNode } = await import('./tree_node.js');
        const { Tree } = await import('./tree_structure.js');
        
        const createNode = (nodeData) => {
            const children = (nodeData.children || []).map(createNode);
            return new TreeNode({
                id: nodeData.id,
                title: nodeData.title || 'Untitled',
                description: nodeData.description || '',
                icon: nodeData.icon || '📄',
                children: children
            });
        };
        
        const root = createNode(data);
        this.tree = new Tree(root);
        return this;
    }

    /**
     * Creates a sample tree for testing
     * @returns {TreeBuilder} This builder for chaining
     */
    async createSample() {
        const { Tree } = await import('./tree_structure.js');
        this.tree = Tree.createSample();
        return this;
    }

    /**
     * Renders as ASCII
     * @param {HTMLElement|string} target - Element or selector
     * @param {Object} options - Rendering options
     */
    async renderASCII(target, options = {}) {
        const { ASCIIRenderer } = await import('./ascii_renderer.js');
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        const renderer = new ASCIIRenderer();
        renderer.renderToElement(this.tree, element, options);
    }

    /**
     * Renders as directory view
     * @param {HTMLElement|string} target - Element or selector
     * @param {Object} options - Rendering options
     */
    async renderDirectory(target, options = {}) {
        const { DirectoryRenderer } = await import('./directory_renderer.js');
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        const renderer = new DirectoryRenderer();
        renderer.render(this.tree, element, options);
        return renderer;
    }

    /**
     * Renders as drill-down view
     * @param {HTMLElement|string} target - Element or selector
     * @param {Object} options - Rendering options
     */
    async renderDrillDown(target, options = {}) {
        const { DrillDownRenderer } = await import('./drilldown_renderer.js');
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        const renderer = new DrillDownRenderer();
        renderer.render(this.tree, element, options);
        return renderer;
    }

    /**
     * Gets the tree instance
     * @returns {Tree} Tree instance
     */
    getTree() {
        return this.tree;
    }
}

/**
 * Convenience function to create a tree builder
 * @returns {TreeBuilder} New tree builder instance
 */
export function createTree() {
    return new TreeBuilder();
}

/**
 * Convenience function to create a tree from JSON
 * @param {Object} json - JSON data
 * @returns {Tree} Tree instance
 */
export async function fromJSON(json) {
    const { Tree } = await import('./tree_structure.js');
    return Tree.fromJSON(json);
}

/**
 * Convenience function to create a sample tree
 * @returns {Tree} Sample tree instance
 */
export async function createSampleTree() {
    const { Tree } = await import('./tree_structure.js');
    return Tree.createSample();
}
