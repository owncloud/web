import { unref } from 'vue'
import { useFileActionsCreateLink } from '../../../../../src/composables/actions/files/useFileActionsCreateLink'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'

describe('useFileActionsCreateLink', () => {
  describe('isEnabled property', () => {
    it('should return false if no resource selected', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ space: null, resources: [] })).toBeFalsy()
        }
      })
    })
    it('should return false if one resource can not be shared', () => {
      getWrapper({
        setup: ({ actions }) => {
          const resources = [mock<Resource>({ canShare: () => false })]
          expect(unref(actions)[0].isEnabled({ space: null, resources })).toBeFalsy()
        }
      })
    })
    it('should return false if one resource is a disabled project space', () => {
      getWrapper({
        setup: ({ actions }) => {
          const resources = [
            mock<Resource>({ canShare: () => true, disabled: true, driveType: 'project' })
          ]
          expect(unref(actions)[0].isEnabled({ space: null, resources })).toBeFalsy()
        }
      })
    })
    it('should return true if all files can be shared', () => {
      getWrapper({
        setup: ({ actions }) => {
          const resources = [
            mock<Resource>({ canShare: () => true }),
            mock<Resource>({ canShare: () => true })
          ]
          expect(unref(actions)[0].isEnabled({ space: null, resources })).toBeTruthy()
        }
      })
    })
  })
  describe('handler', () => {
    it('creates a modal window', () => {
      getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          unref(actions)[0].handler({
            space: null,
            resources: [mock<Resource>({ canShare: () => true })]
          })
          expect(storeOptions.actions.createModal).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({ setup }) {
  const mocks = defaultComponentMocks()

  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsCreateLink({ store })
        setup(instance, { storeOptions })
      },
      {
        mocks,
        store,
        provide: mocks
      }
    )
  }
}
