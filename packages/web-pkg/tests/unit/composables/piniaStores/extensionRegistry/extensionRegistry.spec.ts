import { Extension, ExtensionPoint, useExtensionRegistry } from '../../../../../src'
import { getComposableWrapper } from 'web-test-helpers'
import { createPinia, setActivePinia } from 'pinia'
import { computed } from 'vue'
import { mock } from 'vitest-mock-extended'

describe('useExtensionRegistry', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('register and request extensions', () => {
    describe('querying extensions has an empty result', () => {
      it('if no extensions are registered', () => {
        getWrapper({
          setup: (instance) => {
            const result = instance.requestExtensions('customComponent')
            expect(result.length).toBe(0)
          }
        })
      })
      it('if no matching extensions are found', () => {
        const extensions = computed(() =>
          ['foo-1', 'foo-2'].map((id) =>
            mock<Extension>({
              id,
              type: 'customComponent',
              extensionPointIds: ['extension-point-id']
            })
          )
        )

        getWrapper({
          setup: (instance) => {
            instance.registerExtensions(extensions)

            const result1 = instance.requestExtensions('sidebarPanel')
            expect(result1.length).toBe(0)

            const result2 = instance.requestExtensions('sidebarPanel', {
              extensionPointIds: ['some-other-extension-point-id']
            })
            expect(result2.length).toBe(0)

            const result3 = instance.requestExtensions('customComponent', {
              extensionPointIds: ['some-other-extension-point-id']
            })
            expect(result3.length).toBe(0)
          }
        })
      })
    })

    it('can query extensions by type and extension point id', () => {
      const extensionPointId = 'extension-point-id'
      const extensionIds = ['foo-1', 'foo-2', 'foo-3']
      const extensions = computed(() =>
        extensionIds.map((id) =>
          mock<Extension>({
            id,
            type: 'customComponent',
            extensionPointIds: [extensionPointId]
          })
        )
      )

      getWrapper({
        setup: (instance) => {
          instance.registerExtensions(extensions)

          const resultPlain = instance.requestExtensions('customComponent')
          expect(resultPlain.map((e) => e.id)).toEqual(extensionIds)

          const resultWithExtensionPoint = instance.requestExtensions('customComponent', {
            extensionPointIds: [extensionPointId, 'unknown-extension-point-id']
          })
          expect(resultWithExtensionPoint.map((e) => e.id)).toEqual(extensionIds)
        }
      })
    })
  })

  describe('register and get extensionPoints', () => {
    describe('querying extension points has an empty result', () => {
      it('if no extension points are registered', () => {
        getWrapper({
          setup: (instance) => {
            const result = instance.getExtensionPoints()
            expect(result.length).toBe(0)
          }
        })
      })

      it('if no matching extension points are found', () => {
        const extensionPoint = mock<ExtensionPoint>({
          id: 'foo-1',
          extensionType: 'customComponent'
        })

        getWrapper({
          setup: (instance) => {
            instance.registerExtensionPoint(extensionPoint)

            const result = instance.getExtensionPoints({ extensionType: 'customComponent' })
            expect(result.length).toBe(1)
          }
        })
      })
    })

    it('can query extension points by type', () => {
      const extensionPoints = [
        mock<ExtensionPoint>({
          id: 'foo-1',
          extensionType: 'customComponent'
        }),
        mock<ExtensionPoint>({
          id: 'foo-2',
          extensionType: 'sidebarPanel'
        }),
        mock<ExtensionPoint>({
          id: ' foo-3',
          extensionType: 'customComponent'
        })
      ]

      getWrapper({
        setup: (instance) => {
          extensionPoints.forEach((ep) => instance.registerExtensionPoint(ep))

          const result1 = instance.getExtensionPoints({ extensionType: 'customComponent' })
          expect(result1.map((ep) => ep.id)).toEqual([extensionPoints[0].id, extensionPoints[2].id])

          const result2 = instance.getExtensionPoints({ extensionType: 'sidebarPanel' })
          expect(result2.map((ep) => ep.id)).toEqual([extensionPoints[1].id])
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (instance: ReturnType<typeof useExtensionRegistry>) => void
}) {
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useExtensionRegistry()
        setup(instance)
      },
      { pluginOptions: { pinia: false } }
    )
  }
}
