# Graph Builder - Visual Reference Card

## 🎨 Icon Legend

### Builder Mode Icons (Only visible in Build Mode)

```
      ✏️ Edit
        |
  −  ● NODE ●  
        |
        ○ Join (Drag to Link)
        |
      📊 Drill-Down
```

#### Icon Functions:

| Icon | Position | Action | Description |
|------|----------|--------|-------------|
| **○** | Bottom | Drag | Create link to another node |
| **✏️** | Top-Right | Click | Edit node properties |
| **−** | Top-Left | Click | Delete node |
| **📊** | Center | Click | Create/enter subgraph |

### View Mode Icons

| Icon | Location | Action | Description |
|------|----------|--------|-------------|
| **ℹ️** | Node | Click | View node details |
| **ℹ️** | Link | Click | View link details |

## 🎯 Context Menus

### Canvas (Right-Click Empty Space)
```
┌─────────────────────┐
│ ➕ Create Node     │
└─────────────────────┘
```

### Node (Right-Click Node)
```
┌─────────────────────────┐
│ ✏️ Edit Properties     │
│ 🗑️ Delete Node         │
├─────────────────────────┤
│ 📊 Create/Enter Subgraph│
└─────────────────────────┘
```

### Link (Right-Click Link Info Icon)
```
┌─────────────────────┐
│ ✏️ Edit Properties │
│ 🗑️ Delete Link     │
└─────────────────────┘
```

## 🎨 Entity Group Colors

```
🔵 Central Unit     #2563eb  (Blue)
🟢 Operating Unit   #059669  (Green)  
🟠 End User         #d97706  (Orange)
🟣 Support System   #7c3aed  (Purple)
⚫ Internal         #475569  (Gray)
```

## 🖱️ Mouse Actions

### Basic Navigation
```
Action              | Result
--------------------|---------------------------
Scroll Wheel        | Zoom in/out
Click + Drag BG     | Pan canvas
Click Node          | Navigate subgraph (View Mode)
Drag Node           | Move position
```

### Builder Mode
```
Action                    | Result
--------------------------|---------------------------
Right-Click Canvas        | Open create menu
Right-Click Node          | Open node menu
Right-Click Link          | Open link menu
Click ○ + Drag to Node   | Create link
Click ✏️ Icon            | Edit properties
Click − Icon             | Delete (with confirm)
Click 📊 Icon            | Create/enter subgraph
```

## ⌨️ Keyboard Shortcuts

```
Key         | Action
------------|-------------------------
Escape      | Close menu/modal
```

## 🎛️ UI Controls

### Top Bar - Left
```
┌─────────────────────────────┐
│ BBPS Architecture Builder   │
│ Build & Visualize Graphs    │
└─────────────────────────────┘
```

### Top Bar - Right
```
┌────────────────────────────────────┐
│ [👁️ View] [🔧 Build]              │
│ [📥 Import] [📤 Export] [⚙️ Settings] │
└────────────────────────────────────┘
```

### Breadcrumbs
```
[Root] > [Node A] > [Sub Node B]
  ↑        ↑            ↑
 Click to navigate back  Active
```

### Settings Sidebar (Right Panel)
```
┌──────────────────────┐
│ Group Settings    [×]│
├──────────────────────┤
│ 🔵 Central Unit      │
│   Radius: [40]       │
│                      │
│ 🟢 Operating Unit    │
│   Radius: [30]       │
│                      │
│ ... more groups ...  │
└──────────────────────┘
```

## 📝 Property Editor Forms

### Node Properties
```
┌─────────────────────────┐
│ Edit Node Properties [×]│
├─────────────────────────┤
│ ID: uuid-1234 (readonly)│
│ Label: [____________]   │
│ Group: [🔵][🟢][🟠]... │
│ Description:            │
│ [___________________]   │
│ [___________________]   │
│                         │
│ 💡 Change size via      │
│    Settings panel       │
│                         │
│      [Cancel] [Save]    │
└─────────────────────────┘
```

