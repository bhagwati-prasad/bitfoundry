const fs = require('fs');
const path = require('path');
const vm = require('vm');

const codiconSource = fs.readFileSync(path.resolve(__dirname, '../js/tree/codicon.js'), 'utf8');
const codiconContext = {};
vm.createContext(codiconContext);
vm.runInContext(
    codiconSource
        .replace('export function getLegacyCodiconName', 'function getLegacyCodiconName')
        .replace('export function normalizeCodiconName', 'function normalizeCodiconName')
        .replace('export function createCodicon', 'function createCodicon')
        + '\nthis.getLegacyCodiconName = getLegacyCodiconName;\nthis.normalizeCodiconName = normalizeCodiconName;',
    codiconContext
);

const parserPath = path.resolve(__dirname, '../js/tree/text_tree_parser.js');
const parserSource = fs.readFileSync(parserPath, 'utf8');
const parserContext = { ...codiconContext };
vm.createContext(parserContext);
vm.runInContext(
    parserSource
        .replace("import { getLegacyCodiconName, normalizeCodiconName } from './codicon.js';", '')
        .replace('export function parseTreeText', 'function parseTreeText')
        + '\nthis.parseTreeText = parseTreeText;',
    parserContext,
    { filename: parserPath }
);

const unicode = parserContext.parseTreeText(
    '[type-hierarchy] Workspace\n' +
    '    ├── [folder] Documents — Shared files\n' +
    '    │   └── [file] Notes.txt\n' +
    '    └── [rocket] Launch'
);
if (unicode.icon !== 'type-hierarchy' || unicode.children.length !== 2) {
    throw new Error('Unicode tree root or sibling structure was not parsed');
}
if (unicode.children[0].description !== 'Shared files' || unicode.children[0].children[0].title !== 'Notes.txt') {
    throw new Error('Unicode tree descriptions or nested nodes were not parsed');
}

const ascii = parserContext.parseTreeText(
    'Workspace\n' +
    '|-- Documents\n' +
    '|   +-- Notes.txt\n' +
    '\\-- Launch'
);
if (ascii.children.length !== 2 || ascii.children[0].children[0].title !== 'Notes.txt') {
    throw new Error('ASCII tree branches were not parsed');
}

const standardUnicode = parserContext.parseTreeText(
    'Workspace\n' +
    '├── Documents\n' +
    '│   └── Notes.txt'
);
if (standardUnicode.children[0].children[0].title !== 'Notes.txt') {
    throw new Error('Standard Unicode tree indentation was not parsed');
}

const connectorOnlyLines = parserContext.parseTreeText(
    'Workspace\n' +
    '│\n' +
    '├── Documents\n' +
    '│   │\n' +
    '│   └── Notes.txt\n' +
    '│\n' +
    '└── Launch'
);
if (
    connectorOnlyLines.children.length !== 2 ||
    connectorOnlyLines.children[0].children[0].title !== 'Notes.txt' ||
    connectorOnlyLines.children[1].title !== 'Launch'
) {
    throw new Error('Connector-only lines should be ignored without changing the tree structure');
}

const asciiConnectorOnlyLines = parserContext.parseTreeText(
    'Workspace\n' +
    '|\n' +
    '|-- Documents\n' +
    '|   |\n' +
    '|   +-- Notes.txt\n' +
    '\\-- Launch'
);
if (
    asciiConnectorOnlyLines.children.length !== 2 ||
    asciiConnectorOnlyLines.children[0].children[0].title !== 'Notes.txt'
) {
    throw new Error('ASCII connector-only lines should be ignored without changing the tree structure');
}

const legacy = parserContext.parseTreeText('🌳 Workspace\n└── 📁 Documents');
if (legacy.icon !== 'type-hierarchy' || legacy.children[0].icon !== 'folder') {
    throw new Error('Legacy emoji icons were not mapped to Codicons');
}

for (const invalid of ['', '├── Orphan', 'Root\n└── Child\n        └── Orphan', 'Root\nNot a branch']) {
    let threw = false;
    try {
        parserContext.parseTreeText(invalid);
    } catch {
        threw = true;
    }
    if (!threw) throw new Error(`Invalid tree text should have been rejected: ${invalid}`);
}

console.log('text tree parser tests passed');
