// Defense-in-depth Content-Security-Policy injected into the sandboxed preview
// iframe so the preview is self-protecting and does not depend on the
// deployment's proxy CSP. The iframe sandbox (no `allow-same-origin`) is the
// primary control that isolates the origin; this CSP additionally denies all
// network egress (`default-src 'none'`) and form submission so a hostile
// document cannot beacon or exfiltrate. Inline scripts/styles are allowed so the
// preview still renders self-contained pages and runs their inline JS.
export const PREVIEW_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  'img-src data: blob:',
  'font-src data:',
  'media-src data: blob:',
  "form-action 'none'",
  "base-uri 'none'"
].join('; ')

// Above this size the live preview is paused: rendering (and re-parsing the
// whole document into the iframe on every settled edit) of a very large or
// hostile document can hang the browser tab. The user can still opt in to render
// it once via an explicit action.
export const PREVIEW_SIZE_LIMIT = 500_000

const META = `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">`

// Find the first match of `re` that is NOT inside an HTML comment. Matching the
// raw string would let a crafted `<!-- <head> -->` divert the CSP injection away
// from the real head, leaving the rendered preview without its self-protecting CSP.
function firstUncommentedMatch(html: string, re: RegExp): RegExpExecArray | null {
  const comments: Array<[number, number]> = []
  const commentRe = /<!--[\s\S]*?-->/g
  let c: RegExpExecArray | null
  while ((c = commentRe.exec(html)) !== null) {
    comments.push([c.index, c.index + c[0].length])
  }
  const scan = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`)
  let m: RegExpExecArray | null
  while ((m = scan.exec(html)) !== null) {
    const at = m.index
    if (!comments.some(([start, end]) => at >= start && at < end)) {
      return m
    }
  }
  return null
}

/**
 * Inject the preview CSP `<meta>` into an HTML document without disturbing its
 * rendering mode: into the first real `<head>`, else wrap a `<head>` right after
 * the first real `<html>`, else prepend it (a fragment has no doctype to
 * preserve). Matches ignore HTML comments so the CSP cannot be diverted into a
 * commented-out tag.
 */
export function wrapWithPreviewCsp(html: string): string {
  if (!html) {
    return META
  }
  const head = firstUncommentedMatch(html, /<head\b[^>]*>/i)
  if (head) {
    const at = head.index + head[0].length
    return `${html.slice(0, at)}${META}${html.slice(at)}`
  }
  const htmlTag = firstUncommentedMatch(html, /<html\b[^>]*>/i)
  if (htmlTag) {
    const at = htmlTag.index + htmlTag[0].length
    return `${html.slice(0, at)}<head>${META}</head>${html.slice(at)}`
  }
  return `${META}${html}`
}

/** Whether a document is large enough that the live preview should be paused. */
export function isPreviewTooLarge(html: string): boolean {
  return (html?.length ?? 0) > PREVIEW_SIZE_LIMIT
}
