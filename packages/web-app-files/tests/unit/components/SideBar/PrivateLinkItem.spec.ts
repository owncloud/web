import PrivateLinkItem from 'web-app-files/src/components/SideBar/PrivateLinkItem.vue'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import { createStore, defaultPlugins, mount, defaultStoreMockOptions } from 'web-test-helpers'

jest.useFakeTimers()

describe('PrivateLinkItem', () => {
  it('should render a button', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('upon clicking it should copy the private link to the clipboard button, render a success message and change icon for half a second', async () => {
    jest.spyOn(window, 'prompt').mockImplementation()
    const { wrapper } = getWrapper()
    const spyShowMessage = jest.spyOn(wrapper.vm, 'showMessage')
    expect(spyShowMessage).not.toHaveBeenCalled()

    await wrapper.trigger('click')
    expect(wrapper.html()).toMatchSnapshot()
    expect(spyShowMessage).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(550)

    wrapper.vm.$nextTick(() => {
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper() {
  const folder = mockDeep<Resource>({
    type: 'folder',
    ownerId: 'marie',
    ownerDisplayName: 'Marie',
    mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
    size: '740',
    name: 'lorem.txt',
    privateLink: 'https://example.com/fake-private-link'
  })
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.getters.capabilities.mockImplementation(() => ({ files: { privateLinks: true } }))
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(() => folder)
  const store = createStore(storeOptions)
  return {
    wrapper: mount(PrivateLinkItem, {
      global: {
        plugins: [...defaultPlugins(), store],
        provide: {
          displayedItem: folder
        }
      }
    })
  }
}