### Link Properties
```
┌─────────────────────────┐
│ Edit Link Properties [×]│
├─────────────────────────┤
│ ID: uuid-5678 (readonly)│
│ From: Node A (readonly) │
│ To: Node B (readonly)   │
│ Type: [flow ▼]          │
│ Label: [____________]   │
│ Direction: [forward ▼]  │
│                         │
│      [Cancel] [Save]    │
└─────────────────────────┘
```

## 🔄 Link Creation Flow

```
Step 1: Click ○ icon          Step 2: Drag to target
   ○                              ○
   |                              |·····
   ●                              ●     ·····
                                           ·····○
                                                |
                                                ●

Step 3: Release                Step 4: Edit properties
   ○                          [Edit Link Properties]
   |────────────────>○         Type: flow
   ●                 |         Label: connects to
                     ●         Direction: forward
```

## 📊 Drill-Down Visualization

```
Level 0: Root
┌──────────────────────────┐
│  ●────●────●             │  [Root]
│   \   |   /              │
│    \  |  /               │
│     \ | /                │
│      ●●●                 │
└──────────────────────────┘

Level 1: Node A Interior
┌──────────────────────────┐
│     ●──●──●              │  [Root] > [Node A]
│     |  |  |              │
│     ●──●──●              │
└──────────────────────────┘

Level 2: Sub-component
┌──────────────────────────┐
│       ●────●             │  [Root] > [Node A] > [Component X]
│        \  /              │
│         ●                │
└──────────────────────────┘
```

## 🎯 Node States

### View Mode
```
Normal:        Hover:         Has Subgraph:
   ●             ⊙               ●  
  Node          Node           ╱ ╲ Node
                (glow)         (dashed border)
```

### Builder Mode
```
Selected for Edit:    During Link Drag:
    ✏️                      ●
   − ● −                   /·\
     ○                    /···\○ (dragging)
    📊                   /·····\
                        ●───────● (target)
```

## 💾 Data Flow

```
User Action
    ↓
Context Menu / Icon Click
    ↓
Property Editor (if needed)
    ↓
Validation
    ↓
Update Data Model
    ↓
Re-render Graph
    ↓
Update Builder Icons (if in Build Mode)
```

## 🎨 Color Coding Best Practices

```
Use Colors to Indicate:

🔵 Blue   → Critical/Core systems
🟢 Green  → Services/Business logic
🟠 Orange → User-facing/External
🟣 Purple → Support/Monitoring
⚫ Gray   → Utilities/Helpers
```

## 📏 Size Guidelines

```
Size    | Use For
--------|-------------------------
10-20px | Small utilities
20-30px | Standard components
30-40px | Important services
40-50px | Core systems
50+px   | Major hubs
```

## ✅ Quick Checklist

Before Building:
- [ ] Plan structure on paper
- [ ] Identify entity groups
- [ ] Determine hierarchy levels

While Building:
- [ ] Use descriptive labels
- [ ] Group by color consistently
- [ ] Add HTML descriptions
- [ ] Create subgraphs for complex nodes
- [ ] Export regularly

After Building:
- [ ] Review in View Mode
- [ ] Test navigation
- [ ] Export final version
- [ ] Share with team

## 🚨 Visual Alerts

### Success
```
Link Created: ●───────●
Node Added:   ✨ ●
Export:       📥 ✓
```

### Warning
```
Self-Loop:    ●↺ (console error)
Duplicate ID: ⚠️ (console error)
```

### Info
```
Subgraph Created: 📊 ●
Mode Switched:    👁️/🔧
Settings Changed: ⚙️ ✓
```

---

## 📱 Print This Card

Print this reference card and keep it handy while building graphs!

**Tip**: Laminate it for durability 😊

---

**Version**: 1.0.0  
**Last Updated**: January 13, 2026
