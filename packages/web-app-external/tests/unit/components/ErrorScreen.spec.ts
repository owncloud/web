import ErrorScreen from '../../../src/components/ErrorScreen.vue'
import { mount } from 'web-test-helpers'

describe('The external app error screen component', () => {
  test('displays an icon and a paragraph', () => {
    const wrapper = mount(ErrorScreen, {
      props: {
        message: 'Error when loading the application'
      },
      global: {
        stubs: {
          OcIcon: true
        }
      }
    })
    expect(wrapper).toMatchSnapshot()
  })
})
