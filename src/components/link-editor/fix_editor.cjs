
const fs = require('fs');
const path = 'c:/Users/jaoom/OneDrive/Área de Trabalho/projetos/nodus/frontend/src/components/link-editor/SortableLinkItem.tsx';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');

// Wrap Title/URL grid
lines.splice(1002, 0, '                                                                    {!isInstagramLink && (');
// 1002 is line 1003 (0-indexed)
// But wait, line 1003 is the grid. So inserting at index 1002 is correct.
// Now the lines shifted.
lines.splice(1043, 0, '                                                                    )}');

// Wrap Subtitle block
lines.splice(1045, 0, '                                                                    {!isInstagramLink && (');
lines.splice(1076, 0, '                                                                    )}');

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed SortableLinkItem.tsx');
