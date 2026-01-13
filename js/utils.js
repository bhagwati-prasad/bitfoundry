// Utility functions for the graph builder

class GraphUtils {
    // Generate a UUID v4
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Check if a point is within a distance of another point
    static isWithinDistance(x1, y1, x2, y2, distance) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy) <= distance;
    }

    // Validate node ID uniqueness
    static validateUniqueNodeId(nodeId, existingNodes) {
        const exists = existingNodes.some(node => node.id === nodeId);
        if (exists) {
            console.error(`Validation Error: Node ID "${nodeId}" already exists`);
            return false;
        }
        return true;
    }

    // Validate no self-loops
    static validateNoSelfLoop(sourceId, targetId) {
        if (sourceId === targetId) {
            console.error(`Validation Error: Self-loop detected (${sourceId} -> ${targetId})`);
            return false;
        }
        return true;
    }

    // Validate link uniqueness based on type and direction
    static validateLinkUniqueness(sourceId, targetId, linkType, existingLinks) {
        // Multiple links of any type are allowed, so we just assign unique UUIDs
        // This is more of a helper to check if exact duplicate exists (same type, same direction)
        return true; // Always allow, as per requirements
    }

    // Export data to JSON
    static exportToJSON(data, filename = 'ecosystem_data.json') {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Import JSON data
    static importFromJSON(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    callback(data);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}
