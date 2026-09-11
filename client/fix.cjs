const fs = require('fs');
const path = require('path');

function fixEncoding(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixEncoding(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Fix em dash
            if (content.includes('â€”')) {
                content = content.replace(/â€”/g, '—');
                changed = true;
            }
            // Fix bullet
            if (content.includes('â€¢')) {
                content = content.replace(/â€¢/g, '•');
                changed = true;
            }
            // Fix single quote
            if (content.includes('â€™')) {
                content = content.replace(/â€™/g, '’');
                changed = true;
            }
            
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed', fullPath);
            }
        }
    }
}

fixEncoding('c:/Users/VICKY/OneDrive/Desktop/3DWEBSITE/shapio/client/src');
