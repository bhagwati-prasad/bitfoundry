# Global Classes Index

This file lists the primary global classes defined in the workspace with a short description and a link to where the class is defined.

- **DOMCache**: Utility for caching DOM lookups and queries used by the D3 graph helper code. File: [js/d3graph/dom_cache.js](js/d3graph/dom_cache.js#L1)
- **EcosystemGraphBuilder**: Builder-mode helper that provides node/link creation, edit and delete UI, drag-to-create links, and context menus. File: [js/d3graph/ecosystem_graph_builder.js](js/d3graph/ecosystem_graph_builder.js#L3)
- **EntityGroups**: Manages node groups (colors, radii, metadata) and renders the legend. File: [js/d3graph/ecosystem_graph_entities.js](js/d3graph/ecosystem_graph_entities.js#L1)
- **EcosystemGraph**: Main graph renderer using D3 force simulation, rendering nodes, links, icons and handling navigation/view stack. File: [js/d3graph/ecosystem_graph.js](js/d3graph/ecosystem_graph.js#L1)
- **GraphModal**: Modal for graph-level dialogs that extends `BaseModal`. File: [js/d3graph/graph_modal.js](js/d3graph/graph_modal.js#L2)
- **BaseModal**: Generic modal base class used by other modal components. File: [js/d3graph/modal_base.js](js/d3graph/modal_base.js#L3)
- **PropertyEditor**: Modal UI for editing node and link properties. File: [js/d3graph/property_editor.js](js/d3graph/property_editor.js#L3)
- **GraphUtils**: Static utility class with helpers (UUID, export/import, validation, etc.). File: [js/d3graph/utils.js](js/d3graph/utils.js#L3)
- **ContextMenu**: Lightweight context-menu implementation used in builder mode. File: [js/lib/context_menu.js](js/lib/context_menu.js#L3)
- **StorageError / StorageAdapter / Storage**: Storage abstractions and error type used by the app. File: [js/lib/storage.js](js/lib/storage.js#L1)

## Tree / Renderer Classes
- **ASCIIRenderer**: Renders tree structures as ASCII. File: [js/tree/ascii_renderer.js](js/tree/ascii_renderer.js#L4)
- **DirectoryRenderer**: Renders a directory-style view of a tree. File: [js/tree/directory_renderer.js](js/tree/directory_renderer.js#L4)
- **DrillDownRenderer**: Drill-down renderer for tree navigation. File: [js/tree/drilldown_renderer.js](js/tree/drilldown_renderer.js#L4)
- **TreeBuilder**: High-level tree builder utility used by the tree demo. File: [js/tree/index.js](js/tree/index.js#L21)
- **TreeNode**: Data structure representing a tree node. File: [js/tree/tree_node.js](js/tree/tree_node.js#L4)
- **Tree**: Simple tree structure and helpers. File: [js/tree/tree_structure.js](js/tree/tree_structure.js#L6)
