import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'
import ProgressBar from '@files/src/components/Upload/ProgressBar.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  ocProgress: 'progressbar',
  ocProgressText: '.oc-progress-text',
  ocIcon: 'oc-icon-stub',
  expandedToggle: 'oc-grid-stub',
  progressSingle: '#files-upload-progress-single',
  progressMulti: '#files-upload-progress-multi',
  showDetails: '#files-upload-progress-expand-details',
  hideDetails: '#files-upload-progress-collapse-details',
  detailsWidget: 'details-widget-stub'
}

const items = [
  {
    id: 1,
    name: 'lorem.txt',
    size: 100,
    progress: 20
  },
  {
    id: 2,
    name: 'lorem.png',
    size: 100,
    progress: 10
  }
]
describe('ProgressBar component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  const spyToggleExpanded = jest.spyOn(ProgressBar.methods, '$_toggleExpanded')

  describe('when a single file is uploaded', () => {
    let wrapper
    let store
    beforeEach(() => {
      store = createStore([items[0]])
      wrapper = getShallowWrapper(store)
    })

    it('should show correct progress value', () => {
      const ocProgressStub = wrapper.findComponent({ ref: selectors.ocProgress })
      const ocProgressText = wrapper.find(selectors.ocProgressText)

      expect(ocProgressStub.props().value).toEqual(items[0].progress)
      expect(ocProgressText.text()).toBe(`${items[0].progress} %`)
    })
    it('should show uploading file name but not file count', () => {
      const progressSingle = wrapper.find(selectors.progressSingle)
      const progressMulti = wrapper.find(selectors.progressMulti)

      expect(progressMulti.exists()).toBeFalsy()
      expect(progressSingle.exists()).toBeTruthy()
      expect(progressSingle.props().translateParams).toMatchObject({ fileName: items[0].name })
    })
  })

  describe('when multiple files are uploaded', () => {
    let wrapper
    let store
    beforeEach(() => {
      store = createStore(items)
      wrapper = getShallowWrapper(store)
    })

    it('should show total progress value', () => {
      const ocProgressStub = wrapper.findComponent({ ref: selectors.ocProgress })
      const ocProgressText = wrapper.find(selectors.ocProgressText)
      const totalProgress = items.reduce((total, item) => total + item.progress, 0) / items.length

      expect(ocProgressStub.props().value).toEqual(totalProgress)
      expect(ocProgressText.text()).toBe(`${totalProgress} %`)
    })
    it('should show uploading files count but not file names', () => {
      const progressSingle = wrapper.find(selectors.progressSingle)
      const progressMulti = wrapper.find(selectors.progressMulti)

      expect(progressSingle.exists()).toBeFalsy()
      expect(progressMulti.exists()).toBeTruthy()
      expect(progressMulti.props().translateN).toEqual(items.length)
    })
  })

  describe('when expanded is false', () => {
    let wrapper
    let store
    beforeEach(() => {
      store = createStore(items)
      wrapper = getShallowWrapper(store)
    })
    it('should have "expand_more" as oc-icon name', () => {
      const ocIcon = wrapper.find(selectors.ocIcon)

      expect(ocIcon.props().name).toEqual('expand_more')
    })
    it('should show the text "Show Details"', () => {
      const showDetails = wrapper.find(selectors.showDetails)
      const hideDetails = wrapper.find(selectors.hideDetails)

      expect(hideDetails.exists()).toBeFalsy()
      expect(showDetails.exists()).toBeTruthy()
      expect(showDetails.text()).toEqual('Show Details')
    })
    it('should call "$_toggleExpanded" method if expand is toggled', async () => {
      const expandedToggle = wrapper.find(selectors.expandedToggle)
      await expandedToggle.trigger('click')

      expect(spyToggleExpanded).toHaveBeenCalledTimes(1)
    })
    it('should not show details-widget component', () => {
      const detailsWidget = wrapper.find(selectors.detailsWidget)

      expect(detailsWidget.exists()).toBeFalsy()
    })
  })

  describe('when expanded is true', () => {
    let wrapper
    let store
    beforeEach(() => {
      store = createStore(items)
      wrapper = getShallowWrapper(store, true)
    })
    it('should change oc-icon name to "expand_less"', () => {
      const ocIcon = wrapper.find(selectors.ocIcon)

      expect(ocIcon.props().name).toEqual('expand_less')
    })
    it('should show the text "Hide Details"', () => {
      const showDetails = wrapper.find(selectors.showDetails)
      const hideDetails = wrapper.find(selectors.hideDetails)

      expect(showDetails.exists()).toBeFalsy()
      expect(hideDetails.exists()).toBeTruthy()
      expect(hideDetails.text()).toEqual('Hide Details')
    })
    it('should show details-widget with in-progress items as prop', () => {
      const detailsWidget = wrapper.find(selectors.detailsWidget)

      expect(detailsWidget.exists()).toBeTruthy()
      expect(detailsWidget.props().items).toMatchObject(items)
    })
  })
})

function getShallowWrapper(store, expanded = false) {
  return shallowMount(ProgressBar, {
    localVue,
    data() {
      return {
        expanded,
        announcement: '',
        announcementOnComplete: 'Upload complete'
      }
    },
    store
  })
}

function createStore(inProgress = []) {
  return new Vuex.Store({
    modules: {
      Files: {
        namespaced: true,
        getters: {
          inProgress: jest.fn(() => inProgress),
          uploaded: jest.fn(() => [])
        }
      }
    }
  })
}
