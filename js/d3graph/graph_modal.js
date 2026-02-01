
class GraphModal extends BaseModal {
    constructor(modalId) {
        super({
            modalId,
            existingElement: true,
            contentClass: "modal-content",
            titleId: "m-title"
        });

        if (!this.modal) return;

        const badge = document.createElement("span");
        badge.id = "m-badge";
        badge.className = "badge";
        badge.textContent = "Type";

        const body = document.createElement("div");
        body.id = "m-body";
        body.textContent = "Description...";

        this.content.appendChild(badge);
        this.content.appendChild(body);

        this.title = this.modal.querySelector("#m-title");
        this.body = this.modal.querySelector("#m-body");
        this.badge = this.modal.querySelector("#m-badge");
    }

    open(data, context) {
        if (!this.modal) return;

        if (this.title) {
            const label = data.label || (data.source.label + " -> " + data.target.label);
            this.title.innerText = label;
        }

        if (this.body) {
            this.body.innerHTML = data.desc || "No description available...";
        }

        if (this.badge) {
            this.badge.className = context === 'entity' ? "badge badge-entity" : "badge badge-flow";
            this.badge.innerText = context === 'entity' ? "Entity" : "Interaction";
        }

        this._resetMaximizeState();
        super.open();
    }
}