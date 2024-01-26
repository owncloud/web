import { createPinia, setActivePinia } from 'pinia'
import { navItems } from '../../src/index'
import { useSpacesStore, useCapabilityStore } from '@ownclouders/web-pkg'
import { SpaceResource } from '@ownclouders/web-client'
import { mock } from 'vitest-mock-extended'

describe('Web app files', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const capabilityStore = useCapabilityStore()
    capabilityStore.capabilities.spaces.enabled = true
  })

  describe('navItems', () => {
    describe('Personal', () => {
      it('should be enabled if user has a personal space', () => {
        const spacesStore = useSpacesStore()
        spacesStore.spaces = [
          mock<SpaceResource>({ id: '1', driveType: 'personal', isOwner: () => true })
        ]
        const items = navItems(undefined)
        expect(items[0].enabled()).toBeTruthy()
      })
      it('should be disabled if user has no a personal space', () => {
        const spacesStore = useSpacesStore()
        spacesStore.spaces = [
          mock<SpaceResource>({ id: '1', driveType: 'project', isOwner: () => false })
        ]
        const items = navItems(undefined)
        expect(items[0].enabled()).toBeFalsy()
      })
    })
  })
})
