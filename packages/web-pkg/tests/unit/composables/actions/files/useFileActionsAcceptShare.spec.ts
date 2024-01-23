import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { useFileActionsAcceptShare } from '../../../../../src/composables/actions/files/useFileActionsAcceptShare'
import { ShareResource, ShareStatus } from '@ownclouders/web-client/src/helpers/share'
import { defaultComponentMocks, getComposableWrapper, RouteLocation } from 'web-test-helpers'

const sharesWithMeLocation = 'files-shares-with-me'
const sharesWithOthersLocation = 'files-shares-with-others'

describe('acceptShare', () => {
  describe('computed property "actions"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [{ status: ShareStatus.pending }] as ShareResource[], expectedStatus: true },
        { resources: [{ status: ShareStatus.declined }] as ShareResource[], expectedStatus: true },
        { resources: [{ status: ShareStatus.accepted }] as ShareResource[], expectedStatus: false }
      ])(
        `should be set according to the resource share status if the route name is "${sharesWithMeLocation}"`,
        (inputData) => {
          getWrapper({
            setup: () => {
              const { actions } = useFileActionsAcceptShare()

              const resources = inputData.resources
              expect(unref(actions)[0].isEnabled({ space: null, resources })).toBe(
                inputData.expectedStatus
              )
            }
          })
        }
      )
      it.each([
        { status: ShareStatus.pending } as ShareResource,
        { status: ShareStatus.declined } as ShareResource,
        { status: ShareStatus.accepted } as ShareResource
      ])(
        `should be set as false if the route name is other than "${sharesWithMeLocation}"`,
        (resource) => {
          getWrapper({
            routeName: sharesWithOthersLocation,
            setup: () => {
              const { actions } = useFileActionsAcceptShare()

              expect(
                unref(actions)[0].isEnabled({ space: null, resources: [resource] })
              ).toBeFalsy()
            }
          })
        }
      )
    })
  })
})

function getWrapper({ setup, routeName = sharesWithMeLocation }) {
  const mocks = defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) })
  return {
    wrapper: getComposableWrapper(setup, {
      mocks,
      provide: mocks
    })
  }
}
