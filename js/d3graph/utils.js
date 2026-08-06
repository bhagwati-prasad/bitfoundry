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

    static escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    static renderDescription(container, value, fallback = 'No description available...') {
        if (!container) return;

        const text = value == null ? '' : String(value);
        container.innerHTML = '';
        container.classList.add('description-content');

        if (!text.trim()) {
            container.textContent = fallback;
            return;
        }

        const hasExplicitHtml = /<\/?[a-z][\s\S]*>/i.test(text);
        const containsMarkdownSyntax = /(^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|```|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/m.test(text);

        if (hasExplicitHtml && !containsMarkdownSyntax) {
            container.innerHTML = text;
            return;
        }

        container.innerHTML = GraphUtils._parseMarkdownToHtml(text);

        const mermaidBlocks = container.querySelectorAll('.mermaid');
        if (mermaidBlocks.length && typeof window !== 'undefined' && window.mermaid) {
            try {
                if (window.mermaid.initialize) {
                    window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
                }

                const nodes = Array.from(mermaidBlocks).map(block => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'mermaid-diagram';
                    wrapper.textContent = block.textContent || block.innerText || '';
                    block.replaceWith(wrapper);
                    return wrapper;
                });

                if (window.mermaid.run) {
                    window.mermaid.run({ nodes });
                } else if (window.mermaid.init) {
                    window.mermaid.init(undefined, nodes);
                }
            } catch (error) {
                console.warn('Unable to render Mermaid diagram', error);
            }
        }
    }

    static _parseMarkdownToHtml(text) {
        const lines = text.replace(/\r\n/g, '\n').split('\n');
        const blocks = [];
        let paragraph = [];
        let bulletItems = [];
        let orderedItems = [];
        let inCodeBlock = false;
        let codeLanguage = '';
        let codeLines = [];

        const flushParagraph = () => {
            if (paragraph.length) {
                const content = paragraph.join(' ').trim();
                if (content) {
                    blocks.push(`<p>${GraphUtils._renderInlineMarkdown(content)}</p>`);
                }
                paragraph = [];
            }
        };

        const flushList = () => {
            if (bulletItems.length) {
                blocks.push(`<ul>${bulletItems.map(item => `<li>${GraphUtils._renderInlineMarkdown(item)}</li>`).join('')}</ul>`);
                bulletItems = [];
            }
            if (orderedItems.length) {
                blocks.push(`<ol>${orderedItems.map(item => `<li>${GraphUtils._renderInlineMarkdown(item)}</li>`).join('')}</ol>`);
                orderedItems = [];
            }
        };

        const flushCodeBlock = () => {
            if (!codeLines.length) {
                return;
            }

            const code = codeLines.join('\n');
            if (codeLanguage.toLowerCase() === 'mermaid') {
                blocks.push(`<pre class="mermaid">${GraphUtils.escapeHtml(code)}</pre>`);
            } else {
                blocks.push(`<pre><code>${GraphUtils.escapeHtml(code)}</code></pre>`);
            }
            codeLines = [];
            codeLanguage = '';
        };

        lines.forEach(line => {
            const trimmed = line.trim();

            if (trimmed.startsWith('```')) {
                flushParagraph();
                flushList();
                if (inCodeBlock) {
                    flushCodeBlock();
                    inCodeBlock = false;
                } else {
                    inCodeBlock = true;
                    codeLanguage = trimmed.slice(3).trim();
                    codeLines = [];
                }
                return;
            }

            if (inCodeBlock) {
                codeLines.push(line);
                return;
            }

            const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
            if (headingMatch) {
                flushParagraph();
                flushList();
                const level = Math.min(headingMatch[1].length, 6);
                blocks.push(`<h${level}>${GraphUtils._renderInlineMarkdown(headingMatch[2])}</h${level}>`);
                return;
            }

            if (/^[-*+]\s+/.test(trimmed)) {
                flushParagraph();
                bulletItems.push(trimmed.replace(/^[-*+]\s+/, ''));
                return;
            }

            if (/^\d+\.\s+/.test(trimmed)) {
                flushParagraph();
                orderedItems.push(trimmed.replace(/^\d+\.\s+/, ''));
                return;
            }

            if (!trimmed) {
                flushParagraph();
                flushList();
                return;
            }

            paragraph.push(trimmed);
        });

        flushParagraph();
        flushList();
        if (inCodeBlock) {
            flushCodeBlock();
        }

        return blocks.join('');
    }

    static _renderInlineMarkdown(text) {
        let html = GraphUtils.escapeHtml(text);
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${GraphUtils.escapeHtml(code)}</code>`);
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
        return html;
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
