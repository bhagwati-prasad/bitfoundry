# Graph Builder - Usage Examples

## Getting Started

### 1. Opening the Builder

Open `graph_builder.html` in your browser. You'll see the graph in View mode by default.

```
http://localhost:8080/graph_builder.html
```

### 2. Switching to Builder Mode

Click the "🔧 Build" button in the top-right header.

## Creating Your First Graph

### Step 1: Create Root Node

1. **Right-click** on the empty canvas
2. Select **"Create Node"**
3. The property editor opens automatically
4. Set properties:
   - Label: `"Root System"`
   - Description: `"<b>Main</b> entry point"`
   - Group: Select the blue swatch (Central)
5. Click **"Save"**

### Step 2: Create Child Nodes

1. **Right-click** canvas again
2. Create another node with Label: `"Service A"`
3. Create third node with Label: `"Service B"`

### Step 3: Connect Nodes

1. Click and **hold** the **○ (join icon)** at the bottom of "Root System"
2. **Drag** to "Service A" node
3. **Release** when close to the target
4. In the property editor:
   - Type: `flow`
   - Label: `"Connects to"`
   - Direction: `forward`
5. Click **"Save"**
6. Repeat to connect "Root System" to "Service B"

### Step 4: Create Subgraph

1. Click the **📊 (center icon)** on "Service A"
2. An empty subgraph is created
3. Notice the breadcrumb: `Root System > Service A Subgraph`
4. Right-click and create nodes inside this subgraph
5. Click **"Root System"** in breadcrumb to go back

## Advanced Examples

### Creating Bidirectional Links

```javascript
// Create node A and B first, then:

// 1. Create forward link (A → B)
// Drag from A's join icon to B
// Set direction: "forward"

// 2. Create backward link (B → A)
// Drag from B's join icon to A
// Set direction: "backward"

// OR create a single bidirectional link:
// Drag from A to B, set direction: "bidirectional"
```

### Setting Up Complex Hierarchies

```
Root
├── Authentication Service
│   ├── OAuth Provider
│   ├── Token Manager
│   └── User Session
├── API Gateway
│   ├── Rate Limiter
│   └── Load Balancer
└── Database Layer
    ├── Primary DB
    └── Replica DB
```

**How to build:**

1. Create "Root" node
2. Create "Authentication Service", "API Gateway", "Database Layer"
3. Link Root to each
4. Click center icon on "Authentication Service"
5. Create "OAuth Provider", "Token Manager", "User Session" inside
6. Go back and repeat for others

### Organizing with Groups

**Best Practices:**

- **Central** (Blue): Core systems, main hubs
- **Operating Unit** (Green): Business logic services
- **End User** (Orange): External endpoints, user interfaces
- **Support** (Purple): Monitoring, logging, admin tools
- **Internal** (Gray): Helper services, utilities

### Adjusting Node Sizes

1. Click **⚙️ Settings** button
2. Find the group (e.g., "Central Unit")
3. Adjust "Default Radius" (range: 10-100)
4. All nodes of that group resize immediately
5. New nodes inherit this size

## Common Workflows

### Workflow 1: Import Existing Data

```javascript
// Prepare your JSON file in this format:
{
  "id": "my-graph",
  "label": "My System",
  "nodes": [
    {
      "id": "uuid-1",
      "label": "Node 1",
      "group": "central",
      "desc": "Description"
    }
  ],
  "links": [
    {
      "id": "uuid-link-1",
      "source": "uuid-1",
      "target": "uuid-2",
      "type": "flow",
      "label": "Connection"
    }
  ]
}
```

1. Click **📥 Import**
2. Select your JSON file
3. Graph loads automatically

### Workflow 2: Export for Backup

1. Click **📤 Export**
2. File downloads as `ecosystem_graph_export.json`
3. Save to version control or backup

### Workflow 3: Iterative Design

