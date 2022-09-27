// this test asserts certain behaviors of proper-url-join to be the same as when we introduced it as dependency
import urlJoin from 'proper-url-join'

describe('proper-url-join', () => {
  describe('... TODO: source -> expected ...', () => {
    it.each([
      [['http://foobar.com'], 'http://foobar.com'],
      [['http://foobar.com/'], 'http://foobar.com'],
      [['/', ''], '/'],
      [['/', 'foo'], '/foo'],
      [['/', 'foo/'], '/foo'],
      [['foo/'], '/foo'],
      [['/', undefined], '/'],
      [['', { leadingSlash: true }], '/'],
      [[undefined, { leadingSlash: true }], '/'],
      [['/', 2], '/2'],
      [['//', '/fol//der//', '//file'], '/fol/der/file'],
      [['', {
        query: {
          foo: 'bar baz'
        }
      }], '/?foo=bar%20baz']
    ])('joins %s as %s', (args: any, expected: string) => {
      // @ts-ignore
      expect(urlJoin(...args)).toBe(expected)
    })
  })
})
