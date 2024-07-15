import { createTestingPinia, getComposableWrapper } from 'web-test-helpers'
import { useResourcesStore } from '../../../../src/composables/piniaStores'
import { mock } from 'vitest-mock-extended'
import { Resource, ShareTypes, SpaceResource } from '@ownclouders/web-client'

describe('useResourcesStore', () => {
  beforeEach(() => {
    createTestingPinia({
      stubActions: false
    })
  })

  describe('loadIndicators', () => {
    it('loads sharing indicator for a direct resource', () => {
      getWrapper({
        setup: (instance) => {
          const space = mock<SpaceResource>({ driveType: 'project', isMember: () => true })
          const resource = mock<Resource>({
            id: '1',
            shareTypes: [ShareTypes.user.value],
            indicators: []
          })
          const resources = [resource]
          instance.resources = resources

          expect(resource.indicators.some(({ category }) => category === 'sharing')).toBeFalsy()
          instance.loadIndicators(space, resource.id)

          expect(resource.indicators.some(({ category }) => category === 'sharing')).toBeTruthy()
        }
      })
    })
    it('loads sharing indicator for an indirect resource (parent)', () => {
      getWrapper({
        setup: (instance) => {
          const space = mock<SpaceResource>({ driveType: 'project', isMember: () => true })
          const resource = mock<Resource>({
            id: '1',
            parentFolderId: '2',
            shareTypes: [ShareTypes.user.value],
            indicators: []
          })
          const resources = [resource]
          instance.resources = resources

          expect(resource.indicators.some(({ category }) => category === 'sharing')).toBeFalsy()
          instance.loadIndicators(space, resource.parentFolderId)

          expect(resource.indicators.some(({ category }) => category === 'sharing')).toBeTruthy()
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (instance: ReturnType<typeof useResourcesStore>) => void
}) {
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useResourcesStore()
        setup(instance)
      },
      { pluginOptions: { pinia: false } }
    )
  }
}
