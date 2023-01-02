import NameAndCopy from 'web-app-files/src/components/SideBar/Shares/Links/NameAndCopy.vue'
import { createStore, defaultPlugins, mount, defaultStoreMockOptions } from 'web-test-helpers'

jest.useFakeTimers()

const exampleLink = {
  name: 'Example link',
  url: 'https://some-url.com/abc'
}

describe('NameAndCopy', () => {
  // ignore tippy warning
  jest.spyOn(console, 'warn').mockImplementation(undefined)
  it('should show link info component including a copy-to-clipboard button', () => {
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

    await wrapper.find('.oc-files-public-link-copy-url').trigger('click')
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(exampleLink.url)
    expect(wrapper.html()).toMatchSnapshot()
    expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(550)

    wrapper.vm.$nextTick(() => {
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper() {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockImplementation(() => ({ files: { privateLinks: true } }))
  const store = createStore(storeOptions)
  return {
    storeOptions,
    wrapper: mount(NameAndCopy, {
      props: {
        link: exampleLink
      },
      global: {
        plugins: [...defaultPlugins(), store],
        directives: {
          'oc-tooltip': jest.fn()
        }
      }
    })
  }
}
