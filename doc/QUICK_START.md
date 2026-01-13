# Quick Start Guide - Graph Builder

## 🚀 Get Started in 5 Minutes

### Step 1: Open the Builder (30 seconds)

1. Open `graph_builder.html` in your browser
2. You'll see the existing ecosystem graph in **View Mode**

### Step 2: Switch to Builder Mode (5 seconds)

Click the **🔧 Build** button in the top-right corner.

### Step 3: Create Your First Node (1 minute)

1. **Right-click** anywhere on the canvas
2. Select **"Create Node"**
3. In the property editor:
   - Set **Label** to `"My First Node"`
   - Add **Description**: `"This is my first node!"`
   - Select a **color swatch** for the group
4. Click **"Save"**

### Step 4: Create a Second Node (30 seconds)

Repeat Step 3 with:
- Label: `"Second Node"`
- Different group color

### Step 5: Connect Them (30 seconds)

1. Find the **○ circle icon** at the bottom of "My First Node"
2. **Click and hold** the circle
3. **Drag** toward "Second Node"
4. **Release** when the line reaches the target
5. In the property editor that opens:
   - Type: `flow`
   - Label: `"connects to"`
6. Click **"Save"**

### Step 6: Edit Properties (30 seconds)

1. Click the **✏️ pencil icon** on any node
2. Change the label
3. Click **"Save"**

### Step 7: Create a Subgraph (1 minute)

1. Click the **📊 center icon** on "My First Node"
2. You're now inside the subgraph!
3. Notice the breadcrumb: `Root > My First Node Subgraph`
4. Create a node inside this subgraph
5. Click the breadcrumb to go back

### Step 8: Export Your Work (15 seconds)

1. Click **📤 Export** button
2. Your graph downloads as JSON
3. You can import it later with **📥 Import**

---

## 🎉 Congratulations!

You've just created, edited, and navigated a multi-level graph!

## 📚 Next Steps

- **Read**: [BUILDER_README.md](BUILDER_README.md) for complete features
- **Explore**: [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for workflows
- **Test**: [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for validation

## 🎯 Key Features Recap

### Building Blocks
- **○ Join Icon** (bottom): Drag to create links
- **✏️ Edit Icon** (top-right): Edit properties
- **− Delete Icon** (top-left): Remove node
- **📊 Drill Icon** (center): Create/enter subgraph

### Actions
- **Right-click Canvas**: Create new node
- **Right-click Node**: Edit, delete, or drill-down
- **Right-click Link**: Edit or delete link
- **Drag Node**: Reposition
- **Scroll**: Zoom in/out

### Modes
- **👁️ View**: Explore and present
- **🔧 Build**: Create and edit

## 🆘 Need Help?

### Common Questions

**Q: Link won't create?**  
A: Make sure you're dragging from the ○ icon at the bottom of the node, and release close to another node.

**Q: Can't see builder icons?**  
A: Click the 🔧 Build button to enter builder mode.

**Q: How to change node size?**  
A: Click ⚙️ Settings, then adjust the "Default Radius" for the group.

**Q: How to delete a link?**  
A: Right-click the **ℹ️ info icon** on the link, then select "Delete Link".

**Q: Changes not saving?**  
A: Make sure to click the "Save" button in the property editor modal.

## 📱 Tips

1. **Save Often**: Use Export regularly to backup your work
2. **Use Groups**: Color-code nodes by purpose
3. **Subgraphs**: Keep each level focused (5-15 nodes max)
4. **Descriptive Labels**: Use clear names like "User Service" not "svc1"
5. **HTML Descriptions**: Add rich formatting: `<b>bold</b>`, `<br>` for line breaks

## 🎨 Example Workflow

```
1. Plan your architecture on paper
2. Open graph_builder.html
3. Switch to Build mode
4. Create main components
5. Link them together
6. Add subgraphs for complex components
7. Export and share with team
8. Gather feedback
9. Import and iterate
```

## ⚡ Pro Tips

- **Drag during creation**: Position nodes immediately after creation
- **Use templates**: Export common patterns and reuse
- **Breadcrumbs**: Always check which level you're editing
- **Context menus**: Right-click everything to discover options
- **Settings first**: Set up groups and sizes before building

---

**Time to Build**: 5 minutes ✓  
**Difficulty**: Easy ✓  
**Fun**: Maximum ✓

Happy Building! 🎉
