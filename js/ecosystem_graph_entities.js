class EntityGroups {
    constructor(initialGroups = {}) {
        this.groups = new Map();
        this.container = null;

        for (const [key, value] of Object.entries(initialGroups)) {
            this.add(key, value);
        }

        this._ensureDefault();
    }

    renderLegend(containerSelector, builderMode = false) {
        if (containerSelector) {
            this.container = typeof containerSelector === 'string'
                ? document.querySelector(containerSelector)
                : containerSelector;
        }
        this.builderMode = builderMode;
        this._render();
    }

    // props - { id, title, color, radius, description } or legacy { color, label, radius }
    add(key, props) {
        this.groups.set(key, {
            id: props.id || key,
            color: props.color || '#94a3b8',
            label: props.title || props.label || this._formatLabel(key),
            title: props.title || props.label || this._formatLabel(key),
            radius: props.radius || 20,
            description: props.description || ''
        });
        this._render();
    }

    update(key, newProps) {
        if (!this.groups.has(key)) return;
        const current = this.groups.get(key);
        const updated = { ...current, ...newProps };
        // Keep title and label in sync
        if (newProps.title) updated.label = newProps.title;
        if (newProps.label) updated.title = newProps.label;
        this.groups.set(key, updated);
        this._render();
    }

    remove(key) {
        if (key === '3f4e5d6c-7b8a-49f0-ae1d-2c3b4a5e6d7f') return; // Prevent default group deletion
        this.groups.delete(key);
        this._render();
    }

    get(key) {
        if (this.groups.has(key)) {
            return this.groups.get(key);
        }
        // Fallback to default group by UUID
        return this.groups.get('3f4e5d6c-7b8a-49f0-ae1d-2c3b4a5e6d7f');
    }

    getColor(key) { return this.get(key).color; }

    getRadius(key) { return this.get(key).radius; }

    _ensureDefault() {
        // Check if default exists by UUID
        if (!this.groups.has('3f4e5d6c-7b8a-49f0-ae1d-2c3b4a5e6d7f')) {
            this.groups.set('3f4e5d6c-7b8a-49f0-ae1d-2c3b4a5e6d7f', { 
                id: '3f4e5d6c-7b8a-49f0-ae1d-2c3b4a5e6d7f',
                color: '#000000', 
                label: 'Default',
                title: 'Default',
                radius: 15,
                description: 'Default group for uncategorized entities'
            });
        }
    }

    _formatLabel(key) {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    _render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.className = 'legend-container';
        const fragment = document.createDocumentFragment();

        // Add 'Add Group' button in builder mode (leftmost position)
        if (this.builderMode) {
            const addBtn = document.createElement('div');
            addBtn.className = 'legend-add-group-btn';
            addBtn.title = 'Add new group';
            addBtn.innerHTML = '<span class="add-icon">+</span><span>Add Group</span>';
            addBtn.addEventListener('click', () => {
                if (window.builder && typeof window.builder.showAddGroupModal === 'function') {
                    window.builder.showAddGroupModal();
                }
            });
            fragment.appendChild(addBtn);
        }

        this.groups.forEach((value, key) => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; align-items: center; margin-right: 15px; font-size: 12px; font-family: sans-serif; cursor: default;';
            item.title = `Group: ${key}`;

            const swatch = document.createElement('span');
            // Visualizing size difference in legend is optional but nice
            const size = Math.min(16, Math.max(8, value.radius / 2));
            swatch.style.cssText = `width: ${size}px; height: ${size}px; background-color: ${value.color}; display: inline-block; margin-right: 6px; border-radius: 50%; box-shadow: 0 0 0 1px rgba(0,0,0,0.1);`;

            const text = document.createElement('span');
            text.innerText = value.label;

            item.appendChild(swatch);
            item.appendChild(text);
            fragment.appendChild(item);
        });

        this.container.appendChild(fragment);
    }
}