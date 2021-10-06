import { shallowMount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'

import DetailsWidget from '@files/src/components/Upload/DetailsWidget.vue'

const selectors = {
  oCProgress: 'oc-progress-stub',
  itemName: '.upload-details-item-name',
  itemSize: '.upload-details-item-size',
  progressText: '.oc-progress-text'
}

const item = {
  id: 1,
  name: 'lorem.txt',
  size: 100,
  progress: 20
}

const localVue = createLocalVue()
localVue.use(DesignSystem)

const wrapper = shallowMount(DetailsWidget, {
  localVue,
  propsData: { items: [item] },
  stubs: {
    'oc-progress': true,
    'oc-icon': true
  }
})

describe('DetailsWidget component', () => {
  describe('when an item is provided in prop', () => {
    it('should have correct props in oc-progress', () => {
      const ocProgress = wrapper.find(selectors.oCProgress)

      expect(ocProgress.exists()).toBeTruthy()
      expect(ocProgress.props().value).toBe(item.progress)
    })
    it('should show item name', () => {
      const itemName = wrapper.find(selectors.itemName)

      expect(itemName.exists()).toBeTruthy()
      expect(itemName.text()).toEqual(item.name)
    })
    it('should show item size', () => {
      const itemSize = wrapper.find(selectors.itemSize)

      expect(itemSize.exists()).toBeTruthy()
      expect(itemSize.text()).toEqual(item.size + ' B')
    })
    it('should show progress percentage', () => {
      const progressText = wrapper.find(selectors.progressText)

      expect(progressText.exists()).toBeTruthy()
      expect(progressText.text()).toEqual(item.progress + ' %')
    })
  })
})
