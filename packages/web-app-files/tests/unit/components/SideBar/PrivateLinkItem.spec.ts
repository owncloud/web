import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { createStore, defaultPlugins, mount, defaultStoreMockOptions } from 'web-test-helpers'
import PrivateLinkItem from 'web-app-files/src/components/SideBar/PrivateLinkItem.vue'

jest.useFakeTimers()

const folder = mock<Resource>({
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  name: 'lorem.txt',
  privateLink: 'https://example.com/fake-private-link'
})

describe('PrivateLinkItem', () => {
  it('should render a button', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('upon clicking it should copy the private link to the clipboard button, render a success message and change icon for half a second', async () => {
    Object.assign(window.navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      }
    })

    const { wrapper, storeOptions } = getWrapper()
    expect(storeOptions.actions.showMessage).not.toHaveBeenCalled()

    await wrapper.trigger('click')
    expect(wrapper.html()).toMatchSnapshot()
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(folder.privateLink)
    expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(550)

    wrapper.vm.$nextTick(() => {
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper() {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.getters.capabilities.mockImplementation(() => ({ files: { privateLinks: true } }))
  const store = createStore(storeOptions)
  return {
    storeOptions,
    wrapper: mount(PrivateLinkItem, {
      global: {
        plugins: [...defaultPlugins(), store],
        provide: {
          resource: folder
        }
      }
    })
  }
}
