// Property Editor Modal for Node and Link properties

class PropertyEditor extends BaseModal {
    constructor(modalId = 'property-editor-modal') {
        super({
            modalId,
            existingElement: false,
            extraClass: 'property-editor-modal',
            contentClass: 'modal-content property-editor-content',
            contentId: 'property-editor-form',
            titleId: 'property-editor-title',
            withFooter: true
        });

        this.modalId = modalId;
        this.currentType = null; // 'node' or 'link'
        this.currentData = null;
        this.onSave = null;
        this.groups = null;
        if (!this.modal) return;

        this.setTitle('Edit Properties');

        this.isMetadataVisible = false;
        this.modal.classList.add('metadata-hidden');

        this.metadataBtn = document.createElement('button');
        this.metadataBtn.type = 'button';
        this.metadataBtn.className = 'modal-metadata-btn';
        this.metadataBtn.setAttribute('aria-label', 'Show metadata');
        this.metadataBtn.textContent = 'ⓘ';
        if (this.toolbelt && this.closeBtn) {
            this.toolbelt.insertBefore(this.metadataBtn, this.closeBtn);
        }
        this.metadataBtn.onclick = () => this.toggleMetadata();

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => this.close();

        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'btn btn-primary';
        saveBtn.id = 'property-save-btn';
        saveBtn.textContent = 'Save';
        saveBtn.onclick = () => this._handleSave();

        if (this.footer) {
            this.footer.appendChild(cancelBtn);
            this.footer.appendChild(saveBtn);
        }
    }

    setGroups(groups) {
        this.groups = groups;
    }

    // Open editor for node
    openForNode(nodeData, onSave) {
        this.currentType = 'node';
        this.currentData = GraphUtils.deepClone(nodeData);
        this.onSave = onSave;

        this.setTitle('Edit Node Properties');

        this._renderNodeForm();
        this._resetMaximizeState();
        this._resetMetadataState();
        super.open();
    }

    // Open editor for link
    openForLink(linkData, onSave) {
        this.currentType = 'link';
        this.currentData = GraphUtils.deepClone(linkData);
        this.onSave = onSave;

        this.setTitle('Edit Link Properties');

        this._renderLinkForm();
        this._resetMaximizeState();
        this._resetMetadataState();
        super.open();
    }

    _renderNodeForm() {
        const form = this.content;
        form.innerHTML = '';
        this.footer?.querySelector('.form-note')?.remove();

        // ID (non-editable)
        this._addFormField(form, 'ID', 'text', this.currentData.id, 'node-id', true, true);

        // Label + Group in same row
        const labelGroupRow = document.createElement('div');
        labelGroupRow.className = 'form-row';
        form.appendChild(labelGroupRow);
        this._addFormField(labelGroupRow, 'Label', 'text', this.currentData.label, 'node-label');
        this._addGroupField(labelGroupRow);

        // Description (textarea, accepts HTML)
        this._addTextareaField(form, 'Description (HTML)', this.currentData.desc || '', 'node-desc');

        // Note about size
        const note = document.createElement('p');
        note.className = 'form-note';
        note.innerHTML = '<small>💡 To change the default size for this group, use the Settings panel.</small>';
        this.addFooterItem(note, { prepend: true });
    }

    _renderLinkForm() {
        const form = this.content;
        form.innerHTML = '';
        this.footer?.querySelector('.form-note')?.remove();

        // ID (non-editable)
        this._addFormField(form, 'ID', 'text', this.currentData.id, 'link-id', true, true);

        // Source and Target (non-editable, for reference)
        const sourceLabel = this.currentData.source?.label || this.currentData.source;
        const targetLabel = this.currentData.target?.label || this.currentData.target;
        
        this._addFormField(form, 'From', 'text', sourceLabel, 'link-source', true, true);
        this._addFormField(form, 'To', 'text', targetLabel, 'link-target', true, true);

        // Type (dropdown)
        this._addSelectField(form, 'Type', ['flow', 'internal', 'admin'], this.currentData.type || 'flow', 'link-type');

        // Label
        this._addFormField(form, 'Label', 'text', this.currentData.label || '', 'link-label');

        // Description (textarea, accepts HTML)
        this._addTextareaField(form, 'Description (HTML)', this.currentData.desc || '', 'link-desc');

        // Direction (new field for bidirectional support)
        this._addSelectField(form, 'Direction', ['forward', 'backward', 'bidirectional'], this.currentData.direction || 'forward', 'link-direction');
    }

