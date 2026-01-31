// Reusable Context Menu Class

class ContextMenu {
    constructor(menuId = 'context-menu') {
        this.menuId = menuId;
        this.menu = null;
        this.items = [];
        this.isVisible = false;
        this._init();
    }

    _init() {
        // Create menu element
        this.menu = document.createElement('div');
        this.menu.id = this.menuId;
        this.menu.className = 'context-menu';
        this.menu.style.display = 'none';
        document.body.appendChild(this.menu);

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide();
            }
        });

        // Close menu on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }

    // Add menu item
    addItem(config) {
        /*
        config = {
            label: string,
            icon: string (optional),
            action: function,
            disabled: boolean (optional)
        }
        */
        this.items.push(config);
        return this;
    }

    addSeparator() {
        this.items.push({ type: 'separator' });
        return this;
    }

    clear() {
        this.items = [];
        this.menu.innerHTML = '';
        return this;
    }

    _render() {
        this.menu.innerHTML = '';

        this.items.forEach(item => {
            if (item.type === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                this.menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                
                if (item.disabled) {
                    menuItem.classList.add('disabled');
                }

                if (item.icon) {
                    const icon = document.createElement('span');
                    icon.className = 'context-menu-icon';
                    icon.innerHTML = item.icon;
                    menuItem.appendChild(icon);
                }

                const label = document.createElement('span');
                label.className = 'context-menu-label';
                label.textContent = item.label;
                menuItem.appendChild(label);

                if (!item.disabled && item.action) {
                    menuItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        item.action();
                        this.hide();
                    });
                }

                this.menu.appendChild(menuItem);
            }
        });
    }

    show(x, y) {
        this._render();
        
        this.menu.style.left = x + 'px';
        this.menu.style.top = y + 'px';
        this.menu.style.display = 'block';
        this.isVisible = true;

        // Adjust if menu goes off screen
        const rect = this.menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.menu.style.left = (x - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            this.menu.style.top = (y - rect.height) + 'px';
        }
    }

    hide() {
        this.menu.style.display = 'none';
        this.isVisible = false;
    }

    destroy() {
        if (this.menu && this.menu.parentNode) {
            this.menu.parentNode.removeChild(this.menu);
        }
    }
}
