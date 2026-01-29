```
I want to create a frontend application (using HTML5, Vanilla JS with d3.js and CSS3) which can help me make sense of all the github repositories of an account. I want to be able to annotate and tag (with some metadata) the repositories. Although, I am starting with making sense of github repos, but I want the app to be generic, I want to be able to plug some data and make sense of it. It may need to connect to some other service, fetch data from there, map it to data which the app understands and populate the UI.

1. According to responsibility, everything feature should be modular (especially JS). It should be in plug and play manner, with well defined API of each module. For example storage module, which may have different channels like local storage, session storage, IndexDB or remote API.
2. The UX may be in different modes. The user can switch between them during the entire workflow. First mode could be traditional lists, tables (made using flex and grid) and forms. The second mode could show them like directory and file access on a computer where user make updates to "dir" or "file" metadata by clicking on some edit icon, there could be a directory tree like navigation for this view. Third mode could be a Tree (like organisation chart) like view which user can click and drill-down into it's component.
3. The data for UX should exist entirely in JSON or Entirely in HTML (both formats should be interchangeable).
4. The user would add notes and other metadata (maybe some flag) and store the information.
5. After requesting data from the remote (maybe some server or github or gitlab) it should be able to work offline (do necessary things like switching storage to local storage etc.). There should be work mode module which can be switched to offline or online. Going back online should sync data with remote, if required, and do other tasks.


Important considerations
1. Make the app generic which could represent data from code versioning apps like github or bitbucket, or some other service which has entirely different data, but has similar code organisation. Best approach would be to create a data structure which represents the way data is being stored in github. A data structure which holds entities like (organisations, collaborators, repositories etc.) and their interactions with ACL
2. The data representation should be very well defined so that it's easy to switch between UX modes, there should be one to one mapping of entities and interactions in one mode with entities and interactions in another mode. These mappings should be stored in a data structure (or interface) as well. So that creating a new UX flow or UX mode is easy.


Task
Create architecture of such an application. Create an exhaustive list of modules and their APIs. Create a folder structure for the app.


Ask questions to understand it better and fill in gaps so that the app gets to be production ready as soon as possible.
```
```
Developing Visualization Frontend

I'm working on a data visualization and management frontend, leaning heavily on HTML5, Vanilla JS, CSS3, and D3.js. The goal is a generic tool that can handle data from various sources, initially focusing on GitHub repositories, but adaptable for others. I'm prioritizing List/Table, File/Directory Explorer, and Tree/Org Chart visualizations using D3.js, with added annotation capabilities.

Defining Architecture & Layers

I've been solidifying the architecture. I'm focusing on modularity with a core engine orchestrating a well-defined layered system. This includes a canonical data model, storage abstraction for LocalStorage, IndexedDB, and remote storage, sync logic, and adapters for different data sources. The view layer will offer multiple modes while sharing the core model, with reactive state management to track data changes.
```
This is a sophisticated architectural challenge. To build a "Production Ready" generic data explorer that handles offline states and multiple UX paradigms, we need a **Schema-First** approach with a **Hexagonal Architecture** (Ports and Adapters) adapted for the frontend.

Here is the proposed architecture for the application, which we will call **"Universal Entity Explorer (UEE)."**

---

### 1. The Core Data Structure (The "Canonical" Model)
To make the app generic, we will use a **Graph-based Entity Model**. Every piece of data (User, Repo, Org, Folder) is an `Entity`.

```json
{
  "uid": "unique-id-123",
  "type": "repository", // or "organization", "contributor", "file"
  "label": "My Project",
  "description": "...",
  "relationships": [
    { "target": "uid-parent", "type": "belongs_to", "role": "child" },
    { "target": "user-456", "type": "managed_by", "acl": "admin" }
  ],
  "metadata": { 
     "stars": 10, 
     "language": "JS" 
  },
  "annotations": [
    { "key": "status", "value": "reviewed", "timestamp": "..." }
  ],
  "system": {
    "source": "github",
    "lastSynced": "...",
    "isDirty": false
  }
}
```

---

### 2. Module Definitions and APIs

#### A. Storage Module (`StorageProvider`)
Abstracts where data lives.
*   **API:**
    *   `connect(config)`: Initialize connection.
    *   `get(id)`: Retrieve entity.
    *   `save(entity)`: Persist entity.
    *   `query(criteria)`: Filtered search.
    *   `getBulk()`: Fetch all for offline caching.

