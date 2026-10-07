import { getLegacyCodiconName, normalizeCodiconName } from './codicon.js';

const indentationPattern = /^(?:(?:│|\|) {3}| {4}|\t)*/;
const branchPattern = /^(?:├|└|\+|\\|\|)(?:─{1,3}|-{1,3})\s+(.*)$/;
const explicitIconPattern = /^\[([a-z0-9]+(?:-[a-z0-9]+)*)\]\s+(.+)$/;
const legacyIconPattern = /^(\p{Extended_Pictographic}\uFE0F?)\s+(.+)$/u;

function parseNodeContent(content) {
    const descriptionSeparator = content.indexOf(' — ');
    let titleAndIcon = descriptionSeparator < 0 ? content : content.slice(0, descriptionSeparator);
    const description = descriptionSeparator < 0 ? '' : content.slice(descriptionSeparator + 3);
    let icon = 'file';
    const iconMatch = titleAndIcon.match(explicitIconPattern);
    if (iconMatch) {
        icon = normalizeCodiconName(iconMatch[1]);
        titleAndIcon = iconMatch[2];
    } else {
        const legacyMatch = titleAndIcon.match(legacyIconPattern);
        const legacyIcon = legacyMatch && getLegacyCodiconName(legacyMatch[1]);
        if (legacyMatch && legacyIcon) {
            icon = legacyIcon;
            titleAndIcon = legacyMatch[2];
        }
    }
    const title = titleAndIcon.trim();
    if (!title) throw new Error('Every tree line must have a node title.');
    return { title, icon, description, children: [] };
}

export function parseTreeText(text) {
    if (typeof text !== 'string' || !text.trim()) {
        throw new Error('Enter a non-empty ASCII or Unicode tree.');
    }

    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    let root = null;
    const parents = [];
    let depthOffset = null;

    for (const [index, line] of lines.entries()) {
        const indentation = line.match(indentationPattern)[0];
        const content = line.slice(indentation.length);
        const branch = content.match(branchPattern);

        if (!root) {
            if (branch || indentation) {
                throw new Error(`Line ${index + 1} must be the unindented root node.`);
            }
            root = parseNodeContent(content);
            parents[0] = root;
            continue;
        }

        if (!branch) {
            throw new Error(`Line ${index + 1} needs a Unicode or ASCII tree branch.`);
        }

        const indentationDepth = (indentation.match(/(?:│|\|) {3}| {4}|\t/g) || []).length;
        if (depthOffset === null) depthOffset = indentationDepth === 0 ? 1 : 0;
        const depth = indentationDepth + depthOffset;
        const parent = parents[depth - 1];
        if (!parent) {
            throw new Error(`Line ${index + 1} is indented without a parent node.`);
        }

        const node = parseNodeContent(branch[1]);
        parent.children.push(node);
        parents[depth] = node;
        parents.length = depth + 1;
    }

    return root;
}
