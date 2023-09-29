import LoginModal from '../../../../src/components/Users/LoginModal.vue'
import {
  createStore,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { User } from '@ownclouders/web-client/src/generated'

describe('LoginModal', () => {
  it('renders the input including two options', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('shows a warning when the current user is being selected', () => {
    const { wrapper } = getWrapper([mock<User>({ id: '1' })])
    expect(wrapper.findComponent<any>('oc-select-stub').props('warningMessage')).toBeDefined()
  })
})

function getWrapper(users = [mock<User>()]) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.user.mockReturnValue({ uuid: '1' })
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(LoginModal, {
      props: {
        users
      },
      global: {
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins(), store],
        stubs: { OcModal: false }
      }
    })
  }
}
