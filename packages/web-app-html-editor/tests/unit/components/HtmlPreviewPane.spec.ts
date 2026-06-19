import { defaultPlugins, mount } from '@ownclouders/web-test-helpers'
import HtmlPreviewPane from '../../../src/components/HtmlPreviewPane.vue'

describe('HtmlPreviewPane', () => {
  it('renders the content as the iframe srcdoc', () => {
    const { wrapper } = getWrapper('<p>hello</p>')
    expect(wrapper.find('iframe').attributes('srcdoc')).toBe('<p>hello</p>')
  })

  it('sandboxes scripts but never grants same-origin', () => {
    const { wrapper } = getWrapper('<p>x</p>')
    const sandbox = wrapper.find('iframe').attributes('sandbox')
    expect(sandbox).toContain('allow-scripts')
    expect(sandbox).not.toContain('allow-same-origin')
  })

  it('does not leak the referrer', () => {
    const { wrapper } = getWrapper('<p>x</p>')
    expect(wrapper.find('iframe').attributes('referrerpolicy')).toBe('no-referrer')
  })
})

function getWrapper(content: string) {
  return {
    wrapper: mount(HtmlPreviewPane, {
      props: { content },
      global: { plugins: [...defaultPlugins()] }
    })
  }
}
