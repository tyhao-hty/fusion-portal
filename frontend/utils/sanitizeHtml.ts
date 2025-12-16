const allowedTags = new Set([
  'p',
  'br',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'h2',
  'h3',
  'h4',
  'h5',
  'a',
  'img',
])

const allowedAttributes: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title'],
}

const urlAttributes = new Set(['href', 'src'])
const safeProtocols = new Set(['http', 'https', 'mailto', 'tel'])

const isSafeUrl = (value: string) => {
  try {
    const url = new URL(value, 'https://example.com')
    const protocol = url.protocol.replace(':', '')
    return safeProtocols.has(protocol)
  } catch {
    return false
  }
}

const sanitizeAttributes = (tag: string, rawAttrs: string) => {
  if (!rawAttrs) return ''
  const allowList = allowedAttributes[tag] || []
  const attrRegex = /([a-zA-Z0-9:-]+)\s*=\s*(".*?"|'.*?'|[^\s"'>]+)/g
  const safeAttrs: string[] = []

  let match: RegExpExecArray | null
  while ((match = attrRegex.exec(rawAttrs))) {
    const name = match[1].toLowerCase()
    if (name.startsWith('on')) continue
    if (!allowList.includes(name)) continue

    let value = match[2].trim()
    value = value.replace(/^['"]|['"]$/g, '')

    if (urlAttributes.has(name) && !isSafeUrl(value)) continue

    const escapedValue = value.replace(/"/g, '&quot;')
    safeAttrs.push(`${name}="${escapedValue}"`)
  }

  if (!safeAttrs.length) return ''
  return ` ${safeAttrs.join(' ')}`
}

export const sanitizeRichTextHtml = (html: string | null | undefined) => {
  if (!html) return ''

  const withoutScripts = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')

  return withoutScripts.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tagName, attrs) => {
    const tag = String(tagName || '').toLowerCase()
    const isClosing = match.startsWith('</')

    if (!allowedTags.has(tag)) return ''
    if (isClosing) return `</${tag}>`

    const sanitizedAttrs = sanitizeAttributes(tag, attrs || '')
    return `<${tag}${sanitizedAttrs}>`
  })
}
