import { defaultPlugins, mount, PartialComponentProps } from '@ownclouders/web-test-helpers'
import { nextTick } from 'vue'
import App from '../../src/App.vue'
import HtmlToolbar from '../../src/components/HtmlToolbar.vue'
import HtmlEditorPane from '../../src/components/HtmlEditorPane.vue'
import HtmlPreviewPane from '../../src/components/HtmlPreviewPane.vue'

describe('HTML editor app', () => {
  it('renders the toolbar, the editor and the preview', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.findComponent(HtmlToolbar).exists()).toBe(true)
    expect(wrapper.findComponent(HtmlEditorPane).exists()).toBe(true)
    expect(wrapper.findComponent(HtmlPreviewPane).exists()).toBe(true)
  })

  it('defaults to split view', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find('.html-editor-body').classes()).toContain('html-editor-body-split')
  })

  it('re-emits editor changes as update:currentContent', async () => {
    const { wrapper } = getWrapper()
    wrapper.findComponent(HtmlEditorPane).vm.$emit('update:modelValue', '<p>hi</p>')
    await nextTick()
    expect(wrapper.emitted('update:currentContent')?.[0]).toEqual(['<p>hi</p>'])
  })

  it('switches the view mode from the toolbar', async () => {
    const { wrapper } = getWrapper()
    wrapper.findComponent(HtmlToolbar).vm.$emit('changeMode', 'preview')
    await nextTick()
    expect(wrapper.find('.html-editor-body').classes()).toContain('html-editor-body-preview-only')
  })

  it('feeds debounced content to the preview', async () => {
    const { wrapper } = getWrapper({ currentContent: '<h1>start</h1>' })
    // initial preview reflects the initial content synchronously
    expect(wrapper.findComponent(HtmlPreviewPane).props('content')).toBe('<h1>start</h1>')

    vi.useFakeTimers()
    await wrapper.setProps({ currentContent: '<h1>changed</h1>' })
    // debounced: not updated yet
    expect(wrapper.findComponent(HtmlPreviewPane).props('content')).toBe('<h1>start</h1>')
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(wrapper.findComponent(HtmlPreviewPane).props('content')).toBe('<h1>changed</h1>')
    vi.useRealTimers()
  })
})

function getWrapper(props: PartialComponentProps<typeof App> = {}) {
  return {
    wrapper: mount(App, {
      props: {
        applicationConfig: {},
        currentContent: '',
        isReadOnly: false,
        resource: undefined,
        ...props
      },
      global: {
        plugins: [...defaultPlugins()],
        stubs: {
          HtmlEditorPane: true,
          HtmlPreviewPane: true,
          HtmlToolbar: true
        }
      }
    })
  }
}
