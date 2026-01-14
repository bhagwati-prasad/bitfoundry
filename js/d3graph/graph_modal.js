
class GraphModal {
    constructor(modalId) {
        const modal = document.getElementById("modal");

        if (!modal) {
            console.warn(`Modal element ${modalId} not found.`);
            return;
        }

        modal.classList.add("modal-overlay");

        const fragment = document.createDocumentFragment();

        const modalBox = document.createElement("div");
        modalBox.className = "modal-box";

        const header = document.createElement("div");
        header.className = "modal-header";

        const title = document.createElement("h3");
        title.className = "modal-title";
        title.id = "m-title";
        title.textContent = "Title";

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "close-btn";
        closeBtn.textContent = "×";
        closeBtn.setAttribute("onclick", "closeModal()");

        header.appendChild(title);
        header.appendChild(closeBtn);

        const content = document.createElement("div");
        content.className = "modal-content";

        const badge = document.createElement("span");
        badge.id = "m-badge";
        badge.className = "badge";
        badge.textContent = "Type";

        const body = document.createElement("div");
        body.id = "m-body";
        body.textContent = "Description...";

        content.appendChild(badge);
        content.appendChild(body);

        modalBox.appendChild(header);
        modalBox.appendChild(content);
        fragment.appendChild(modalBox);

        modal.appendChild(fragment);


        this.modal = modal;

        this.title = this.modal.querySelector('#m-title');
        this.body = this.modal.querySelector('#m-body');
        this.badge = this.modal.querySelector('#m-badge');

        this.modal.onclick = (e) => {
            if (e.target === this.modal) this.close();
        };

        if (closeBtn) closeBtn.onclick = () => this.close();
    }

    open(data, context) {
        if (!this.modal) return;

        if (this.title) {
            const label = data.label || (data.source.label + " -> " + data.target.label);
            this.title.innerText = label;
        }

        if (this.body) {
            this.body.innerHTML = data.desc || "No description available.";
        }

        if (this.badge) {
            this.badge.className = context === 'entity' ? "badge badge-entity" : "badge badge-flow";
            this.badge.innerText = context === 'entity' ? "Entity" : "Interaction";
        }

        this.modal.style.display = "flex";
    }

    close() {
        if (this.modal) this.modal.style.display = "none";
    }
}