import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client/src'
import { AppConfigObject } from '@ownclouders/web-pkg'
import { mount } from 'web-test-helpers'
import App from '../../src/App.vue'

jest.mock('@ownclouders/web-pkg')

describe('Text editor app', () => {
  it('shows the editor', () => {
    const { wrapper } = getWrapper({
      applicationConfig: {}
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  describe('preview', () => {
    it.each([
      { fileExtension: 'txt', showPreview: false },
      { fileExtension: 'js', showPreview: false },
      { fileExtension: 'php', showPreview: false },
      { fileExtension: 'json', showPreview: false },
      { fileExtension: 'xml', showPreview: false },
      { fileExtension: 'md', showPreview: true }
    ])('shows only for supported file types: %s', (data) => {
      const { wrapper } = getWrapper({
        applicationConfig: {},
        resource: mock<Resource>({
          extension: data.fileExtension
        })
      })
      expect(wrapper.find('#text-editor-preview').exists()).toBe(data.showPreview)
    })
  })
})

function getWrapper(props: { applicationConfig: AppConfigObject; resource?: Resource }) {
  return {
    wrapper: mount(App, {
      props
    })
  }
}
