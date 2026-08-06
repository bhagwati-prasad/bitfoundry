const fs = require('fs');
const path = require('path');
const vm = require('vm');

const utilsPath = path.resolve(__dirname, '../js/d3graph/utils.js');
const source = fs.readFileSync(utilsPath, 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(source + '\nthis.GraphUtils = GraphUtils;', context, { filename: utilsPath });

const GraphUtils = context.GraphUtils;
const container = {
    innerHTML: '',
    classList: {
        add() {}
    },
    querySelectorAll() {
        return [];
    }
};

GraphUtils.renderDescription(container, '# Hello\n\n```mermaid\nflowchart TD\nA-->B\n```', 'No description available...');

if (!container.innerHTML.includes('<h1>Hello</h1>') || !container.innerHTML.includes('class="mermaid"')) {
    throw new Error('Expected markdown and Mermaid content to be rendered');
}

console.log('description renderer test passed');
