import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import QuotaModal from '@files/src/components/Spaces/QuotaModal.vue'
import stubs from 'tests/unit/stubs'
import { createStore } from 'vuex-extensions'
import mockAxios from 'jest-mock-axios'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('QuotaModal', () => {
  describe('method "editQuota"', () => {
    it('should show message on success', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: {
            id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
            spaceQuota: {
              remaining: 9999999836,
              state: 'normal',
              total: 10000000000,
              used: 164
            }
          }
        })
      })

      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const updateResourceFieldStub = jest.spyOn(wrapper.vm, 'UPDATE_RESOURCE_FIELD')
      await wrapper.vm.editQuota()

      expect(updateResourceFieldStub).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on server error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.reject(new Error())
      })

      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const updateResourceFieldStub = jest.spyOn(wrapper.vm, 'UPDATE_RESOURCE_FIELD')
      await wrapper.vm.editQuota()

      expect(updateResourceFieldStub).toHaveBeenCalledTimes(0)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message while selected value is not set', async () => {
      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const updateResourceFieldStub = jest.spyOn(wrapper.vm, 'UPDATE_RESOURCE_FIELD')
      wrapper.vm.selectedOption = {}
      await wrapper.vm.editQuota()

      expect(updateResourceFieldStub).toHaveBeenCalledTimes(0)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
  describe('method "optionSelectable"', () => {
    it('should return true while option is a number', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.optionSelectable({ value: 11 })).toBeTruthy()
      expect(wrapper.vm.optionSelectable({ value: 11.2 })).toBeTruthy()
    })

    it('should return false while option is not a number', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.optionSelectable({ value: null })).toBeFalsy()
      expect(wrapper.vm.optionSelectable({ value: 'lorem ipsum' })).toBeFalsy()
    })
  })
})

function getWrapper() {
  return mount(QuotaModal, {
    localVue,
    mocks: {
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn()
    },
    data: () => {
      return {
        selectedOption: {
          displayValue: '10',
          displayUnit: 'GB',
          value: 10 * Math.pow(10, 9)
        }
      }
    },
    store: createStore(Vuex.Store, {
      actions: {
        showMessage: jest.fn()
      },
      getters: {
        configuration: () => ({
          server: 'https://example.com'
        }),
        getToken: () => 'token'
      },
      modules: {
        Files: {
          namespaced: true,
          mutations: {
            UPDATE_RESOURCE_FIELD: jest.fn()
          }
        }
      }
    }),
    propsData: {
      cancel: jest.fn(),
      space: {
        id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
        spaceQuota: {
          remaining: 9999999836,
          state: 'normal',
          total: 10000000000,
          used: 164
        }
      }
    },
    modules: {
      Files: {
        namespaced: true,
        mutations: {
          UPDATE_RESOURCE_FIELD: jest.fn()
        },
        state: {
          currentFolder: {
            id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
            spaceReadmeData: {
              webDavUrl:
                'https://localhost:9200/dav/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/.space/readme.md'
            }
          }
        }
      }
    },
    stubs: { ...stubs, portal: true, 'oc-modal': true }
  })
}
