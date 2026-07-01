const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sourceAssets = path.join(rootDir, 'assets');
const frontendAssets = path.join(rootDir, 'frontend', 'public', 'assets');
const mobileAssets = path.join(rootDir, 'mobile', 'assets');

console.log('🔄 Synchronizing assets across monorepo...');

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    const elements = fs.readdirSync(from);
    for (const element of elements) {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        const stat = fs.lstatSync(fromPath);

        if (stat.isFile()) {
            fs.copyFileSync(fromPath, toPath);
        } else if (stat.isDirectory()) {
            copyFolderSync(fromPath, toPath);
        }
    }
}

try {
    // Copy to frontend
    console.log('Copying to frontend/public/assets...');
    copyFolderSync(sourceAssets, frontendAssets);
    
    // Copy to mobile
    console.log('Copying to mobile/assets...');
    copyFolderSync(sourceAssets, mobileAssets);
    
    console.log('✅ Assets successfully synchronized!');
} catch (error) {
    console.error('❌ Error synchronizing assets:', error.message);
    process.exit(1);
}
