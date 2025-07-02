import { navItems, routes } from '../../src/index'
import { Ability } from '@ownclouders/web-client'
import { mock } from 'vitest-mock-extended'

const getAbilityMock = (hasPermission: boolean) => mock<Ability>({ can: () => hasPermission })

describe('admin settings index', () => {
  describe('navItems', () => {
    describe('general', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        expect(
          navItems({ $ability: getAbilityMock(enabled) })
            .find((n) => n.name === 'General')
            .isVisible()
        ).toBe(enabled)
      })
    })
    describe('user management', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        expect(
          navItems({ $ability: getAbilityMock(enabled) })
            .find((n) => n.name === 'Users')
            .isVisible()
        ).toBe(enabled)
      })
    })
    describe('group management', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        expect(
          navItems({ $ability: getAbilityMock(enabled) })
            .find((n) => n.name === 'Groups')
            .isVisible()
        ).toBe(enabled)
      })
    })
    describe('space management', () => {
      it.each([true, false])('should be enabled according to the permissions', (enabled) => {
        expect(
          navItems({ $ability: getAbilityMock(enabled) })
            .find((n) => n.name === 'Spaces')
            .isVisible()
        ).toBe(enabled)
      })
    })
  })
  describe('routes', () => {
    describe('default-route "/"', () => {
      it('should redirect to general', () => {
        const ability = mock<Ability>()
        ability.can.mockReturnValueOnce(true)
        const route = routes({ $ability: ability }).find((n) => n.path === '/')
        expect((route.redirect as any)().name).toEqual('admin-settings-general')
      })
    })
    it.each([
      { can: vi.fn(() => true), redirect: null },
      {
        can: vi.fn((_, subject) => {
          if (subject === 'Group') {
            return true
          }

          return false
        }),
        redirect: { name: 'admin-settings-groups' }
      }
    ])('redirects "/general" with sufficient permissions', ({ can, redirect }) => {
      const ability = mock<Ability>({ can })
      const route = routes({ $ability: ability }).find((n) => n.path === '/general')
      const nextMock = vi.fn()
      ;(route.beforeEnter as any)({}, {}, nextMock)
      const args = [...(redirect ? [redirect] : [])]
      expect(nextMock).toHaveBeenCalledWith(...args)
    })
    it.each([
      { can: vi.fn(() => true), redirect: null },
      {
        can: vi.fn((_, subject) => {
          if (subject === 'Drive') {
            return true
          }

          return false
        }),
        redirect: { name: 'admin-settings-spaces' }
      }
    ])('redirects "/users" with sufficient permissions', ({ can, redirect }) => {
      const ability = mock<Ability>({ can })
      const route = routes({ $ability: ability }).find((n) => n.path === '/users')
      const nextMock = vi.fn()
      ;(route.beforeEnter as any)({}, {}, nextMock)
      const args = [...(redirect ? [redirect] : [])]
      expect(nextMock).toHaveBeenCalledWith(...args)
    })
    it.each([
      { can: vi.fn(() => true), redirect: null },
      {
        can: vi.fn((_, subject) => {
          if (subject === 'Setting') {
            return true
          }

          return false
        }),
        redirect: { name: 'admin-settings-general' }
      }
    ])('redirects "/groups" with sufficient permissions', ({ can, redirect }) => {
      const ability = mock<Ability>({ can })
      const route = routes({ $ability: ability }).find((n) => n.path === '/groups')
      const nextMock = vi.fn()
      ;(route.beforeEnter as any)({}, {}, nextMock)
      const args = [...(redirect ? [redirect] : [])]
      expect(nextMock).toHaveBeenCalledWith(...args)
    })
    it.each([
      { can: vi.fn(() => true), redirect: null },
      {
        can: vi.fn((_, subject) => {
          if (subject === 'Account') {
            return true
          }

          return false
        }),
        redirect: { name: 'admin-settings-users' }
      }
    ])('redirects "/spaces" with sufficient permissions', ({ can, redirect }) => {
      const ability = mock<Ability>({ can })
      const route = routes({ $ability: ability }).find((n) => n.path === '/spaces')
      const nextMock = vi.fn()
      ;(route.beforeEnter as any)({}, {}, nextMock)
      const args = [...(redirect ? [redirect] : [])]
      expect(nextMock).toHaveBeenCalledWith(...args)
    })
    it.each(['/general', '/users', '/groups', '/spaces'])(
      'should throw an error if permissions are insufficient',
      (path) => {
        const ability = mock<Ability>({ can: vi.fn(() => false) })
        const route = routes({ $ability: ability }).find((n) => n.path === path)
        const nextMock = vi.fn()
        expect(() => {
          ;(route.beforeEnter as any)({}, {}, nextMock)
        }).toThrowError('Insufficient permissions')
      }
    )
  })
})
