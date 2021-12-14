import ErrorScreen from '../../../src/components/ErrorScreen.vue'
import { Wrapper, mount, createLocalVue } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

let wrapper: Wrapper<any>

describe('The external app error screen component', () => {
  test('displays an icon and a paragraph', () => {
    wrapper = mount(ErrorScreen, {
      localVue,
      stubs: {
        OcIcon: true
      },
      propsData: {
        message: 'Error when loading the application'
      }
    })
    expect(wrapper).toMatchSnapshot()
  })
})
