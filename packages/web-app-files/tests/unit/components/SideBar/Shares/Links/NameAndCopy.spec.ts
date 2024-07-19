import { LinkShare } from '@ownclouders/web-client'
import { useMessages } from '@ownclouders/web-pkg'
import NameAndCopy from 'web-app-files/src/components/SideBar/Shares/Links/NameAndCopy.vue'
import { defaultPlugins, mount } from 'web-test-helpers'

const linkShare = {
  displayName: 'Example link',
  webUrl: 'https://some-url.com/abc'
} as LinkShare

// @vitest-environment jsdom
describe('NameAndCopy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ignore tippy warning
  vi.spyOn(console, 'warn').mockImplementation(undefined)
  it('should show link info component including a copy-to-clipboard button', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('upon clicking it should copy the private link to the clipboard button, render a success message and change icon for half a second', async () => {
    Object.assign(window.navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    })

    const { wrapper } = getWrapper()
    const { showMessage } = useMessages()
    expect(showMessage).not.toHaveBeenCalled()

    await wrapper.find('.oc-files-public-link-copy-url').trigger('click')
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(linkShare.webUrl)
    expect(wrapper.html()).toMatchSnapshot()
    expect(showMessage).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(550)

    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function getWrapper() {
  return {
    wrapper: mount(NameAndCopy, {
      props: {
        linkShare
      },
      global: {
        plugins: [...defaultPlugins()],
        directives: {
          'oc-tooltip': vi.fn()
        }
      }
    })
  }
}
