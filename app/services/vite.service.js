import fs from 'fs';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production'
const MANIFEST_PATH = path.resolve('public/.vite/manifest.json');
let manifestCache = null;

function readManifest() {
    if (!fs.existsSync(MANIFEST_PATH)) {
        throw new Error(`Manifest file not found at ${MANIFEST_PATH}`);
    }
    const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    return JSON.parse(manifestContent);
}

export function getAssets() {
    if (!isProd) {
        return { isProd };
    }

    try {
        if (!manifestCache) {
            manifestCache = readManifest();
        }

        const entry = manifestCache['js/main.js'];

        return {
            mainJs: entry.file,
            css: entry.css?.[0] || null,
            isProd
        };
    } catch (error) {
        console.error('Error reading manifest file:', error);
    }
}