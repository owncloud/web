import ResourceConflictModal from '../../../../src/components/Modals/ResourceConflictModal.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { ResolveStrategy } from '../../../../src/helpers/resource'

describe('ResourceConflictModal', () => {
  describe('checkbox', () => {
    it('renders if more than one conflict given', () => {
      const { wrapper } = getWrapper({ props: { conflictCount: 2 } })
      expect(wrapper.find('oc-checkbox-stub').exists()).toBeTruthy()
    })
    it('does not render if one conflict given', () => {
      const { wrapper } = getWrapper({ props: { conflictCount: 1 } })
      expect(wrapper.find('oc-checkbox-stub').exists()).toBeFalsy()
    })
  })
  describe('onConfirm', () => {
    it('should call the callback', async () => {
      const callbackFn = jest.fn()
      const { wrapper } = getWrapper({ props: { callbackFn } })
      await wrapper.vm.onConfirm()
      expect(callbackFn).toHaveBeenCalledWith({
        strategy: ResolveStrategy.KEEP_BOTH,
        doForAllConflicts: undefined
      })
    })
  })
  describe('onConfirmSecondary', () => {
    it('should call the callback with merge strategy if merge suggested', async () => {
      const callbackFn = jest.fn()
      const { wrapper } = getWrapper({ props: { callbackFn, suggestMerge: true } })
      await wrapper.vm.onConfirmSecondary()
      expect(callbackFn).toHaveBeenCalledWith({
        strategy: ResolveStrategy.MERGE,
        doForAllConflicts: undefined
      })
    })
    it('should call the callback with replace strategy if merge not suggested', async () => {
      const callbackFn = jest.fn()
      const { wrapper } = getWrapper({ props: { callbackFn, suggestMerge: false } })
      await wrapper.vm.onConfirmSecondary()
      expect(callbackFn).toHaveBeenCalledWith({
        strategy: ResolveStrategy.REPLACE,
        doForAllConflicts: undefined
      })
    })
  })
  describe('onCancel', () => {
    it('should call the callback', async () => {
      const callbackFn = jest.fn()
      const { wrapper } = getWrapper({ props: { callbackFn } })
      await wrapper.vm.onCancel()
      expect(callbackFn).toHaveBeenCalledWith({
        strategy: ResolveStrategy.SKIP,
        doForAllConflicts: undefined
      })
    })
  })
})

function getWrapper({ props = {} } = {}) {
  const mocks = defaultComponentMocks()
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    mocks,
    wrapper: shallowMount(ResourceConflictModal, {
      props: {
        resource: mock<Resource>,
        conflictCount: 1,
        callbackFn: () => ({}),
        ...props
      },
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        provide: mocks
      }
    })
  }
}
