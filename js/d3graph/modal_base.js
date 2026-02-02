// Base Modal with toolbelt + maximize/minimize support

class BaseModal {
    constructor({
        modalId,
        existingElement = false,
        extraClass = "",
        contentClass = "modal-content",
        contentId = "",
        titleId = "",
        withFooter = false
    } = {}) {
        this.modalId = modalId;
        const isSelector = typeof modalId === "string" && (/^[#.]/.test(modalId) || modalId.includes("[") || modalId.includes(" "));
        this.modal = existingElement
            ? (isSelector ? document.querySelector(modalId) : document.getElementById(modalId))
            : document.createElement("div");

        if (!this.modal) {
            console.warn(`Modal element ${modalId} not found.`);
            return;
        }

        if (!existingElement) {
            this.modal.id = modalId;
            document.body.appendChild(this.modal);
        }

        this.modal.className = `modal-overlay ${extraClass ? ` ${extraClass}` : ""}`;
        this.modal.style.display = "none";
        this.modal.innerHTML = "";

        this.modalBox = document.createElement("div");
        this.modalBox.className = "modal-box";

        this.header = document.createElement("div");
        this.header.className = "modal-header";

        this.title = document.createElement("h3");
        this.title.className = "modal-title";
        if (titleId) this.title.id = titleId;

        this.toolbelt = document.createElement("div");
        this.toolbelt.className = "modal-toolbelt";

        this.toggleBtn = document.createElement("button");
        this.toggleBtn.type = "button";
        this.toggleBtn.className = "modal-toggle-btn";
        this.toggleBtn.setAttribute("aria-label", "Maximize modal");
        this.toggleBtn.textContent = "⤢";

        this.closeBtn = document.createElement("button");
        this.closeBtn.type = "button";
        this.closeBtn.className = "close-btn";
        this.closeBtn.textContent = "×";

        this.toolbelt.appendChild(this.toggleBtn);
        this.toolbelt.appendChild(this.closeBtn);

        this.header.appendChild(this.title);
        this.header.appendChild(this.toolbelt);

        this.content = document.createElement("div");
        this.content.className = contentClass;
        if (contentId) this.content.id = contentId;

        this.modalBox.appendChild(this.header);
        this.modalBox.appendChild(this.content);

        if (withFooter) {
            this.footer = document.createElement("div");
            this.footer.className = "modal-footer";
            this.modalBox.appendChild(this.footer);
        } else {
            this.footer = null;
        }

        this.modal.appendChild(this.modalBox);

        this.isMaximized = false;

        this.closeBtn.onclick = () => this.close();
        this.toggleBtn.onclick = () => this.toggleSize();

        this.modal.onclick = (e) => {
            if (e.target === this.modal) this.close();
        };
    }

    setTitle(text) {
        if (this.title) this.title.textContent = text;
    }

    open() {
        if (!this.modal) return;
        this.isMaximized = true;
        this.modal.classList.add("modal-maximized");
        this._syncToggleIcon();
        this.modal.style.display = "flex";
    }

    close() {
        if (!this.modal) return;
        this._resetMaximizeState();
        this.modal.style.display = "none";
    }

    toggleSize() {
        if (!this.modal) return;
        this.isMaximized = !this.isMaximized;
        this.modal.classList.toggle("modal-maximized", this.isMaximized);
        this._syncToggleIcon();
    }

    _resetMaximizeState() {
        if (!this.modal) return;
        this.isMaximized = false;
        this.modal.classList.remove("modal-maximized");
        this._syncToggleIcon();
    }

    _syncToggleIcon() {
        if (!this.toggleBtn) return;
        if (this.isMaximized) {
            this.toggleBtn.textContent = "⤡";
            this.toggleBtn.setAttribute("aria-label", "Minimize modal");
        } else {
            this.toggleBtn.textContent = "⤢";
            this.toggleBtn.setAttribute("aria-label", "Maximize modal");
        }
    }

    addFooterItem(element, { prepend = false } = {}) {
        if (!this.footer || !element) return;
        if (prepend && this.footer.firstChild) {
            this.footer.insertBefore(element, this.footer.firstChild);
        } else {
            this.footer.appendChild(element);
        }
    }
}
