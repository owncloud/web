import {
  PREVIEW_CSP,
  PREVIEW_SIZE_LIMIT,
  isPreviewTooLarge,
  wrapWithPreviewCsp
} from '../../../src/helpers/preview'

const META = `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">`

describe('preview CSP', () => {
  it('denies network egress and form submission by default', () => {
    expect(PREVIEW_CSP).toContain("default-src 'none'")
    expect(PREVIEW_CSP).toContain("form-action 'none'")
    expect(PREVIEW_CSP).toContain("base-uri 'none'")
    // no wildcard / external network sources
    expect(PREVIEW_CSP).not.toContain('http:')
    expect(PREVIEW_CSP).not.toContain('https:')
    expect(PREVIEW_CSP).not.toContain('*')
  })

  it('injects the meta into an existing <head> (preserving the doctype)', () => {
    const out = wrapWithPreviewCsp(
      '<!doctype html><html><head><title>t</title></head><body>x</body></html>'
    )
    expect(out.startsWith('<!doctype html>')).toBe(true)
    expect(out).toContain(`<head>${META}`)
  })

  it('wraps a <head> after <html> when none exists', () => {
    const out = wrapWithPreviewCsp('<html><body>x</body></html>')
    expect(out).toContain(`<html><head>${META}</head>`)
  })

  it('prepends the meta for a bare fragment', () => {
    expect(wrapWithPreviewCsp('<p>x</p>')).toBe(`${META}<p>x</p>`)
  })

  it('returns just the meta for empty content', () => {
    expect(wrapWithPreviewCsp('')).toBe(META)
  })

  it('does not duplicate or mangle on the <head> path', () => {
    const out = wrapWithPreviewCsp('<head id="h">x</head>')
    expect(out).toBe(`<head id="h">${META}x</head>`)
  })
})

describe('preview size guard', () => {
  it('flags content above the limit', () => {
    expect(isPreviewTooLarge('a'.repeat(PREVIEW_SIZE_LIMIT + 1))).toBe(true)
  })

  it('allows content at or below the limit', () => {
    expect(isPreviewTooLarge('a'.repeat(PREVIEW_SIZE_LIMIT))).toBe(false)
    expect(isPreviewTooLarge('')).toBe(false)
  })
})
