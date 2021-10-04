import LoadingScreen from '../../../src/components/LoadingScreen.vue'
import { Wrapper, mount, createLocalVue } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

let wrapper: Wrapper<any>

describe('The external app loading screen component', () => {
  test('displays a spinner and a paragraph', () => {
    wrapper = mount(LoadingScreen, {
      localVue,
      stubs: {
        OcSpinner: true
      }
    })
    expect(wrapper).toMatchSnapshot()
  })
})
