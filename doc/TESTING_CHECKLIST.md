# Graph Builder - Feature Checklist & Testing Guide

## ✅ Completed Features

### Core Architecture
- [x] Separation of concerns (viewer vs builder logic)
- [x] Modular JavaScript files
- [x] Reusable components (ContextMenu, PropertyEditor)
- [x] UUID generation for nodes and links
- [x] Data validation system

### UI Components
- [x] Mode toggle (View/Build)
- [x] Context menu system
- [x] Property editor modal
- [x] Settings sidebar
- [x] Breadcrumb navigation
- [x] Legend panel
- [x] Action buttons (Import/Export/Settings)

### Node Management
- [x] Create node via right-click
- [x] Auto-generate UUID for node ID
- [x] Edit node properties (label, description, group)
- [x] Delete node with confirmation
- [x] Visual indicators (edit, delete, join, drill-down icons)
- [x] Group-based coloring and sizing
- [x] HTML support in descriptions

### Link Management
- [x] Drag-to-create links (join icon)
- [x] Visual feedback during drag (dashed line)
- [x] Snap distance validation
- [x] Auto-generate UUID for links
- [x] Edit link properties (type, label, direction)
- [x] Delete links
- [x] Support for multiple link types (flow, internal, admin)
- [x] Support for multiple links between same nodes
- [x] Prevent self-loops

### Drill-Down/Subgraphs
- [x] Drill-down icon (center of node)
- [x] Create empty subgraph if none exists
- [x] Navigate to existing subgraph
- [x] Breadcrumb navigation
- [x] Active crumb indication
- [x] Only visible in builder mode

### Data Management
- [x] Export to JSON
- [x] Import from JSON
- [x] Data validation on import
- [x] Preserve nested subgraphs

### Settings
- [x] Settings sidebar
- [x] Adjust default radius per group
- [x] Color swatches for groups
- [x] Real-time updates

### Context Menus
- [x] Canvas context menu (create node)
- [x] Node context menu (edit, delete, drill-down)
- [x] Link context menu (edit, delete)
- [x] Keyboard shortcuts (Escape to close)

### Visual Design
- [x] Modern UI with Inter font
- [x] Color-coded entity groups
- [x] Smooth animations
- [x] Hover effects
- [x] Modal animations
- [x] Responsive design considerations

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Open graph_builder.html in browser
- [ ] Verify default view mode loads correctly
- [ ] Toggle to builder mode
- [ ] Toggle back to view mode

### Node Creation & Editing
- [ ] Right-click canvas → Create node
- [ ] Verify UUID generated for ID
- [ ] Edit label
- [ ] Edit description (try HTML: `<b>bold</b>`)
- [ ] Change group (verify color changes)
- [ ] Verify size updates with group
- [ ] Click edit icon (pencil)
- [ ] Verify properties persist after save

### Node Deletion
- [ ] Click delete icon (minus)
- [ ] Confirm deletion prompt
- [ ] Verify node removed
- [ ] Verify connected links removed

### Link Creation
- [ ] Click and hold join icon (circle at bottom)
- [ ] Drag to another node
- [ ] Verify dashed line follows cursor
- [ ] Release near target node
- [ ] Verify link created
- [ ] Try creating link far from any node (should fail)
- [ ] Try creating self-loop (should fail with console error)

### Link Editing & Deletion
- [ ] Right-click link info icon → Edit
- [ ] Change type (flow/internal/admin)
- [ ] Add label
- [ ] Change direction
- [ ] Right-click link → Delete
- [ ] Verify link removed

### Multiple Links
- [ ] Create multiple links between same two nodes
- [ ] Verify all created successfully
- [ ] Edit each independently
- [ ] Delete each independently

### Drill-Down
- [ ] Click center icon on node without subgraph
- [ ] Verify empty subgraph created
- [ ] Create nodes in subgraph
- [ ] Verify breadcrumb updates
- [ ] Click breadcrumb to go back
- [ ] Click center icon on node with subgraph
- [ ] Verify navigation to existing subgraph

### Context Menus
- [ ] Right-click canvas (view mode) → Nothing
- [ ] Right-click canvas (builder mode) → Create Node
- [ ] Right-click node → Edit, Delete, Drill-down
- [ ] Right-click link → Edit, Delete
- [ ] Press Escape → Menu closes
- [ ] Click outside menu → Menu closes

### Settings Sidebar
- [ ] Click Settings button
- [ ] Verify sidebar slides in
- [ ] Adjust radius for a group
- [ ] Verify nodes of that group update size
- [ ] Close sidebar
- [ ] Create new node of that group
- [ ] Verify new size applied

### Import/Export
- [ ] Click Export
- [ ] Verify JSON file downloads
- [ ] Open JSON in text editor
- [ ] Verify structure correct
- [ ] Click Import
- [ ] Select exported JSON
- [ ] Verify graph loads correctly
- [ ] Verify nested subgraphs preserved

### Validation
- [ ] Try creating duplicate node ID (console error expected)
- [ ] Try self-loop (console error expected)
- [ ] Import invalid JSON (error message expected)

### View Mode Features
- [ ] Switch to view mode
- [ ] Verify builder icons hidden
- [ ] Click node info icon
- [ ] Verify modal opens
- [ ] Click link info icon
- [ ] Verify modal opens
- [ ] Click node with subgraph
- [ ] Verify navigation works

### Visual & Interaction
- [ ] Hover over nodes (glow effect)
- [ ] Hover over builder icons (scale up)
- [ ] Drag nodes (position updates)
- [ ] Zoom in/out (mouse wheel)
- [ ] Pan canvas (click and drag background)
- [ ] Verify force layout stabilizes

## 🐛 Known Issues & Edge Cases

### To Watch For
1. Link creation on moving nodes (force simulation active)
2. Rapid clicking during animations
3. Very large graphs (performance)
4. Deeply nested subgraphs (navigation)
5. Browser back button (not handled)

### Console Errors to Monitor
- "Validation Error: Node ID ... already exists"
- "Validation Error: Self-loop detected"
- "Invalid JSON file"

## 📝 Testing Notes Template

```
Date: ___________
Browser: _________
OS: ______________

Feature Tested: ________________
Result: [ ] Pass [ ] Fail
Notes:


Issues Found:


```

## 🔧 Debug Mode

Add to console for debugging:

```javascript
// Check current graph data
console.log(graph.getCurrentData());

// Check builder state
console.log('Builder Mode:', builder.isBuilderMode);

// Check groups
console.log('Groups:', myGroups.groups);

// Export current state
builder.exportData();
```

## 📊 Performance Metrics

Test with:
- Small graph: 5-10 nodes
- Medium graph: 20-50 nodes
- Large graph: 100+ nodes

Monitor:
- Render time
- Drag responsiveness
- Memory usage
- Animation smoothness

## 🎯 User Acceptance Criteria

All features should:
1. Work without console errors
2. Provide visual feedback
3. Be intuitive to use
4. Handle errors gracefully
5. Maintain data integrity
