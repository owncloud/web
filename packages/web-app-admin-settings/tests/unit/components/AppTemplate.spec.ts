import AppTemplate from '../../../src/components/AppTemplate.vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'

const stubSelectors = {
  ocBreadcrumb: 'oc-breadcrumb-stub',
  appLoadingSpinner: 'app-loading-spinner-stub',
  sideBar: 'side-bar-stub'
}

const elSelectors = {
  adminSettingsWrapper: '#admin-settings-wrapper'
}

afterEach(() => jest.clearAllMocks())

describe('AppTemplate', () => {
  describe('loading is true', () => {
    it('should show app loading spinner component', () => {
      const { wrapper } = getWrapper({ propsData: { loading: true } })
      expect(wrapper.find(stubSelectors.appLoadingSpinner).exists()).toBeTruthy()
    })
    it('should not show side bar component', () => {
      const { wrapper } = getWrapper({ propsData: { loading: true } })
      expect(wrapper.find(stubSelectors.sideBar).exists()).toBeFalsy()
    })
    it('should not show admin settings wrapper', () => {
      const { wrapper } = getWrapper({ propsData: { loading: true } })
      expect(wrapper.find(elSelectors.adminSettingsWrapper).exists()).toBeFalsy()
    })
  })
  describe('loading is false', () => {
    it('should not show app loading spinner component', () => {
      const { wrapper } = getWrapper({ propsData: { loading: false } })
      expect(wrapper.find(stubSelectors.appLoadingSpinner).exists()).toBeFalsy()
    })
    it('should show side bar component', () => {
      const { wrapper } = getWrapper({ propsData: { loading: false } })
      expect(wrapper.find(stubSelectors.sideBar).exists()).toBeTruthy()
    })
    it('should show admin settings wrapper', () => {
      const { wrapper } = getWrapper({ propsData: { loading: false } })
      expect(wrapper.find(elSelectors.adminSettingsWrapper).exists()).toBeTruthy()
    })
  })
  describe('sideBarOpen is true', () => {
    it('should show side bar component', () => {
      const { wrapper } = getWrapper({ propsData: { sideBarOpen: true } })
      expect(wrapper.find(stubSelectors.sideBar).exists()).toBeTruthy()
    })
  })
  describe('sideBarOpen is false', () => {
    it('should not show side bar component', () => {
      const { wrapper } = getWrapper({ propsData: { sideBarOpen: false } })
      expect(wrapper.find(stubSelectors.sideBar).exists()).toBeFalsy()
    })
  })
  describe('property propagation', () => {
    describe('oc breadcrumb component', () => {
      it('receives correct props', () => {
        const { wrapper } = getWrapper({
          propsData: { breadcrumbs: [{ text: 'Administration Settings' }, { text: 'Users' }] }
        })
        expect(wrapper.findComponent<any>(stubSelectors.ocBreadcrumb).props().items).toEqual([
          { text: 'Administration Settings' },
          { text: 'Users' }
        ])
      })
    })
    describe('side bar component', () => {
      it('receives correct props', () => {
        const { wrapper } = getWrapper({
          propsData: {
            sideBarActivePanel: 'DetailsPanel',
            sideBarAvailablePanels: [{ app: 'DetailsPanel' }]
          }
        })
        expect(wrapper.findComponent<any>(stubSelectors.sideBar).props().activePanel).toEqual(
          'DetailsPanel'
        )
        expect(wrapper.findComponent<any>(stubSelectors.sideBar).props().availablePanels).toEqual([
          { app: 'DetailsPanel' }
        ])
      })
    })
  })
})

function getWrapper({ propsData = {} } = {}) {
  return {
    wrapper: shallowMount(AppTemplate, {
      props: {
        loading: false,
        breadcrumbs: [],
        sideBarOpen: true,
        sideBarAvailablePanels: [],
        sideBarActivePanel: '',
        ...propsData
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks: {
          ...defaultComponentMocks({
            gettext: false,
            currentRoute: { query: { app: 'admin-settings' } }
          })
        }
      }
    })
  }
}
