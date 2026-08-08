# Global Objects Index

This file lists important global objects and functions that are attached to the `window` object (or otherwise used globally) with a short description and a link to where they are defined.

- **`D3Layouts`**: Layout registry and helpers (`resolveLayoutName`, `applyHierarchyLayout`, `applyRopeLayout`, `layoutRegistry`). Exposed on `window.D3Layouts` by the layout module. File: [js/d3graph/layouts.js](js/d3graph/layouts.js#L213)
- **`applyRopeLayoutToGraph`**: Runtime helper to apply the `hierarchy.rope` layout to the current graph DOM without mutating data. Exposed as `window.applyRopeLayoutToGraph`. File: [js/d3graph/apply_rope_runtime.js](js/d3graph/apply_rope_runtime.js#L129)
- **`restoreGraphLayout`**: Function exposed by the runtime helper to restore normal graph rendering after a preview layout. Exposed as `window.restoreGraphLayout`. File: [js/d3graph/apply_rope_runtime.js](js/d3graph/apply_rope_runtime.js#L113)
- **`graph`**: Some runtime helpers reference `window.graph` as the current `EcosystemGraph` instance (set in runtime snippets / demos). File: [js/d3graph/apply_rope_runtime.js](js/d3graph/apply_rope_runtime.js#L1)
- **`builder`**: Builder-mode instance is exposed in the page scaffolds so UI code can call builder helpers (e.g., `showAddGroupModal`). Set in page scripts (see `index.html`). File: [index.html](index.html#L493)

## Demo Globals (tree demo)
- **`tree`**: Demo `Tree` instance exposed for interactive demos. File: [tree_demo.html](tree_demo.html#L405)
- **`asciiRenderer`**: Demo `ASCIIRenderer` instance (window.asciiRenderer). File: [tree_demo.html](tree_demo.html#L406)
- **`directoryRenderer`**: Demo `DirectoryRenderer` instance (window.directoryRenderer). File: [tree_demo.html](tree_demo.html#L407)
- **`drilldownRenderer`**: Demo `DrillDownRenderer` instance (window.drilldownRenderer). File: [tree_demo.html](tree_demo.html#L408)

If you'd like, I can:
- Expand each entry with method/property lists (auto-extracted),
- Move this into a single `doc/GLOBALS.md` with cross-links, or
- Generate a JSON file usable by a docs site generator.
