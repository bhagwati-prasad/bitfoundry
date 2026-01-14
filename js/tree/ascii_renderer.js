/**
 * ASCIIRenderer - Renders tree as ASCII art
 */
export class ASCIIRenderer {
    constructor() {
        this.useUnicode = true; // Use Unicode box-drawing characters
    }

    /**
     * Gets the line characters based on Unicode setting
     * @returns {Object} Character set for drawing
     */
    getCharSet() {
        if (this.useUnicode) {
            return {
                vertical: '│',
                horizontal: '─',
                branch: '├',
                lastBranch: '└',
                space: ' '
            };
        } else {
            return {
                vertical: '|',
                horizontal: '-',
                branch: '+',
                lastBranch: '\\',
                space: ' '
            };
        }
    }

    /**
     * Renders the tree as ASCII art
     * @param {Tree|TreeNode} treeOrNode - Tree or TreeNode to render
     * @param {Object} options - Rendering options
     * @param {boolean} options.showIcon - Show icons
     * @param {boolean} options.showId - Show node IDs
     * @param {boolean} options.useUnicode - Use Unicode characters
     * @returns {string} ASCII representation
     */
    render(treeOrNode, options = {}) {
        const {
            showIcon = true,
            showId = false,
            useUnicode = true
        } = options;

        this.useUnicode = useUnicode;
        
        // Handle both Tree and TreeNode
        const rootNode = treeOrNode.root || treeOrNode;
        
        if (!rootNode) {
            return '(empty tree)';
        }

        const lines = [];
        this._renderNode(rootNode, '', true, lines, showIcon, showId);
        return lines.join('\n');
    }

    /**
     * Recursively renders a node and its children
     * @private
     */
    _renderNode(node, prefix, isLast, lines, showIcon, showId) {
        const chars = this.getCharSet();
        
        // Build the node line
        let line = '';
        
        // Add prefix (indentation from parent levels)
        if (prefix) {
            line += prefix;
        }
        
        // Add branch connector (except for root)
        if (prefix) {
            line += isLast ? chars.lastBranch : chars.branch;
            line += chars.horizontal + chars.horizontal + chars.space;
        }
        
        // Add icon
        if (showIcon) {
            line += node.icon + chars.space;
        }
        
        // Add title
        line += node.title;
        
        // Add ID if requested
        if (showId) {
            line += ` [${node.id}]`;
        }
        
        lines.push(line);
        
        // Render children
        const childCount = node.children.length;
        node.children.forEach((child, index) => {
            const isLastChild = index === childCount - 1;
            // Build prefix for children: add vertical line continuation or spaces
            let childPrefix = prefix;
            if (prefix || childCount > 0) {
                // If this is not the last child, add vertical line, otherwise add spaces
                childPrefix += isLast ? '    ' : chars.vertical + '   ';
            }
            this._renderNode(child, childPrefix, isLastChild, lines, showIcon, showId);
        });
    }

    /**
     * Renders tree to a DOM element
     * @param {Tree|TreeNode} treeOrNode - Tree or TreeNode to render
     * @param {HTMLElement} element - Target element
     * @param {Object} options - Rendering options
     */
    renderToElement(treeOrNode, element, options = {}) {
        const ascii = this.render(treeOrNode, options);
        const pre = document.createElement('pre');
        pre.style.fontFamily = 'monospace';
        pre.style.lineHeight = '1.5';
        pre.style.margin = '0';
        pre.textContent = ascii;
        element.innerHTML = '';
        element.appendChild(pre);
    }

    /**
     * Renders tree as a compact horizontal format
     * @param {Tree|TreeNode} treeOrNode - Tree or TreeNode to render
     * @param {Object} options - Rendering options
     * @returns {string} Compact ASCII representation
     */
    renderCompact(treeOrNode, options = {}) {
        const { showIcon = true } = options;
        const rootNode = treeOrNode.root || treeOrNode;
        
        if (!rootNode) {
            return '(empty tree)';
        }

        return this._renderNodeCompact(rootNode, showIcon);
    }

    /**
     * Recursively renders node in compact format
     * @private
     */
    _renderNodeCompact(node, showIcon) {
        let result = showIcon ? `${node.icon} ${node.title}` : node.title;
        
        if (node.children.length > 0) {
            const childStrings = node.children.map(child => 
                this._renderNodeCompact(child, showIcon)
            );
            result += ` [${childStrings.join(', ')}]`;
        }
        
        return result;
    }

    /**
     * Renders tree with depth indicators
     * @param {Tree|TreeNode} treeOrNode - Tree or TreeNode to render
     * @param {Object} options - Rendering options
     * @returns {string} ASCII representation with depth
     */
    renderWithDepth(treeOrNode, options = {}) {
        const { showIcon = true } = options;
        const rootNode = treeOrNode.root || treeOrNode;
        
        if (!rootNode) {
            return '(empty tree)';
        }

        const lines = [];
        this._renderNodeWithDepth(rootNode, 0, lines, showIcon);
        return lines.join('\n');
    }

    /**
     * Recursively renders node with depth indicator
     * @private
     */
    _renderNodeWithDepth(node, depth, lines, showIcon) {
        const indent = '  '.repeat(depth);
        const depthIndicator = `[${depth}]`;
        const icon = showIcon ? `${node.icon} ` : '';
        lines.push(`${indent}${depthIndicator} ${icon}${node.title}`);
        
        node.children.forEach(child => {
            this._renderNodeWithDepth(child, depth + 1, lines, showIcon);
        });
    }
}
