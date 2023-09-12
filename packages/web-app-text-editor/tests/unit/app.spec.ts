import { AppConfigObject } from 'web-pkg/src/apps'
import { mount } from 'web-test-helpers'
import App from '../../src/App.vue'

jest.mock('web-pkg/src/composables/appDefaults')

describe('Text editor app', () => {
  it('shows the editor', async () => {
    const { wrapper } = getWrapper({
      applicationConfig: {}
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  // describe('preview', () => {
  //   it.each([
  //     { fileExtension: 'txt', showPreview: false },
  //     { fileExtension: 'js', showPreview: false },
  //     { fileExtension: 'php', showPreview: false },
  //     { fileExtension: 'json', showPreview: false },
  //     { fileExtension: 'xml', showPreview: false },
  //     { fileExtension: 'md', showPreview: true }
  //   ])('shows only for supported file types', async (data) => {
  //     const { wrapper } = getWrapper({ fileName: `file.${data.fileExtension}` })
  //     expect(wrapper.find('#text-editor-preview').exists()).toBe(data.showPreview)
  //   })
  // })
})

function getWrapper(props: { applicationConfig: AppConfigObject }) {
  return {
    wrapper: mount(App, {
      props
    })
  }
}