#### B. Adapter Module (`DataSourceAdapter`)
Converts external API responses into the Canonical Model.
*   **API:**
    *   `fetchRemote(params)`: Call GitHub/Bitbucket API.
    *   `transform(rawData)`: Map external JSON to our Canonical Entity structure.
    *   `reverseTransform(entity)`: (Optional) For pushing updates back to source.

#### C. Work Mode Module (`SyncEngine`)
Manages the "Online/Offline" state and synchronization queue.
*   **API:**
    *   `setMode(mode)`: 'online' | 'offline'.
    *   `getPendingChanges()`: List of locally modified entities.
    *   `sync()`: Conflict resolution and pushing local changes to remote.

#### D. View Engine (`ViewManager`)
Handles the switching between UX modes.
*   **API:**
    *   `registerMode(name, class)`: Add new UX modes (Tree, Table, etc.).
    *   `switchMode(name)`: Unmount current view, mount new one.
    *   `render(data)`: Pass canonical data to the active view.

---

### 3. Folder Structure

```text
/uee-app
├── index.html          # Entry point
├── css/
│   ├── main.css        # Base styles, variables
│   ├── layout-grid.css # Mode 1: Lists/Tables
│   ├── layout-dir.css  # Mode 2: Explorer view
│   └── layout-tree.css # Mode 3: D3 Tree
├── src/
│   ├── app.js          # App Bootstrapper & State Orchestrator
│   ├── core/           # Business Logic
│   │   ├── State.js    # Observer-based state management
│   │   └── Schema.js   # Definition of Entity structure
│   ├── modules/        # Plug-and-play modules
│   │   ├── storage/    │   ├── LocalStorageProvider.js
│   │   │   ├── IndexedDBProvider.js
│   │   │   └── RemoteAPIProvider.js
│   │   ├── sync/
│   │   │   └── SyncManager.js
│   │   └── adapters/
│   │       ├── GitHubAdapter.js
│   │       └── GenericJSONAdapter.js
│   ├── components/     # UI Components (Vanilla JS)
│   │   ├── Toolbar.js  # Search, Mode Switcher, Sync status
│   │   └── Annotator.js# Metadata editing form
│   └── views/          # UX Modes
│       ├── ListView.js # Mode 1
│       ├── FileView.js # Mode 2
│       └── TreeView.js # Mode 3 (D3.js implementation)
└── assets/             # Icons, images
```

---

### 4. Implementation Details (The "Interchangeable" Requirement)
To satisfy the **JSON/HTML interchangeability**, we will use **Data-Attributes** in the DOM.
*   When rendering a "Repo" in HTML, the element will look like: 
    `<div class="entity" data-uid="123" data-type="repository">...</div>`.
*   A `DOMParser` utility will be able to scrape these elements back into the Canonical JSON model if the JavaScript state is lost.

---

### 5. Questions to Refine the Architecture

Before proceeding to code, we must address these gaps:

1.  **Conflict Resolution Strategy:** When you go back "Online," and a repository was updated on GitHub *and* you added a local annotation, which one wins? (Options: Last-write-wins, Manual Merge, or Remote-wins-but-keep-annotations).
2.  **Depth of Granularity:** For GitHub, are we stopping at the "Repository" level, or do we need to drill down into "Files/Blobs" inside the repo? This changes how much data we store in IndexedDB.
3.  **Authentication:** How should the app handle Auth? Should the `Adapter` module handle OAuth tokens, or should there be a separate `IdentityModule`?
4.  **D3.js Scale:** If a user has 500+ repositories, a Tree view can become unreadable. Should the Tree view support "Lazy Loading" (fetching branches only when clicked)?
5.  **Schema Mapping:** Since you want it generic, do we need a UI for "Mapping"? (e.g., a screen where a user says "Map the field `stargazers_count` from the API to my `metadata.popularity` field").

### 6. Suggested Next Steps
1.  **Phase 1:** Build the `State.js` (Observer) and `GitHubAdapter.js`.
2.  **Phase 2:** Implement `LocalStorageProvider` and the basic `ListView`.
3.  **Phase 3:** Implement the D3.js `TreeView` using the same data source.
4.  **Phase 4:** Add the `SyncManager` for offline/online toggling.

**Would you like me to provide a boilerplate for a specific module (e.g., the SyncManager or the D3 TreeView) first?**