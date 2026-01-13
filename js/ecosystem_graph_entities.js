class EntityGroups {
    constructor(initialGroups = {}) {
        this.groups = new Map();
        this.container = null;

        for (const [key, value] of Object.entries(initialGroups)) {
            this.add(key, value);
        }

        this._ensureDefault();
    }

    renderLegend(containerSelector) {
        if (containerSelector) {
            this.container = typeof containerSelector === 'string'
                ? document.querySelector(containerSelector)
                : containerSelector;
        }
        this._render();
    }

    //props - { color, label, radius }
    add(key, props) {
        this.groups.set(key, {
            color: props.color || '#94a3b8',
            label: props.label || this._formatLabel(key),
            radius: props.radius || 20 // Default radius setting
        });
        this._render();
    }

    update(key, newProps) {
        if (!this.groups.has(key)) return;
        const current = this.groups.get(key);
        this.groups.set(key, { ...current, ...newProps });
        this._render();
    }

    remove(key) {
        if (key === 'default') return;
        this.groups.delete(key);
        this._render();
    }

    get(key) {
        return this.groups.get(key) || this.groups.get('default');
    }

    getColor(key) { return this.get(key).color; }

    getRadius(key) { return this.get(key).radius; }

    _ensureDefault() {
        if (!this.groups.has('default')) {
            this.groups.set('default', { color: '#000000', label: 'Default', radius: 15 });
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

        this.groups.forEach((value, key) => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; align-items: center; margin-right: 15px; margin-bottom: 5px; font-size: 12px; font-family: sans-serif; cursor: default;';
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