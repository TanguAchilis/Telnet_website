const { join } = require('node:path')

/**
 * Puppeteer downloads Chromium to ~/.cache/puppeteer by default, which Vercel
 * does not preserve between builds — so the browser would either be re-fetched
 * every deploy or, worse, be missing when the build script runs.
 *
 * Pinning the cache inside node_modules puts it under the directory Vercel
 * already caches.
 */
module.exports = {
    cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
}
