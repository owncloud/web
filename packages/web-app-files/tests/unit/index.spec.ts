import { navItems } from '../../src/index'

describe('Web app files', () => {
  describe('navItems', () => {
    describe('Personal', () => {
      it('should be enabled if user has a personal space', () => {
        const items = navItems({
          $store: {
            getters: {
              'runtime/spaces/spaces': [{ id: '1', driveType: 'personal', isOwner: () => true }]
            }
          }
        })
        expect(items[0].enabled({ spaces: { enabled: true } })).toBeTruthy()
      })
      it('should be disabled if user has no a personal space', () => {
        const items = navItems({
          $store: {
            getters: {
              'runtime/spaces/spaces': [{ id: '1', driveType: 'project', isOwner: () => false }]
            }
          }
        })
        expect(items[0].enabled({ spaces: { enabled: true } })).toBeFalsy()
      })
    })
  })
})
