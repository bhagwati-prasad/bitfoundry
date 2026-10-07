const legacyIcons = {
    '🌳': 'type-hierarchy',
    '📁': 'folder',
    '📄': 'file',
    '📝': 'note',
    '📊': 'graph',
    '🖼️': 'file-media',
    '🎵': 'music',
    '💻': 'device-desktop',
    '🚀': 'rocket',
    '📦': 'package',
    '🔧': 'tools',
    '⭐': 'star-full',
    '💡': 'lightbulb',
    '🔒': 'lock',
    '🌐': 'globe',
    '📱': 'device-mobile',
    '🎨': 'color-mode',
    '📷': 'device-camera'
};

export function getLegacyCodiconName(name) {
    return legacyIcons[name] || null;
}

export function normalizeCodiconName(name) {
    if (typeof name !== 'string') return 'file';
    if (getLegacyCodiconName(name)) return getLegacyCodiconName(name);
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) ? name : 'file';
}

export function createCodicon(name, className = '') {
    const codiconName = normalizeCodiconName(name);
    const icon = document.createElement('span');
    icon.className = `codicon codicon-${codiconName}${className ? ` ${className}` : ''}`;
    icon.dataset.codicon = codiconName;
    icon.setAttribute('aria-hidden', 'true');
    return icon;
}
