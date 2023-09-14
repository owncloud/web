import ErrorScreen from 'web-pkg/src/components/AppTemplates/PartialViews/ErrorScreen.vue'
import { defaultPlugins, mount } from 'web-test-helpers'

describe('The external app error screen component', () => {
  test('displays an icon and a paragraph', () => {
    const wrapper = mount(ErrorScreen, {
      props: {
        message: 'Error when loading the application'
      },
      global: {
        stubs: {
          OcIcon: true
        },
        plugins: [...defaultPlugins()]
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
