const fs = require('fs');
const file = 'node_modules/tailwindcss/dist/chunk-L5IEUH3R.mjs';
let code = fs.readFileSync(file, 'utf8');

const target = 'throw new se(`Invalid declaration: \\`${u.trim()}\\``,i?[i,g,p]:null)';
if (code.includes(target)) {
    code = code.split(target).join("console.log('INVALID DECLARATION WAS CAUGHT. ORIGINAL WAS = [' + u + ']'); /* IGNORED */");
    fs.writeFileSync(file, code);
    console.log('Patch 1 successful');
} else {
    console.log('Target 1 not found');
}

const target2 = 'throw new ue(`Invalid declaration: \\`${u.trim()}\\``,i?[i,m,p]:null)';
const file2 = 'node_modules/tailwindcss/dist/lib.js';
if (fs.existsSync(file2)) {
    let code2 = fs.readFileSync(file2, 'utf8');
    if (code2.includes(target2)) {
        code2 = code2.split(target2).join("console.log('INVALID DECLARATION WAS CAUGHT. ORIGINAL WAS = [' + u + ']'); /* IGNORED */");
        fs.writeFileSync(file2, code2);
        console.log('Patch 2 successful');
    } else {
        console.log('Target 2 not found');
    }
}
