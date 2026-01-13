# Graph Builder System

A comprehensive graph building and visualization system for creating and editing ecosystem graphs with drill-down capabilities.

## Overview

The Graph Builder extends the existing graph viewer with interactive building capabilities, allowing users to:
- Create and edit nodes with custom properties
- Create directional and bidirectional links between nodes
- Create nested subgraphs (drill-down functionality)
- Import/Export graph data as JSON
- Toggle between View and Build modes

## Files Structure

### Core Files

- **`graph_builder.html`** - Main builder interface with mode toggle
- **`ecosystem_graph.html`** - Original viewer interface (unchanged)

### JavaScript Modules

- **`js/utils.js`** - Utility functions (UUID generation, validation, import/export)
- **`js/context_menu.js`** - Reusable context menu component
- **`js/property_editor.js`** - Modal for editing node/link properties
- **`js/ecosystem_graph_builder.js`** - Builder mode logic and interactions
- **`js/ecosystem_graph.js`** - Core graph rendering (enhanced with builder support)
- **`js/ecosystem_graph_entities.js`** - Entity group management
- **`js/graph_modal.js`** - Info modal for view mode
- **`js/ecosystem_data.js`** - Sample data

### Styles

- **`css/builder_styles.css`** - Complete styles for builder interface

## Features

### 1. Mode Toggle
- **View Mode**: Browse and explore the graph with info modals
- **Build Mode**: Create, edit, and delete nodes and links

### 2. Node Management

#### Creating Nodes
- Right-click on canvas → "Create Node"
- New nodes get unique UUID as ID
- Properties immediately editable via modal

#### Node Properties (Editable)
- **Label**: Display name
- **Description**: HTML-supported description
- **Group**: Select from predefined groups (color swatches)
- **Size**: Set via group settings (Settings sidebar)

#### Node Actions (Builder Mode Icons)
- **📊 Center Icon**: Create/enter subgraph (drill-down)
- **✏️ Top-right Icon**: Edit properties
- **− Top-left Icon**: Delete node
- **○ Bottom Icon**: Create link (drag to another node)

### 3. Link Management

#### Creating Links
1. Click and hold the join icon (○) at bottom of source node
2. Drag to target node
3. Release when cursor is within snap distance
4. Properties modal opens automatically

#### Link Properties (Editable)
- **Type**: flow, internal, admin
- **Label**: Display text
- **Direction**: forward, backward, bidirectional

#### Link Validation
- ✅ No self-loops allowed
- ✅ Multiple links between same nodes allowed
- ✅ Each link gets unique UUID

### 4. Drill-Down (Subgraphs)

- Click center icon on any node
- If subgraph exists: navigate to it
- If no subgraph: create empty one
- Breadcrumbs show navigation path
- Active crumb indicates current working level

### 5. Context Menus

#### Canvas Context Menu (Right-click empty space)
- Create Node

#### Node Context Menu (Right-click node)
- Edit Properties
- Delete Node
- Create/Enter Subgraph

#### Link Context Menu (Right-click link info icon)
- Edit Properties
- Delete Link

### 6. Settings Sidebar

Access via ⚙️ Settings button

- View all entity groups
- Adjust default radius for each group
- Changes apply to all nodes of that group
- Visual color swatches

### 7. Data Management

#### Export
- Click 📤 Export button
- Downloads complete graph structure as JSON
- Includes all nodes, links, and subgraphs

#### Import
- Click 📥 Import button
- Select JSON file
- Validates and loads data
- Replaces current graph

## Data Structure

```javascript
{
  id: "root",
  label: "Graph Name",
  nodes: [
    {
      id: "uuid-1234",           // UUID (non-editable)
      label: "Node Name",         // Editable
      group: "central",           // Editable (from predefined list)
      desc: "<b>HTML desc</b>",   // Editable (supports HTML)
      r: 40,                      // Auto-calculated from group
      subGraph: { ... }           // Optional nested graph
    }
  ],
  links: [
    {
      id: "uuid-5678",           // UUID (auto-generated)
      source: "uuid-1234",       // Node ID
      target: "uuid-9012",       // Node ID
      type: "flow",              // Editable
      label: "Connection",       // Editable
      direction: "forward"       // Editable
    }
  ]
}
```

## Entity Groups

Predefined groups (configurable in code):

- **central**: Central Unit (Blue, #2563eb, radius: 40)
- **ou**: Operating Unit (Green, #059669, radius: 30)
- **end**: End User (Orange, #d97706, radius: 25)
- **support**: Support System (Purple, #7c3aed, radius: 25)
- **internal**: Internal Component (Gray, #475569, radius: 25)

## Usage Examples

### Basic Usage

```javascript
// Initialize (already done in graph_builder.html)
const graph = new EcosystemGraph(data, groups, config);
const builder = new EcosystemGraphBuilder(graph, groups);

// Enable builder mode
builder.enableBuilderMode();

// Disable builder mode
builder.disableBuilderMode();

// Export data
builder.exportData();

// Import data
builder.importData((data) => {
  console.log('Imported:', data);
});
```

### Programmatic Node Creation

```javascript
// Create node at specific position
graph.addNode({
  id: GraphUtils.generateUUID(),
  label: "My Node",
  group: "central",
  desc: "Description",
  x: 400,
  y: 300
});
```

### Programmatic Link Creation

```javascript
// Create link between nodes
graph.addLink("node-id-1", "node-id-2", "flow");
```

## Validation Rules

1. **Node IDs**: Must be unique across current graph level
2. **Self-loops**: Not allowed (source ≠ target)
3. **Link Types**: Must be 'flow', 'internal', or 'admin'
4. **Multiple Links**: Allowed between same nodes (different UUIDs)

## Keyboard Shortcuts

- **Escape**: Close context menu
- **Escape**: Close modals

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Requires: ES6+ support, D3.js v7+

## Tips

1. **Organize by Levels**: Use subgraphs to organize complex systems
2. **Color Coding**: Assign groups consistently for visual clarity
3. **Regular Exports**: Save your work frequently
4. **Snap Distance**: Links snap within 40px of target node center
5. **Undo**: Not implemented - use Export before major changes

## Development

### Adding New Entity Groups

```javascript
myGroups.add('newGroup', {
  color: '#hexcolor',
  label: 'Display Name',
  radius: 25
});
```

### Customizing Snap Distance

```javascript
const builder = new EcosystemGraphBuilder(graph, groups, {
  linkSnapDistance: 50  // Default: 40
});
```

### Custom Callbacks

```javascript
const graph = new EcosystemGraph(data, groups, {
  callbacks: {
    onEntityClick: (node) => { /* custom handler */ },
    onFlowClick: (link) => { /* custom handler */ },
    onNodeClick: (node) => { /* custom handler */ }
  }
});
```

## Known Limitations

1. No undo/redo functionality
2. No copy/paste for nodes
3. No multi-select operations
4. Link direction indicator for bidirectional links not yet implemented
5. Mobile touch events not optimized

## Future Enhancements

- [ ] Undo/Redo system
- [ ] Copy/Paste nodes
- [ ] Multi-select with Ctrl/Cmd
- [ ] Auto-layout algorithms
- [ ] Search/filter nodes
- [ ] Collaboration features
- [ ] Version history

## License

[Your License Here]

## Credits

Built with:
- [D3.js](https://d3js.org/) - Data visualization
- [Inter Font](https://fonts.google.com/specimen/Inter) - Typography
