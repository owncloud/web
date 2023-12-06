import { ref } from 'vue'
import AppTemplate from '../../../src/components/AppTemplate.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  RouteLocation,
  shallowMount
} from 'web-test-helpers'
import { eventBus } from '@ownclouders/web-pkg'
import { SideBarEventTopics } from '@ownclouders/web-pkg'
import { mock } from 'jest-mock-extended'

const stubSelectors = {
  ocBreadcrumb: 'oc-breadcrumb-stub',
  appLoadingSpinner: 'app-loading-spinner-stub',
  sideBar: 'side-bar-stub',
  sideBarToggleButton: '#files-toggle-sidebar'
}

const elSelectors = {
  adminSettingsWrapper: '#admin-settings-wrapper'
}

jest.mock('@ownclouders/web-pkg')

afterEach(() => jest.clearAllMocks())

describe('AppTemplate', () => {
  describe('loading is true', () => {
    it('should show app loading spinner component', () => {
      const { wrapper } = getWrapper({ props: { loading: true } })
      expect(wrapper.find(stubSelectors.appLoadingSpinner).exists()).toBeTruthy()
    })
    it('should not show side bar component', () => {
      const { wrapper } = getWrapper({ props: { loading: true } })
      expect(wrapper.find(stubSelectors.sideBar).exists()).toBeFalsy()
    })
    it('should not show admin settings wrapper', () => {
      const { wrapper } = getWrapper({ props: { loading: true } })
      expect(wrapper.find(elSelectors.adminSettingsWrapper).exists()).toBeFalsy()
    })
  })
  describe('loading is false', () => {
    it('should not show app loading spinner component', () => {
      const { wrapper } = getWrapper({ props: { loading: false } })
      expect(wrapper.find(stubSelectors.appLoadingSpinner).exists()).toBeFalsy()
    })
    it('should show side bar component', () => {
      const { wrapper } = getWrapper({ props: { loading: false } })
      expect(wrapper.find(stubSelectors.sideBar).exists()).toBeTruthy()
    })
    it('should show admin settings wrapper', () => {
      const { wrapper } = getWrapper({ props: { loading: false } })
      expect(wrapper.find(elSelectors.adminSettingsWrapper).exists()).toBeTruthy()
    })
  })
  describe('sideBar', () => {
    it('should show when opened', () => {
      const { wrapper } = getWrapper({ props: { isSideBarOpen: true } })
      expect(wrapper.find(stubSelectors.sideBar).exists()).toBeTruthy()
    })
    it('should not show when closed', () => {
      const { wrapper } = getWrapper({ props: { isSideBarOpen: false } })
      expect(wrapper.find(stubSelectors.sideBar).exists()).toBeFalsy()
    })
    it('can be toggled', async () => {
      const eventSpy = jest.spyOn(eventBus, 'publish')
      const { wrapper } = getWrapper({ props: { sideBarAvailablePanels: [jest.fn()] } })
      await wrapper.find(stubSelectors.sideBarToggleButton).trigger('click')
      expect(eventSpy).toHaveBeenCalledWith(SideBarEventTopics.toggle)
    })
    it('can be closed', async () => {
      const eventSpy = jest.spyOn(eventBus, 'publish')
      const { wrapper } = getWrapper()
      ;(wrapper.findComponent<any>(stubSelectors.sideBar).vm as any).$emit('close')
      expect(eventSpy).toHaveBeenCalledWith(SideBarEventTopics.close)
    })
    it('panel can be selected', async () => {
      const eventSpy = jest.spyOn(eventBus, 'publish')
      const panelName = 'SomePanel'
      const { wrapper } = getWrapper()
      ;(wrapper.findComponent<any>(stubSelectors.sideBar).vm as any).$emit('selectPanel', panelName)
      expect(eventSpy).toHaveBeenCalledWith(SideBarEventTopics.setActivePanel, panelName)
    })
  })
  describe('property propagation', () => {
    describe('oc breadcrumb component', () => {
      it('receives correct props', () => {
        const { wrapper } = getWrapper({
          props: { breadcrumbs: [{ text: 'Administration Settings' }, { text: 'Users' }] }
        })
        expect(wrapper.findComponent<any>(stubSelectors.ocBreadcrumb).props().items).toEqual([
          { text: 'Administration Settings' },
          { text: 'Users' }
        ])
      })
      it('does not show in mobile view', () => {
        const { wrapper } = getWrapper({ isMobileWidth: true })
        expect(wrapper.find(stubSelectors.ocBreadcrumb).exists()).toBeFalsy()
      })
    })
    describe('side bar component', () => {
      it('receives correct props', () => {
        const { wrapper } = getWrapper({
          props: {
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

const storeOptions = { ...defaultStoreMockOptions }
const store = createStore(storeOptions)

function getWrapper({ props = {}, isMobileWidth = false } = {}) {
  return {
    wrapper: shallowMount(AppTemplate, {
      props: {
        loading: false,
        breadcrumbs: [],
        isSideBarOpen: true,
        sideBarAvailablePanels: [],
        sideBarActivePanel: '',
        ...props
      },
      global: {
        plugins: [...defaultPlugins(), store],
        provide: { isMobileWidth: ref(isMobileWidth) },
        stubs: {
          OcButton: false
        },
        mocks: {
          ...defaultComponentMocks({
            currentRoute: mock<RouteLocation>({ query: { app: 'admin-settings' } })
          })
        }
      }
    })
  }
}
