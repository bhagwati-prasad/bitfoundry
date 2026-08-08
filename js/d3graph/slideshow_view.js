class SlideShowModal extends BaseModal {
    constructor(graph, options = {}) {
        super({
            modalId: 'slideshow-modal',
            extraClass: 'slideshow-modal',
            contentClass: 'slideshow-modal-content',
            titleId: 'slideshow-title',
            withFooter: false
        });

        this.graph = graph;
        this.options = {
            showLockControl: true,
            showOpacityControl: true,
            locked: false,
            opacity: 0.92,
            ...options
        };

        this.currentIndex = 0;
        this.locked = Boolean(this.options.locked);
        this.opacity = Number(this.options.opacity);
        this.slideData = [];
        this.triggerButton = null;

        if (!this.modal) return;

        this._buildContent();
        this._attachCallbacks();
    }

    open() {
        if (!this.modal) return;
        this._loadSlides();
        this.currentIndex = 0;
        this._renderSlide();
        this._syncLockState();
        super.open();
        if (this.triggerButton) {
            this.triggerButton.classList.add('active');
        }
    }

    close() {
        if (!this.modal) return;
        super.close();
        if (this.triggerButton) {
            this.triggerButton.classList.remove('active');
        }
    }

    toggleLock() {
        this.locked = !this.locked;
        this._syncLockState();
    }

    _buildContent() {
        this.content.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'slideshow-board';

        const toolbar = document.createElement('div');
        toolbar.className = 'slideshow-control-row';

        const toolbarLeft = document.createElement('div');
        toolbarLeft.className = 'slideshow-toolbar-group';

        if (this.options.showLockControl) {
            this.lockBtn = document.createElement('button');
            this.lockBtn.type = 'button';
            this.lockBtn.className = 'slideshow-lock-btn';
            this.lockBtn.setAttribute('aria-pressed', String(this.locked));
            this.lockBtn.textContent = this.locked ? '🔒 Linked' : '🔓 Unlinked';
            this.lockBtn.addEventListener('click', () => this.toggleLock());
            toolbarLeft.appendChild(this.lockBtn);
        }

        if (this.options.showOpacityControl) {
            const opacityContainer = document.createElement('div');
            opacityContainer.className = 'slideshow-opacity-control';
            const label = document.createElement('label');
            label.htmlFor = 'slideshow-opacity';
            label.textContent = 'Opacity';
            this.opacitySlider = document.createElement('input');
            this.opacitySlider.id = 'slideshow-opacity';
            this.opacitySlider.type = 'range';
            this.opacitySlider.min = '50';
            this.opacitySlider.max = '100';
            this.opacitySlider.value = String(this.opacity * 100);
            this.opacitySlider.addEventListener('input', (event) => this._updateOpacity(event.target.value));
            opacityContainer.appendChild(label);
            opacityContainer.appendChild(this.opacitySlider);
            toolbarLeft.appendChild(opacityContainer);
        }

        const toolbarRight = document.createElement('div');
        toolbarRight.className = 'slideshow-toolbar-group';

        this.prevBtn = document.createElement('button');
        this.prevBtn.type = 'button';
        this.prevBtn.className = 'slideshow-nav-btn prev-btn';
        this.prevBtn.textContent = '← Previous';
        this.prevBtn.addEventListener('click', () => this._moveSlide(-1));
        toolbarRight.appendChild(this.prevBtn);

        this.nextBtn = document.createElement('button');
        this.nextBtn.type = 'button';
        this.nextBtn.className = 'slideshow-nav-btn next-btn';
        this.nextBtn.textContent = 'Next →';
        this.nextBtn.addEventListener('click', () => this._moveSlide(1));
        toolbarRight.appendChild(this.nextBtn);

        this.drillBtn = document.createElement('button');
        this.drillBtn.type = 'button';
        this.drillBtn.className = 'slideshow-drill-btn';
        this.drillBtn.textContent = 'Enter Subgraph';
        this.drillBtn.style.display = 'none';
        this.drillBtn.addEventListener('click', () => {
            const slide = this.slideData[this.currentIndex];
            if (slide?.type === 'node' && slide.item?.subGraph) {
                this.graph.navigateTo(slide.item.subGraph);
                this._loadSlides();
                this.currentIndex = 0;
                this._renderSlide();
            }
        });
        toolbarRight.appendChild(this.drillBtn);

        toolbar.appendChild(toolbarLeft);
        toolbar.appendChild(toolbarRight);
        this.setHeaderContent(toolbar);

        this.breadcrumbs = document.createElement('div');
        this.breadcrumbs.className = 'breadcrumbs slideshow-breadcrumbs';
        this.breadcrumbs.style.display = 'none';
        wrapper.appendChild(this.breadcrumbs);

        const metaRow = document.createElement('div');
        metaRow.className = 'slideshow-meta-row';

        const metaLeft = document.createElement('div');
        metaLeft.className = 'slideshow-meta-left';
        this.typeEl = document.createElement('div');
        this.typeEl.className = 'slideshow-slide-type';
        this.titleEl = document.createElement('h3');
        this.titleEl.className = 'slideshow-slide-title';
        metaLeft.appendChild(this.typeEl);
        metaLeft.appendChild(this.titleEl);

        this.counterEl = document.createElement('div');
        this.counterEl.className = 'slideshow-slide-counter';
        metaRow.appendChild(metaLeft);
        metaRow.appendChild(this.counterEl);
        wrapper.appendChild(metaRow);

        this.bodyEl = document.createElement('div');
        this.bodyEl.className = 'slideshow-slide-body';
        wrapper.appendChild(this.bodyEl);

        this.content.appendChild(wrapper);

        this._updateOpacity(this.opacity * 100);
    }

    _attachCallbacks() {
        if (!this.graph || !this.graph.config || !this.graph.config.callbacks) return;

        const existingOnViewChange = this.graph.config.callbacks.onViewChange;
        this.graph.config.callbacks.onViewChange = (data, viewStack) => {
            if (typeof existingOnViewChange === 'function') {
                existingOnViewChange(data, viewStack);
            }
            this._handleGraphViewChange(data, viewStack);
        };
    }

    setTriggerButton(button) {
        this.triggerButton = button;
    }

    _handleGraphViewChange(data, viewStack) {
        if (!this.modal || !this.locked) return;
        this._loadSlides();
        this.currentIndex = 0;
        this._renderSlide();
    }

    _loadSlides() {
        const currentData = this.graph.getCurrentData();
        const nodes = Array.isArray(currentData.nodes) ? currentData.nodes : [];
        const links = Array.isArray(currentData.links) ? currentData.links : [];

        this.slideData = [];
        const max = Math.max(nodes.length, links.length);
        for (let i = 0; i < max; i += 1) {
            if (i < nodes.length) {
                this.slideData.push({ type: 'node', item: nodes[i] });
            }
            if (i < links.length) {
                this.slideData.push({ type: 'link', item: links[i] });
            }
        }

        if (!this.slideData.length) {
            this.slideData.push({ type: 'empty' });
        }

        this._renderBreadcrumbs();
    }

    _renderBreadcrumbs() {
        if (!this.breadcrumbs) return;
        this.breadcrumbs.innerHTML = '';
        const path = Array.isArray(this.graph.viewStack) ? this.graph.viewStack : [];

        if (!path.length) {
            this.breadcrumbs.style.display = 'none';
            this.setTitle('');
            return;
        }

        this.breadcrumbs.style.display = 'flex';
        path.forEach((item, index) => {
            const crumb = document.createElement('div');
            crumb.className = `crumb ${index === path.length - 1 ? 'active' : ''}`;
            crumb.textContent = item.label || `Level ${index + 1}`;
            if (index < path.length - 1) {
                crumb.addEventListener('click', () => {
                    this.graph.navigateBackTo(index);
                    if (this.modal && this.modal.style.display !== 'none') {
                        this._loadSlides();
                        this.currentIndex = 0;
                        this._renderSlide();
                    }
                });
            }
            this.breadcrumbs.appendChild(crumb);
            if (index < path.length - 1) {
                const separator = document.createElement('span');
                separator.className = 'separator';
                separator.textContent = '>';
                this.breadcrumbs.appendChild(separator);
            }
        });

        this.setTitle('');
        this.title.innerHTML = '';
        this.title.appendChild(this.breadcrumbs);
    }

    _renderSlide() {
        const slide = this.slideData[this.currentIndex];
        this._updateCounter();
        this._renderBreadcrumbs();

        if (!slide || slide.type === 'empty') {
            this.typeEl.textContent = 'No slides available';
            this.titleEl.textContent = 'Empty graph';
            this.bodyEl.innerHTML = '<p>No node or link information is available in this view.</p>';
            return;
        }

        if (slide.type === 'node') {
            this._renderNodeSlide(slide.item);
        } else if (slide.type === 'link') {
            this._renderLinkSlide(slide.item);
        }
    }

    _renderNodeSlide(node) {
        const label = node.label || node.id || 'Node';
        this.typeEl.textContent = 'Entity';
        this.titleEl.textContent = label;

        const props = [];
        if (node.id) props.push({ label: 'ID', value: node.id });
        if (node.group) props.push({ label: 'Group', value: this._getGroupLabel(node.group) });
        if (node.subGraph) props.push({ label: 'Subgraph', value: 'Available' });
        if (node.desc || node.info) props.push({ label: 'Summary', value: node.desc || node.info });

        const infoText = node.info || node.desc || '';
        this.bodyEl.innerHTML = `
            <div class="slideshow-slide-description"></div>
            <div class="slideshow-slide-properties"></div>
        `;

        const descriptionContainer = this.bodyEl.querySelector('.slideshow-slide-description');
        GraphUtils.renderDescription(descriptionContainer, infoText, 'No description available.');

        const propertiesContainer = this.bodyEl.querySelector('.slideshow-slide-properties');
        propertiesContainer.innerHTML = this._buildPropertyList(props);

        if (this.drillBtn) {
            if (node.subGraph) {
                this.drillBtn.style.display = 'inline-flex';
            } else {
                this.drillBtn.style.display = 'none';
            }
        }
    }

    _renderLinkSlide(link) {
        const sourceLabel = this._getLinkNodeLabel(link.source);
        const targetLabel = this._getLinkNodeLabel(link.target);
        const title = link.label || `${sourceLabel} → ${targetLabel}`;
        this.typeEl.textContent = 'Interaction';
        this.titleEl.textContent = title;

        const props = [];
        if (link.id) props.push({ label: 'ID', value: link.id });
        props.push({ label: 'Type', value: link.type || 'flow' });
        props.push({ label: 'Source', value: sourceLabel });
        props.push({ label: 'Target', value: targetLabel });
        if (link.label) props.push({ label: 'Label', value: link.label });
        if (link.desc || link.info) props.push({ label: 'Summary', value: link.desc || link.info });

        const infoText = link.info || link.desc || '';
        this.bodyEl.innerHTML = `
            <div class="slideshow-slide-description"></div>
            <div class="slideshow-slide-properties"></div>
        `;

        const descriptionContainer = this.bodyEl.querySelector('.slideshow-slide-description');
        GraphUtils.renderDescription(descriptionContainer, infoText, 'No description available.');

        const propertiesContainer = this.bodyEl.querySelector('.slideshow-slide-properties');
        propertiesContainer.innerHTML = this._buildPropertyList(props);
    }

    _buildPropertyList(properties) {
        if (!properties.length) {
            return '<div class="slideshow-no-properties">No additional properties.</div>';
        }

        return `<dl class="slideshow-property-list">${properties.map(prop => `
            <div class="slideshow-property-row">
                <dt>${GraphUtils.escapeHtml(prop.label)}</dt>
                <dd>${GraphUtils.escapeHtml(String(prop.value || '—'))}</dd>
            </div>
        `).join('')}</dl>`;
    }

    _getGroupLabel(groupId) {
        if (!this.graph || !this.graph.groups) return groupId;
        const group = this.graph.groups.get(groupId);
        return group ? group.label || group.title || groupId : groupId;
    }

    _getLinkNodeLabel(nodeRef) {
        if (!nodeRef) return 'Unknown';
        if (typeof nodeRef === 'object') {
            return nodeRef.label || nodeRef.id || 'Unknown';
        }
        const currentData = this.graph.getCurrentData();
        const targetNode = (Array.isArray(currentData.nodes) ? currentData.nodes : []).find(node => node.id === nodeRef);
        return targetNode ? targetNode.label || targetNode.id : nodeRef;
    }

    _moveSlide(delta) {
        if (!this.slideData.length) return;
        this.currentIndex = (this.currentIndex + delta + this.slideData.length) % this.slideData.length;
        this._renderSlide();
    }

    _updateCounter() {
        if (!this.counterEl) return;
        this.counterEl.textContent = `${this.slideData.length ? this.currentIndex + 1 : 0} / ${this.slideData.length}`;
    }

    _updateOpacity(value) {
        const normalized = Number(value) / 100;
        this.opacity = normalized;
        if (this.modalBox) {
            this.modalBox.style.backgroundColor = `rgba(255,255,255,${normalized})`;
        }
        if (this.opacitySlider && this.opacitySlider.value !== String(value)) {
            this.opacitySlider.value = String(value);
        }
    }

    _syncLockState() {
        if (!this.lockBtn) return;
        this.lockBtn.textContent = this.locked ? '🔒 Linked' : '🔓 Unlinked';
        this.lockBtn.setAttribute('aria-pressed', String(this.locked));
        this.lockBtn.classList.toggle('active', this.locked);
    }
}
