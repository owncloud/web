import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import Delete from '@files/src/mixins/actions/delete.js'
import {
  createLocationShares,
  createLocationSpaces,
  createLocationTrash
} from '../../../../src/router'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [Delete]
}

describe('delete', () => {
  describe('computed property "$_delete_items"', () => {
    describe('delete isEnabled property of returned element', () => {
      it.each([
        { resources: [{ canBeDeleted: () => true }], invalidLocation: false, expectedStatus: true },
        { resources: [{ canBeDeleted: () => true }], invalidLocation: true, expectedStatus: false },
        {
          resources: [{ canBeDeleted: () => false }],
          invalidLocation: false,
          expectedStatus: false
        }
      ])('should be set correctly', (inputData) => {
        const wrapper = getWrapper({ invalidLocation: inputData.invalidLocation })
        const resources = inputData.resources
        expect(wrapper.vm.$_delete_items[0].isEnabled({ resources })).toBe(inputData.expectedStatus)
      })
    })
    describe('delete-permanent isEnabled property of returned element', () => {
      it.each([
        { resources: [{}], deletePermanent: true, invalidLocation: false, expectedStatus: true },
        { resources: [{}], deletePermanent: true, invalidLocation: true, expectedStatus: false },
        {
          resources: [],
          deletePermanent: true,
          invalidLocation: false,
          expectedStatus: false
        }
      ])('should be set correctly', (inputData) => {
        const wrapper = getWrapper({
          deletePermanent: true,
          invalidLocation: inputData.invalidLocation
        })
        const resources = inputData.resources
        expect(wrapper.vm.$_delete_items[1].isEnabled({ resources })).toBe(inputData.expectedStatus)
      })
    })
  })
})

function getWrapper({ deletePermanent = false, invalidLocation = false } = {}) {
  return mount(Component, {
    localVue,
    mocks: {
      $router: {
        currentRoute: invalidLocation
          ? createLocationShares('files-shares-via-link')
          : deletePermanent
          ? createLocationTrash('files-trash-personal')
          : createLocationSpaces('files-spaces-personal-home'),
        resolve: (r) => {
          return { href: r.name }
        }
      }
    }
  })
}
