import { Resource } from '@ownclouders/web-client/src'
import { AppConfigObject } from '@ownclouders/web-pkg'
import { mount } from 'web-test-helpers'
import App from '../../src/App.vue'

vi.mock('@ownclouders/web-pkg')

describe('Text editor app', () => {
  it('shows the editor', () => {
    const { wrapper } = getWrapper({
      applicationConfig: {}
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function getWrapper(props: { applicationConfig: AppConfigObject; resource?: Resource }) {
  return {
    wrapper: mount(App, {
      props
    })
  }
}
