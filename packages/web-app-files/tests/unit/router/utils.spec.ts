import {
  isLocationActive,
  isLocationActiveDirector,
  createLocation,
  isAuthenticatedRoute
} from '../../../src/router/utils'
import VueRouter from 'vue-router'

describe('utils', () => {
  describe('isLocationActive', () => {
    it('returns true if one location is active', () => {
      const fakeRouter = {
        currentRoute: { name: 'foo' },
        resolve: (r) => ({ href: r.name })
      }

      expect(isLocationActive(fakeRouter as VueRouter, { name: 'foo' })).toBe(true)
      expect(isLocationActive(fakeRouter as VueRouter, { name: 'foo' }, { name: 'bar' })).toBe(true)
    })

    it('returns false if all locations inactive', () => {
      const fakeRouter = {
        currentRoute: { name: 'foo' },
        resolve: (r) => ({ href: r.name })
      }

      expect(isLocationActive(fakeRouter as VueRouter, { name: 'bar' })).toBe(false)
      expect(isLocationActive(fakeRouter as VueRouter, { name: 'bar' }, { name: 'baz' })).toBe(
        false
      )
    })
  })

  describe('isLocationActiveDirector', () => {
    test('director can be created and be used to check active locations', () => {
      const fakeRouter = {
        currentRoute: { name: 'unknown' },
        resolve: (r) => ({ href: r.name })
      }

      const isFilesLocationActive = isLocationActiveDirector(
        { name: 'foo' },
        { name: 'bar' },
        { name: 'baz' }
      )
      expect(isFilesLocationActive(fakeRouter as VueRouter)).toBe(false)

      fakeRouter.currentRoute.name = 'bar'

      expect(isFilesLocationActive(fakeRouter as VueRouter)).toBe(true)
      expect(isFilesLocationActive(fakeRouter as VueRouter, 'foo', 'bar')).toBe(true)
    })

    test('director closure only allows to check known locations and throws if unknown', () => {
      const fakeRouter = {
        currentRoute: { name: 'baz' },
        resolve: (r) => ({ href: r.name })
      }

      const isFilesLocationActive = isLocationActiveDirector({ name: 'foo' }, { name: 'bar' })
      expect(() => isFilesLocationActive(fakeRouter as VueRouter, 'unknown')).toThrowError()
    })
  })

  describe('createLocationDirector', () => {
    test('creates a location and handle arguments', () => {
      const testLocation = createLocation('foo', {
        path: '/should-not-add',
        params: { foo: 'foo-param-value' },
        query: { bar: 'bar-query-value' }
      })
      expect(testLocation.name).toBe('foo')
      expect(testLocation.path).toBeFalsy()
      expect(testLocation.params.foo).toBe('foo-param-value')
      expect(testLocation.query.bar).toBe('bar-query-value')
    })
  })

  describe('isRouteWithAuthentication', () => {
    test('return true by default', () => {
      expect(isAuthenticatedRoute({})).toBe(true)
      expect(isAuthenticatedRoute({ meta: { auth: true } })).toBe(true)
      expect(isAuthenticatedRoute({ meta: { auth: false } })).toBe(false)
    })
  })
})
