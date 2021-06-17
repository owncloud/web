import { buildQueryString } from '../../../src/helpers/resource/common'

describe('common', () => {
  test('buildQueryString', () => {
    expect(buildQueryString({})).toBe('a=1&preview=1&scalingup=0')
    expect(buildQueryString({ scalingup: 1 })).toBe('a=1&preview=1&scalingup=1')
    expect(buildQueryString({ preview: 0 })).toBe('a=1&preview=0&scalingup=0')
    expect(buildQueryString({ a: 0 })).toBe('a=0&preview=1&scalingup=0')
    expect(buildQueryString({ etag: 'etag' })).toBe('a=1&c=etag&preview=1&scalingup=0')
    expect(buildQueryString({ etag: 'etag"strange' })).toBe(
      'a=1&c=etagstrange&preview=1&scalingup=0'
    )
    expect(buildQueryString({ etag: 'etag"s\t%r!a§n&g=e' })).toBe(
      'a=1&c=etags%09%25r%21a%C2%A7n%26g%3De&preview=1&scalingup=0'
    )
    expect(buildQueryString({ dimensions: [42, 42] })).toBe('a=1&preview=1&scalingup=0&x=42&y=42')
  })
})
