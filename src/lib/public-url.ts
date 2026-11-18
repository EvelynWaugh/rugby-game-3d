/** Public-folder URL. Dev and `npm run build` stay rooted at `/`. The WordPress bundle is served from `wp-content/plugins/.../static/`, so files resolve next to that script. */
export function publicUrl(path: string) {
  const relative = path.replace(/^\//, '')
  if (import.meta.env.MODE === 'wordpress') return wordpressAsset(relative)
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${relative}`
}

function wordpressAsset(relative: string) {
  const configured = window.rugbyGame?.assetBase
  if (configured) {
    const prefix = configured.endsWith('/') ? configured : `${configured}/`
    return `${prefix}${relative}`
  }
  const scriptUrl = import.meta.url
  const marker = '/static/'
  const index = scriptUrl.lastIndexOf(marker)
  const base = index === -1 ? new URL('../', scriptUrl).href : scriptUrl.slice(0, index + 1)
  return `${base}${relative}`
}

declare global {
  interface Window {
    rugbyGame?: {
      assetBase: string
    }
  }
}
