import { mount } from '@ownclouders/web-test-helpers'
import { nextTick } from 'vue'
import HtmlEditorPane from '../../../src/components/HtmlEditorPane.vue'

// The editor reads the (optional) theme store from web-pkg; mock it so the editor
// constructs without a real Pinia theme store.
vi.mock('@ownclouders/web-pkg')

describe('HtmlEditorPane', () => {
  it('renders a CodeMirror editor for empty content', () => {
    const { wrapper } = getWrapper('')
    expect(wrapper.find('.cm-editor').exists()).toBe(true)
  })

  it('renders a CodeMirror editor for a valid HTML document', () => {
    const { wrapper } = getWrapper('<!doctype html><html><body><h1>hi</h1></body></html>')
    expect(wrapper.find('.cm-editor').exists()).toBe(true)
    expect(wrapper.vm.getView().state.doc.toString()).toContain('<h1>hi</h1>')
  })

  it('emits update:modelValue when the document changes', async () => {
    const { wrapper } = getWrapper('')
    wrapper.vm.getView().dispatch({ changes: { from: 0, insert: '<p>x</p>' } })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['<p>x</p>'])
  })

  it('applies external content changes to the editor', async () => {
    const { wrapper } = getWrapper('<p>one</p>')
    await wrapper.setProps({ modelValue: '<p>two</p>' })
    expect(wrapper.vm.getView().state.doc.toString()).toBe('<p>two</p>')
  })
})

function getWrapper(modelValue: string) {
  return {
    wrapper: mount(HtmlEditorPane, {
      props: { modelValue, isReadOnly: false },
      attachTo: document.body
    })
  }
}
