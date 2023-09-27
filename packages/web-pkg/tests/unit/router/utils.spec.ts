import {
  isLocationActive,
  isLocationActiveDirector,
  createLocation
} from 'web-pkg/src/router/utils'
import { RouteLocation, Router } from 'vue-router'
import { mock } from 'jest-mock-extended'
import { ref } from 'vue'

describe('utils', () => {
  describe('isLocationActive', () => {
    it('returns true if one location is active', () => {
      const fakeRouter = mock<Router>({
        currentRoute: ref({ name: 'foo' }),
        resolve: (r: any) => mock<RouteLocation & { href: string }>({ href: r.name })
      })

      expect(isLocationActive(fakeRouter, mock<RouteLocation>({ name: 'foo' }))).toBe(true)
      expect(
        isLocationActive(
          fakeRouter,
          mock<RouteLocation>({ name: 'foo' }),
          mock<RouteLocation>({ name: 'bar' })
        )
      ).toBe(true)
    })

    it('returns false if all locations inactive', () => {
      const fakeRouter = mock<Router>({
        currentRoute: ref({ name: 'foo' }),
        resolve: (r: any) => mock<RouteLocation & { href: string }>({ href: r.name })
      })

      expect(isLocationActive(fakeRouter, mock<RouteLocation>({ name: 'bar' }))).toBe(false)
      expect(
        isLocationActive(
          fakeRouter,
          mock<RouteLocation>({ name: 'bar' }),
          mock<RouteLocation>({ name: 'baz' })
        )
      ).toBe(false)
    })
  })

  describe('isLocationActiveDirector', () => {
    test('director can be created and be used to check active locations', () => {
      const fakeRouter = mock<Router>({
        currentRoute: ref({ name: 'unknown' }),
        resolve: (r: any) => mock<RouteLocation & { href: string }>({ href: r.name })
      })

      const isFilesLocationActive = isLocationActiveDirector(
        mock<RouteLocation>({ name: 'foo' }),
        mock<RouteLocation>({ name: 'bar' }),
        mock<RouteLocation>({ name: 'baz' })
      )
      expect(isFilesLocationActive(fakeRouter)).toBe(false)

      fakeRouter.currentRoute.value.name = 'bar'

      expect(isFilesLocationActive(fakeRouter)).toBe(true)
      expect(isFilesLocationActive(fakeRouter, 'foo', 'bar')).toBe(true)
    })

    test('director closure only allows to check known locations and throws if unknown', () => {
      const fakeRouter = mock<Router>({
        currentRoute: ref({ name: 'baz' }),
        resolve: (r: any) => mock<RouteLocation & { href: string }>({ href: r.name })
      })

      const isFilesLocationActive = isLocationActiveDirector(
        mock<RouteLocation>({ name: 'foo' }),
        mock<RouteLocation>({ name: 'bar' })
      )
      expect(() => isFilesLocationActive(fakeRouter, 'unknown')).toThrow()
    })
  })

  describe('createLocationDirector', () => {
    test('creates a location and handle arguments', () => {
      const testLocation = createLocation(
        'foo',
        mock<RouteLocation>({
          path: '/should-not-add',
          params: { foo: 'foo-param-value' },
          query: { bar: 'bar-query-value' }
        })
      )
      expect(testLocation.name).toBe('foo')
      expect(testLocation.params.foo).toBe('foo-param-value')
      expect(testLocation.query.bar).toBe('bar-query-value')
    })
  })
})
