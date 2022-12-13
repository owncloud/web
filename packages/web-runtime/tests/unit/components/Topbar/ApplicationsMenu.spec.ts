import ApplicationsMenu from 'web-runtime/src/components/Topbar/ApplicationsMenu.vue'
import { defaultComponentMocks, shallowMount } from 'web-test-helpers'

const menuLinks = [
  {
    icon: 'folder',
    iconUrl: undefined,
    title: 'Files',
    path: '/files'
  },
  {
    icon: 'some-icon',
    iconUrl: undefined,
    title: 'External',
    url: 'http://some.org',
    target: '_blank'
  }
]

describe('ApplicationsMenu component', () => {
  it('should render navigation with button and menu items in dropdown', () => {
    const { wrapper } = getWrapper(menuLinks)
    expect(wrapper).toMatchSnapshot()
  })
})

function getWrapper(applicationsList = []) {
  return {
    wrapper: shallowMount(ApplicationsMenu, {
      props: {
        applicationsList
      },
      global: {
        mocks: defaultComponentMocks()
      }
    })
  }
}
