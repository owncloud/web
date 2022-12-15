import acceptShare from 'web-app-files/src/mixins/actions/acceptShare'
import { ShareStatus } from 'web-client/src/helpers/share'
import { defaultComponentMocks, mount } from 'web-test-helpers'

const sharesWithMeLocation = 'files-shares-with-me'
const sharesWithOthersLocation = 'files-shares-with-others'

const Component = {
  template: '<div></div>',
  mixins: [acceptShare]
}

describe('acceptShare', () => {
  describe('computed property "$_acceptShare_items"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [{ status: ShareStatus.pending }], expectedStatus: true },
        { resources: [{ status: ShareStatus.declined }], expectedStatus: true },
        { resources: [{ status: ShareStatus.accepted }], expectedStatus: false }
      ])(
        `should be set according to the resource share status if the route name is "${sharesWithMeLocation}"`,
        (inputData) => {
          const { wrapper } = getWrapper()

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
        `should be set as false if the route name is other than "${sharesWithMeLocation}"`,
        (resource) => {
          const { wrapper } = getWrapper(sharesWithOthersLocation)

          expect(wrapper.vm.$_acceptShare_items[0].isEnabled({ resource })).toBeFalsy()
        }
      )
    })
  })
})

function getWrapper(routeName = sharesWithMeLocation) {
  return {
    wrapper: mount(Component, {
      global: { mocks: defaultComponentMocks({ currentRoute: { name: routeName } }) }
    })
  }
}