    _addFormField(parent, label, type, value, id, readonly = false, isMetadata = false) {
        const group = document.createElement('div');
        group.className = 'form-group';
        if (isMetadata) {
            group.classList.add('metadata-field');
        }

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.htmlFor = id;

        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.value = value || '';
        input.className = 'form-control';
        if (readonly) {
            input.readOnly = true;
            input.classList.add('readonly');
        }

        group.appendChild(labelEl);
        group.appendChild(input);
        parent.appendChild(group);
    }

    _addTextareaField(parent, label, value, id) {
        const group = document.createElement('div');
        group.className = 'form-group';
        if (id === 'node-desc') {
            group.classList.add('form-group-grow');
        }

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.htmlFor = id;

        const textarea = document.createElement('textarea');
        textarea.id = id;
        textarea.value = value || '';
        textarea.className = 'form-control';
        textarea.rows = 4;

        group.appendChild(labelEl);
        group.appendChild(textarea);
        parent.appendChild(group);
    }

    _addSelectField(parent, label, options, value, id) {
        const group = document.createElement('div');
        group.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.htmlFor = id;

        const select = document.createElement('select');
        select.id = id;
        select.className = 'form-control';

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if (opt === value) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        group.appendChild(labelEl);
        group.appendChild(select);
        parent.appendChild(group);
    }

    _addGroupField(parent) {
        const group = document.createElement('div');
        group.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.textContent = 'Group';
        labelEl.htmlFor = 'node-group';

        const groupContainer = document.createElement('div');
        groupContainer.className = 'group-selector';

        if (this.groups) {
            this.groups.groups.forEach((groupData, key) => {
                const swatch = document.createElement('div');
                swatch.className = 'group-swatch';
                swatch.dataset.group = key;
                swatch.style.backgroundColor = groupData.color;
                swatch.title = groupData.label;

                if (key === this.currentData.group) {
                    swatch.classList.add('selected');
                }

                swatch.onclick = () => {
                    groupContainer.querySelectorAll('.group-swatch').forEach(s => s.classList.remove('selected'));
                    swatch.classList.add('selected');
                };

                groupContainer.appendChild(swatch);
            });
        }

        group.appendChild(labelEl);
        group.appendChild(groupContainer);
        parent.appendChild(group);
    }

    _handleSave() {
        if (this.currentType === 'node') {
            this._saveNode();
        } else if (this.currentType === 'link') {
            this._saveLink();
        }
    }

    _saveNode() {
        const label = document.getElementById('node-label')?.value;
        const desc = document.getElementById('node-desc')?.value;
        const selectedGroup = document.querySelector('.group-swatch.selected')?.dataset.group;

        const updatedNode = {
            ...this.currentData,
            label: label || this.currentData.label,
            desc: desc || '',
            group: selectedGroup || this.currentData.group
        };

        if (this.onSave) {
            this.onSave(updatedNode);
        }

        this.close();
    }

    _saveLink() {
        const type = document.getElementById('link-type')?.value;
        const label = document.getElementById('link-label')?.value;
        const direction = document.getElementById('link-direction')?.value;
        const desc = document.getElementById('link-desc')?.value;

        const updatedLink = {
            ...this.currentData,
            type: type || this.currentData.type,
            label: label || '',
            direction: direction || 'forward',
            desc: desc || ''
        };

        if (this.onSave) {
            this.onSave(updatedLink);
        }

        this.close();
    }

    close() {
        super.close();
        this.currentType = null;
        this.currentData = null;
        this.onSave = null;
    }

    toggleMetadata() {
        if (!this.modal) return;
        this.isMetadataVisible = !this.isMetadataVisible;
        this.modal.classList.toggle('metadata-hidden', !this.isMetadataVisible);
        this._syncMetadataIcon();
    }

    _resetMetadataState() {
        if (!this.modal) return;
        this.isMetadataVisible = false;
        this.modal.classList.add('metadata-hidden');
        this._syncMetadataIcon();
    }

    _syncMetadataIcon() {
        if (!this.metadataBtn) return;
        if (this.isMetadataVisible) {
            this.metadataBtn.textContent = 'ⓧ';
            this.metadataBtn.setAttribute('aria-label', 'Hide metadata');
        } else {
            this.metadataBtn.textContent = 'ⓘ';
            this.metadataBtn.setAttribute('aria-label', 'Show metadata');
        }
    }

    destroy() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}
