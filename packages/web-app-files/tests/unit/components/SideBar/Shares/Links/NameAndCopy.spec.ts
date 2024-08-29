import { ref } from 'vue'
import { LinkShare } from '@ownclouders/web-client'
import { useMessages } from '@ownclouders/web-pkg'
import NameAndCopy from '../../../../../../src/components/SideBar/Shares/Links/NameAndCopy.vue'
import { useClipboard } from '@vueuse/core'
import { mock } from 'vitest-mock-extended'
import { defaultPlugins, mount } from 'web-test-helpers'

const linkShare = {
  displayName: 'Example link',
  webUrl: 'https://some-url.com/abc'
} as LinkShare

vi.mock('@vueuse/core', () => ({
  useClipboard: vi.fn(() => ({
    copy: vi.fn(),
    copied: false,
    isSupported: true
  }))
}))

describe('NameAndCopy', () => {
  // ignore tippy warning
  vi.spyOn(console, 'warn').mockImplementation(undefined)
  it('should show link info component including a copy-to-clipboard button', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('upon clicking it should copy the private link to the clipboard button, render a success message and change icon for half a second', async () => {
    const copyMock = vi.fn()
    const copiedRef = ref(true)
    vi.mocked(useClipboard).mockReturnValue(
      mock<ReturnType<typeof useClipboard>>({ copy: copyMock, copied: copiedRef })
    )

    const { wrapper } = getWrapper()
    const { showMessage } = useMessages()
    expect(showMessage).not.toHaveBeenCalled()

    await wrapper.find('.oc-files-public-link-copy-url').trigger('click')
    expect(copyMock).toHaveBeenCalledTimes(1)
    expect(wrapper.html()).toMatchSnapshot()
    expect(showMessage).toHaveBeenCalledTimes(1)

    copiedRef.value = false

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
