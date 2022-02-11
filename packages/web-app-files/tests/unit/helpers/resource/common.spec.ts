import { buildQueryString } from '../../../../src/helpers/resource/common'
import { URLSearchParams } from 'url'

describe('common', () => {
  test('buildQueryString', () => {
    ;(
      [
        [{}, 'a=1&preview=1&scalingup=0'],
        [{ scalingup: 1 }, 'a=1&preview=1&scalingup=1'],
        [{ preview: 0 }, 'a=1&preview=0&scalingup=0'],
        [{ a: 0 }, 'a=0&preview=1&scalingup=0'],
        [{ etag: 'etag' }, 'a=1&c=etag&preview=1&scalingup=0'],
        [{ etag: 'etag"strange' }, 'a=1&c=etagstrange&preview=1&scalingup=0'],
        [
          { etag: 'etag"s\t%r!a§n&g=e' },
          'a=1&c=etags%09%25r%21a%C2%A7n%26g%3De&preview=1&scalingup=0'
        ],
        [{ dimensions: [42, 42] }, 'a=1&preview=1&scalingup=0&x=42&y=42']
      ] as any
    ).forEach((ge) => {
      new URLSearchParams(ge[1]).forEach((v, n) => {
        expect(new URLSearchParams(buildQueryString(ge[0])).get(n)).toBe(v)
      })
    })
  })
})
