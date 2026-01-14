class DOMCache {
    constructor() {
        this.cache = new Map();
        this.initialized = false;
    }

    // Initialize and cache all DOM elements
    init() {
        if (this.initialized) return;

        // Header elements
        this.set('graphTitle', document.getElementById('graph-title'));
        this.set('graphSubtitle', document.getElementById('graph-subtitle'));
        
        // Button elements
        this.set('saveBtn', document.getElementById('save-graph-btn'));
        this.set('viewerBtn', document.getElementById('viewer-mode-btn'));
        this.set('builderBtn', document.getElementById('builder-mode-btn'));
        this.set('importBtn', document.getElementById('import-btn'));
        this.set('exportBtn', document.getElementById('export-btn'));
        this.set('settingsBtn', document.getElementById('settings-btn'));
        this.set('closeSettingsBtn', document.getElementById('close-settings-btn'));
        
        // Sidebar elements
        this.set('leftSidebar', document.getElementById('left-sidebar'));
        this.set('sidebarToggle', document.getElementById('sidebar-toggle'));
        this.set('graphsList', document.getElementById('graphs-list'));
        this.set('graphsExpandBtn', document.getElementById('graphs-expand-btn'));
        this.set('addGraphBtn', document.getElementById('add-graph-btn'));
        
        // Settings elements
        this.set('settingsSidebar', document.getElementById('settings-sidebar'));
        this.set('settingsContent', document.getElementById('settings-content'));
        
        // Modal elements
        this.set('addGraphModal', document.getElementById('add-graph-modal'));
        this.set('newGraphName', document.getElementById('new-graph-name'));
        this.set('newGraphDescription', document.getElementById('new-graph-description'));
        
        // Add group modal elements
        this.set('newGroupLabel', document.getElementById('new-group-label'));
        this.set('newGroupColor', document.getElementById('new-group-color'));
        this.set('newGroupRadius', document.getElementById('new-group-radius'));

        this.initialized = true;
    }

    // Set an element in cache
    set(key, element) {
        if (element) {
            this.cache.set(key, element);
        }
        return element;
    }

    // Get an element from cache
    get(key) {
        return this.cache.get(key);
    }

    // Check if element exists in cache
    has(key) {
        return this.cache.has(key);
    }

    // Clear cache
    clear() {
        this.cache.clear();
        this.initialized = false;
    }

    // Refresh a specific element
    refresh(key, id) {
        const element = document.getElementById(id);
        return this.set(key, element);
    }
}

// Export singleton instance
const domCache = new DOMCache();
