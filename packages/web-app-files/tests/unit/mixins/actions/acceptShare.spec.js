import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import acceptShare from '@files/src/mixins/actions/acceptShare.js'
import { createLocationShares } from '../../../../src/router'
import { ShareStatus } from '@files/src/helpers/share'

const localVue = createLocalVue()
localVue.use(Vuex)

const sharesWithMeLocation = createLocationShares('files-shares-with-me')
const sharesWithOthersLocation = createLocationShares('files-shares-with-others')

describe('acceptShare', () => {
  const Component = {
    render() {},
    mixins: [acceptShare]
  }

  function getWrapper(route = sharesWithMeLocation) {
    return mount(Component, {
      localVue,
      mocks: {
        $router: {
          currentRoute: route,
          resolve: (r) => {
            return {
              href: r.name
            }
          }
        }
      }
    })
  }

  describe('computed property "$_acceptShare_items"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [{ status: ShareStatus.pending }], expectedStatus: true },
        { resources: [{ status: ShareStatus.declined }], expectedStatus: true },
        { resources: [{ status: ShareStatus.accepted }], expectedStatus: false }
      ])(
        `should be set according to the resource share status if the route name is "${sharesWithMeLocation.name}"`,
        (inputData) => {
          const wrapper = getWrapper()

          const resources = inputData.resources
          expect(wrapper.vm.$_acceptShare_items[0].isEnabled({ resources })).toBe(
            inputData.expectedStatus
          )
        }
      )
      it.each([
        { status: ShareStatus.pending },
        { status: ShareStatus.declined },
        { status: ShareStatus.accepted }
      ])(
        `should be set as false if the route name is other than "${sharesWithMeLocation.name}"`,
        (resource) => {
          const wrapper = getWrapper(sharesWithOthersLocation)

          expect(wrapper.vm.$_acceptShare_items[0].isEnabled({ resource })).toBeFalsy()
        }
      )
    })
  })
})
