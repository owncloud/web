import { getComposableWrapper } from 'web-test-helpers'
import { useModals } from '../../../../src/composables/piniaStores'
import { createPinia, setActivePinia } from 'pinia'

describe('useModals', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('method "dispatchModal"', () => {
    it('registers a modal and adds id and active state', () => {
      getWrapper({
        setup: (instance) => {
          const data = { title: 'test' }
          const modal = instance.dispatchModal(data)

          expect(modal.id).toBeDefined()
          expect(modal.active).toBeTruthy()
          expect(modal.title).toEqual(data.title)

          expect(instance.modals[0]).toEqual(modal)
        }
      })
    })
    it('deactivates existing modal if a new active modal is being registered', () => {
      getWrapper({
        setup: (instance) => {
          instance.dispatchModal({ title: 'test' })
          expect(instance.modals[0].active).toBeTruthy()

          instance.dispatchModal({ title: 'test2' })
          expect(instance.modals[0].active).toBeFalsy()
        }
      })
    })
    it('can register a modal in an inactive state', () => {
      getWrapper({
        setup: (instance) => {
          instance.dispatchModal({ title: 'test' }, { isActive: false })
          expect(instance.modals[0].active).toBeFalsy()
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
          expect(instance.modals[0].title).toEqual(newTitle)
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
  it('activates another inactive modal after removing the current active one', () => {
    getWrapper({
      setup: (instance) => {
        const modal = instance.dispatchModal({ title: 'test' })
        instance.dispatchModal({ title: 'test2' })
        expect(instance.modals[0].active).toBeFalsy()
        instance.removeModal(modal.id)
        expect(instance.modals[0].active).toBeTruthy()
      }
    })
  })
  describe('method "setModalActive"', () => {
    it('activates a modal and deactivates another active modal if present', () => {
      getWrapper({
        setup: (instance) => {
          const modal = instance.dispatchModal({ title: 'test' })
          instance.dispatchModal({ title: 'test2' })
          expect(instance.modals[0].active).toBeFalsy()
          expect(instance.modals[1].active).toBeTruthy()

          instance.setModalActive(modal.id)

          expect(instance.modals[0].active).toBeTruthy()
          expect(instance.modals[1].active).toBeFalsy()
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
