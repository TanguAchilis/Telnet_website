// Minimal static file server used only during the build, to serve dist/ to the
// headless browser that snapshots it.
//
// Deliberately mirrors Vercel's resolution order: exact file, then directory
// index, then the SPA shell as a fallback. That way the browser loads each
// route's own prerendered <head>, exactly as a visitor will.

import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, sep } from 'node:path'

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.xml': 'text/xml',
    '.txt': 'text/plain',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
}

async function resolveFile(root, urlPath) {
    // Strip any traversal before joining.
    const safe = normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '')
    const candidate = join(root, safe)
    if (!candidate.startsWith(root + sep) && candidate !== root) return join(root, 'index.html')

    try {
        const info = await stat(candidate)
        if (info.isFile()) return candidate
        if (info.isDirectory()) {
            const index = join(candidate, 'index.html')
            await stat(index)
            return index
        }
    } catch {
        // Fall through to the SPA shell.
    }
    return join(root, 'index.html')
}

/** Starts a server on an ephemeral port. Resolves to { origin, close }. */
export function startStaticServer(root) {
    const server = createServer((req, res) => {
        const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
        resolveFile(root, pathname)
            .then((file) => {
                res.writeHead(200, {
                    'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
                    'cache-control': 'no-store',
                })
                createReadStream(file).pipe(res)
            })
            .catch(() => {
                res.writeHead(500).end('prerender static server error')
            })
    })

    return new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address()
            resolve({
                origin: `http://127.0.0.1:${port}`,
                close: () => new Promise((done) => server.close(done)),
            })
        })
    })
}
