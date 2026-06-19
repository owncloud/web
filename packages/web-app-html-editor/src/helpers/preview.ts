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

/**
 * Inject the preview CSP `<meta>` into an HTML document without disturbing its
 * rendering mode: into an existing `<head>`, else wrap a `<head>` right after
 * `<html>`, else prepend it (a fragment has no doctype to preserve). Using a
 * replacer function avoids `$`-pattern interpretation in the replacement.
 */
export function wrapWithPreviewCsp(html: string): string {
  if (!html) {
    return META
  }
  const headOpen = /<head\b[^>]*>/i
  if (headOpen.test(html)) {
    return html.replace(headOpen, (match) => `${match}${META}`)
  }
  const htmlOpen = /<html\b[^>]*>/i
  if (htmlOpen.test(html)) {
    return html.replace(htmlOpen, (match) => `${match}<head>${META}</head>`)
  }
  return `${META}${html}`
}

/** Whether a document is large enough that the live preview should be paused. */
export function isPreviewTooLarge(html: string): boolean {
  return (html?.length ?? 0) > PREVIEW_SIZE_LIMIT
}
