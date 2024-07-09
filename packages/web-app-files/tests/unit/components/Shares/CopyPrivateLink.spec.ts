import { mock } from 'vitest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { defaultPlugins, mount } from 'web-test-helpers'
import CopyPrivateLink from 'web-app-files/src/components/Shares/CopyPrivateLink.vue'
import { useMessages } from '@ownclouders/web-pkg'

const resource = mock<Resource>({
  type: 'folder',
  owner: {
    id: 'marie',
    displayName: 'Marie'
  },
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  name: 'lorem.txt',
  privateLink: 'https://example.com/fake-private-link'
})

// @vitest-environment jsdom
describe('PrivateLinkItem', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render a button', () => {
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

    await wrapper.find('button').trigger('click')
    expect(wrapper.html()).toMatchSnapshot()
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(resource.privateLink)
    expect(showMessage).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(550)

    wrapper.vm.$nextTick(() => {
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper() {
  return {
    wrapper: mount(CopyPrivateLink, {
      props: {
        resource
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
