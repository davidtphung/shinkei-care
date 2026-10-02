const BUNDLE_SRC = /\/assets\/index-[^/]+\.js/

export function resolveZineUrl(file: string, scriptSrc: string | null, base = '/'): string {
  const name = file.replace(/^\/+/, '')
  if (scriptSrc && BUNDLE_SRC.test(scriptSrc)) {
    return scriptSrc.replace(/\/index-[^/]+\.js(?:\?.*)?$/, `/zine/${name}`)
  }
  const root = base.endsWith('/') ? base : `${base}/`
  return `${root}assets/zine/${name}`
}

function currentBundleSrc(): string | null {
  if (typeof document === 'undefined') return null
  const nodes = document.querySelectorAll('script[src]')
  for (const node of nodes) {
    const src = (node as HTMLScriptElement).src
    if (src && BUNDLE_SRC.test(src)) return src
  }
  return null
}

function currentBase(): string {
  const base = import.meta.env?.BASE_URL ?? '/'
  return typeof base === 'string' && base.length > 0 ? base : '/'
}

export function zineFileUrl(file: string): string {
  return resolveZineUrl(file, currentBundleSrc(), currentBase())
}
