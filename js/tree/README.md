# Tree Module

A comprehensive JavaScript tree data structure module with three different visualization modes.

## Features

### Core Components

- **TreeNode**: Node class with UUID, title, description (HTML support), icon, children, and metadata
- **Tree**: Tree structure with traversal, search, and manipulation methods
- **Three Rendering Modes**:
  1. ASCII Graph - Text-based tree visualization
  2. Directory View - Collapsible/expandable file explorer style
  3. Drill-Down View - Interactive card-based navigation

## Installation

No installation required - pure JavaScript ES6 modules.

## Quick Start

```javascript
import { Tree, TreeNode, ASCIIRenderer } from './js/tree/index.js';

// Create nodes
const root = new TreeNode({
    title: 'Root',
    description: 'Root node',
    icon: '🌳'
});

const child = new TreeNode({
    title: 'Child',
    description: 'Child node',
    icon: '📁'
});

root.addChild(child);

// Create tree
const tree = new Tree(root);

// Render
const renderer = new ASCIIRenderer();
renderer.renderToElement(tree, document.getElementById('output'));
```

## Demo

Open `tree_demo.html` in a browser to see all three visualization modes in action.

## API Reference

### TreeNode

```javascript
const node = new TreeNode({
    id: 'optional-uuid',        // Auto-generated if not provided
    title: 'Node Title',
    description: 'HTML <strong>supported</strong>',
    icon: '📄',
    children: []
});
```

**Methods:**
- `addChild(node)` - Add a child node
- `removeChild(nodeId)` - Remove a child by ID
- `findById(nodeId)` - Find a node in subtree
- `getDepth()` - Get node depth
- `getPath()` - Get path from root
- `isLeaf()` - Check if leaf node
- `toJSON()` - Serialize to JSON
- `fromJSON(json)` - Deserialize from JSON

### Tree

```javascript
const tree = new Tree(rootNode);
```

**Methods:**
- `setRoot(node)` - Set root node
- `findById(nodeId)` - Find node anywhere
- `traversePreOrder(callback)` - Pre-order traversal
- `traversePostOrder(callback)` - Post-order traversal
- `traverseLevelOrder(callback)` - Level-order traversal
- `getNodesAtDepth(depth)` - Get nodes at specific depth
- `getMaxDepth()` - Get maximum depth
- `getNodeCount()` - Get total node count
- `getLeafNodes()` - Get all leaf nodes
- `search(predicate)` - Search with predicate
- `searchByTitle(text)` - Search by title
- `toJSON()` / `fromJSON(json)` - Serialization

### ASCIIRenderer

```javascript
const renderer = new ASCIIRenderer();
renderer.renderToElement(tree, element, {
    showIcon: true,
    showId: false,
    useUnicode: true
});
```

**Output example:**
```
🌳 Root
├── 📁 Documents
│   ├── 📄 Report.pdf
│   └── 📝 Notes.txt
└── 🖼️ Pictures
    └── 📷 Photo.jpg
```

### DirectoryRenderer

```javascript
const renderer = new DirectoryRenderer();
renderer.render(tree, element, {
    showIcon: true,
    showDescription: true,
    expandAll: false,
    onNodeClick: (node) => console.log(node),
    onNodeDoubleClick: (node) => console.log(node)
});
```

**Methods:**
- `expandNode(nodeId)` - Expand specific node
- `collapseNode(nodeId)` - Collapse specific node
- `expandAll(rootNode)` - Expand all nodes
- `collapseAll(rootNode)` - Collapse all nodes

### DrillDownRenderer

```javascript
const renderer = new DrillDownRenderer();
renderer.render(tree, element, {
    showIcon: true,
    showDescription: true,
    showBreadcrumb: true,
    onNodeSelect: (node) => console.log(node),
    onNodeDoubleClick: (node) => console.log(node)
});
```

**Methods:**
- `goBack()` - Navigate to previous level
- `goToRoot()` - Navigate to root
- `goToHistoryIndex(index)` - Navigate to specific history point
- `drillIntoById(nodeId)` - Navigate to specific node

## Module Structure

```
js/tree/
├── index.js                 # Main entry point
├── tree_node.js            # TreeNode class
├── tree_structure.js       # Tree class
├── ascii_renderer.js       # ASCII visualization
├── directory_renderer.js   # Directory-style view
└── drilldown_renderer.js   # Drill-down view
```

## Examples

### Creating from JSON

```javascript
const jsonData = {
    root: {
        id: "1",
        title: "Root",
        description: "Root node",
        icon: "🌳",
        metadata: { createdAt: "2026-01-14T10:00:00Z" },
        children: [
            {
                id: "2",
                title: "Child",
                description: "Child node",
                icon: "📁",
                children: []
            }
        ]
    }
};

const tree = Tree.fromJSON(jsonData);
```

### Sample Tree

```javascript
const tree = Tree.createSample();
```

### Searching

```javascript
// Search by title
const results = tree.searchByTitle('report');

// Custom search
const nodes = tree.search(node => node.children.length > 2);
```

### Traversal

```javascript
// Pre-order
tree.traversePreOrder(node => console.log(node.title));

// Level-order
tree.traverseLevelOrder(node => console.log(node.title));
```

## Browser Support

- Modern browsers with ES6 module support
- No external dependencies
- Works with any bundler (Webpack, Rollup, Vite, etc.)

## License

MIT
