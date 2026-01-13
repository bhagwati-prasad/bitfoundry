// Property Editor Modal for Node and Link properties

class PropertyEditor {
    constructor(modalId = 'property-editor-modal') {
        this.modalId = modalId;
        this.modal = null;
        this.currentType = null; // 'node' or 'link'
        this.currentData = null;
        this.onSave = null;
        this.groups = null;
        this._init();
    }

    _init() {
        // Create modal structure
        this.modal = document.createElement('div');
        this.modal.id = this.modalId;
        this.modal.className = 'modal-overlay property-editor-modal';
        this.modal.style.display = 'none';

        const modalBox = document.createElement('div');
        modalBox.className = 'modal-box';

        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';

        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.id = 'property-editor-title';
        title.textContent = 'Edit Properties';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'close-btn';
        closeBtn.textContent = '×';
        closeBtn.onclick = () => this.close();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Content
        const content = document.createElement('div');
        content.className = 'modal-content property-editor-content';
        content.id = 'property-editor-form';

        // Footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

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

        footer.appendChild(cancelBtn);
        footer.appendChild(saveBtn);

        modalBox.appendChild(header);
        modalBox.appendChild(content);
        modalBox.appendChild(footer);
        this.modal.appendChild(modalBox);

        document.body.appendChild(this.modal);

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    setGroups(groups) {
        this.groups = groups;
    }

    // Open editor for node
    openForNode(nodeData, onSave) {
        this.currentType = 'node';
        this.currentData = GraphUtils.deepClone(nodeData);
        this.onSave = onSave;

        const title = this.modal.querySelector('#property-editor-title');
        title.textContent = 'Edit Node Properties';

        this._renderNodeForm();
        this.modal.style.display = 'flex';
    }

    // Open editor for link
    openForLink(linkData, onSave) {
        this.currentType = 'link';
        this.currentData = GraphUtils.deepClone(linkData);
        this.onSave = onSave;

        const title = this.modal.querySelector('#property-editor-title');
        title.textContent = 'Edit Link Properties';

        this._renderLinkForm();
        this.modal.style.display = 'flex';
    }

    _renderNodeForm() {
        const form = this.modal.querySelector('#property-editor-form');
        form.innerHTML = '';

        // ID (non-editable)
        this._addFormField(form, 'ID', 'text', this.currentData.id, 'node-id', true);

        // Label
        this._addFormField(form, 'Label', 'text', this.currentData.label, 'node-label');

        // Group (dropdown with color swatches)
        this._addGroupField(form);

        // Description (textarea, accepts HTML)
        this._addTextareaField(form, 'Description (HTML)', this.currentData.desc || '', 'node-desc');

        // Note about size
        const note = document.createElement('p');
        note.className = 'form-note';
        note.innerHTML = '<small>💡 To change the default size for this group, use the Settings panel.</small>';
        form.appendChild(note);
    }

    _renderLinkForm() {
        const form = this.modal.querySelector('#property-editor-form');
        form.innerHTML = '';

        // ID (non-editable)
        this._addFormField(form, 'ID', 'text', this.currentData.id, 'link-id', true);

        // Source and Target (non-editable, for reference)
        const sourceLabel = this.currentData.source?.label || this.currentData.source;
        const targetLabel = this.currentData.target?.label || this.currentData.target;
        
        this._addFormField(form, 'From', 'text', sourceLabel, 'link-source', true);
        this._addFormField(form, 'To', 'text', targetLabel, 'link-target', true);

        // Type (dropdown)
        this._addSelectField(form, 'Type', ['flow', 'internal', 'admin'], this.currentData.type || 'flow', 'link-type');

        // Label
        this._addFormField(form, 'Label', 'text', this.currentData.label || '', 'link-label');

        // Direction (new field for bidirectional support)
        this._addSelectField(form, 'Direction', ['forward', 'backward', 'bidirectional'], this.currentData.direction || 'forward', 'link-direction');
    }

    _addFormField(parent, label, type, value, id, readonly = false) {
        const group = document.createElement('div');
        group.className = 'form-group';

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

        const updatedLink = {
            ...this.currentData,
            type: type || this.currentData.type,
            label: label || '',
            direction: direction || 'forward'
        };

        if (this.onSave) {
            this.onSave(updatedLink);
        }

        this.close();
    }

    close() {
        this.modal.style.display = 'none';
        this.currentType = null;
        this.currentData = null;
        this.onSave = null;
    }

    destroy() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}
