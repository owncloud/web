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
    const windowSpy = jest.spyOn(window, 'prompt').mockImplementation()
    const { wrapper } = getWrapper()
    const spyShowMessage = jest.spyOn(wrapper.vm, 'showMessage')
    expect(spyShowMessage).not.toHaveBeenCalled()
    expect(windowSpy).not.toHaveBeenCalled()

    await wrapper.find('.oc-files-public-link-copy-url').trigger('click')
    expect(wrapper.html()).toMatchSnapshot()
    expect(spyShowMessage).toHaveBeenCalledTimes(1)
    expect(windowSpy).toHaveBeenCalledTimes(1)
    expect(windowSpy).toHaveBeenCalledWith('Copy to clipboard: Ctrl+C, Enter', exampleLink.url)

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