1. **View Mode**: Show to stakeholders
2. **Builder Mode**: Make changes based on feedback
3. **Export**: Save version
4. **Import**: Restore if needed
5. Repeat

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close context menu or modal |
| `Right-click` | Open context menu |
| `Click + Drag` (node) | Move node |
| `Click + Drag` (join icon) | Create link |
| `Scroll` | Zoom in/out |
| `Click + Drag` (background) | Pan canvas |

## Tips & Tricks

### 1. Quick Node Positioning

After creating a node, **immediately drag it** to desired position before the force simulation stabilizes.

### 2. Visual Hierarchy

Use different group colors to indicate:
- **Blue**: Core/important
- **Green**: Business logic
- **Orange**: External/endpoints
- **Purple**: Support systems
- **Gray**: Utilities

### 3. Meaningful Labels

Instead of technical IDs, use descriptive labels:
- ✅ `"User Authentication Service"`
- ❌ `"auth-svc-01"`

### 4. Rich Descriptions

Use HTML in descriptions:

```html
<strong>Purpose:</strong> Handles user login<br>
<strong>Tech:</strong> Node.js + Redis<br>
<strong>Owner:</strong> Auth Team
```

### 5. Link Types by Context

- **flow**: Data/request flow
- **internal**: Internal communication
- **admin**: Management/config

### 6. Subgraph Strategy

Create subgraphs for:
- Internal architecture of a service
- Drill-down into complex subsystems
- Different deployment environments

### 7. Regular Exports

Export after major changes to avoid data loss.

## Troubleshooting

### Link won't create

**Problem**: Dragging doesn't create link

**Solution**:
- Ensure you're in Builder Mode
- Click and hold the join icon (○)
- Drag close enough to target (within 40px)
- Target must be a different node (no self-loops)

### Node properties won't save

**Problem**: Changes don't persist

**Solution**:
- Click "Save" button in modal
- Don't just close the modal

### Graph looks messy

**Problem**: Nodes overlap or poorly positioned

**Solution**:
- Manually drag nodes to better positions
- Wait for force simulation to stabilize
- Adjust node sizes via Settings

### Can't see builder icons

**Problem**: Edit/delete/join icons missing

**Solution**:
- Ensure Builder Mode is active (🔧 button highlighted)
- Toggle mode off and back on

### Import fails

**Problem**: "Invalid JSON file" error

**Solution**:
- Validate JSON syntax
- Ensure `nodes` and `links` arrays exist
- Check for duplicate node IDs
- Verify all link source/target IDs exist

## Example: BBPS System

Here's how to recreate the Bharat Bill Payment System:

1. **Create Root**: "BBPS Ecosystem"
2. **Create Main Entities**:
   - BBPCU (Central, large)
   - COU (Operating Unit)
   - BOU (Operating Unit)
   - DMS (Support)
   - Customer (End User)
3. **Link Flow**: Customer → COU → BBPCU → BOU
4. **Add Details**: Click BBPCU center icon
5. **Create Internal**: Switch, Router, Risk Engine
6. **Deeper Drill**: Click Clearing System center icon
7. **Add Components**: Net Calc, Collateral, File Gen

## Programmatic Usage

For developers integrating the builder:

```javascript
// Initialize
const graph = new EcosystemGraph(data, groups, config);
const builder = new EcosystemGraphBuilder(graph, groups);

// Enable builder mode
builder.enableBuilderMode();

// Add node programmatically
const nodeId = GraphUtils.generateUUID();
graph.addNode({
  id: nodeId,
  label: "My Node",
  group: "central",
  desc: "Description",
  x: 400,
  y: 300
});

// Add link programmatically
graph.addLink(nodeId, targetId, "flow");

// Export
builder.exportData();

// Import with callback
builder.importData((data) => {
  console.log('Loaded:', data);
});

// Access current data
const currentData = graph.getCurrentData();
console.log(currentData);
```

## Next Steps

1. ✅ Complete basic graph
2. ✅ Add subgraphs where needed
3. ✅ Export and backup
4. Share with team
5. Iterate based on feedback

---

**Need Help?** Check [BUILDER_README.md](BUILDER_README.md) for detailed API documentation.
