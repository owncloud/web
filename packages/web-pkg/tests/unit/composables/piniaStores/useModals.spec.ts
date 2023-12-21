import { getComposableWrapper } from 'web-test-helpers'
import { useModals } from '../../../../src/composables/piniaStores'
import { createPinia, setActivePinia } from 'pinia'

describe('useModals', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('method "dispatchModal"', () => {
    it('adds a modal to the stack of modals', () => {
      getWrapper({
        setup: (instance) => {
          const data = { title: 'test' }
          const modal = instance.dispatchModal(data)

          expect(modal.id).toBeDefined()
          expect(modal.title).toEqual(data.title)
          expect(instance.activeModal).toEqual(modal)
        }
      })
    })
  })
  describe('method "updateModal"', () => {
    it('updates a modal with new data', () => {
      getWrapper({
        setup: (instance) => {
          const modal = instance.dispatchModal({ title: 'test' })
          const newTitle = 'new title'
          instance.updateModal(modal.id, 'title', newTitle)
          expect(instance.activeModal.title).toEqual(newTitle)
        }
      })
    })
  })
  describe('method "removeModal"', () => {
    it('removes an existing modal', () => {
      getWrapper({
        setup: (instance) => {
          const modal = instance.dispatchModal({ title: 'test' })
          instance.removeModal(modal.id)
          expect(instance.modals.length).toBe(0)
        }
      })
    })
  })
  describe('method "setModalActive"', () => {
    it('moves a modal to the first position of the modal stack, making it active', () => {
      getWrapper({
        setup: (instance) => {
          const modal = instance.dispatchModal({ title: 'test' })
          const modal2 = instance.dispatchModal({ title: 'test2' })

          expect(instance.activeModal.id).toEqual(modal2.id)
          instance.setModalActive(modal.id)
          expect(instance.activeModal.id).toEqual(modal.id)
        }
      })
    })
  })
})

function getWrapper({ setup }: { setup: (instance: ReturnType<typeof useModals>) => void }) {
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useModals()
        setup(instance)
      },
      { pluginOptions: { pinia: false } }
    )
  }
}
