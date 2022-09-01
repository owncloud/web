import { EventBus } from 'web-pkg/src/event'
import { SideBarEventTopics, useSideBar } from '../../../../src/composables/sideBar'
import { unref } from '@vue/composition-api'
import { createComposableWrapper } from '../composables.setup'

describe('useSideBar', () => {
  let eventBus
  beforeEach(() => {
    eventBus = new EventBus()
  })
  describe('initial state', () => {
    it('should have "sideBarOpen" as "false"', () => {
      createComposableWrapper(() => {
        const { sideBarOpen } = useSideBar({ bus: eventBus })
        expect(unref(sideBarOpen)).toBe(false)
      })
    })
    it('should have "sideBarActivePanel" as "null"', () => {
      createComposableWrapper(() => {
        const { sideBarActivePanel } = useSideBar({ bus: eventBus })
        expect(unref(sideBarActivePanel)).toBeNull()
      })
    })
  })
  describe('open', () => {
    it('should set "sideBarOpen" to "true"', () => {
      createComposableWrapper(() => {
        const { sideBarOpen } = useSideBar({ bus: eventBus })
        eventBus.publish(SideBarEventTopics.open)
        expect(unref(sideBarOpen)).toBe(true)
      })
    })
    it('should set "sideBarActivePanel" to "null"', () => {
      createComposableWrapper(() => {
        const { sideBarActivePanel } = useSideBar({ bus: eventBus })
        eventBus.publish(SideBarEventTopics.open)
        expect(unref(sideBarActivePanel)).toBeNull()
      })
    })
  })
  describe('close', () => {
    it('should set "sideBarOpen" to "false"', () => {
      createComposableWrapper(() => {
        const { sideBarOpen } = useSideBar({ bus: eventBus })
        eventBus.publish(SideBarEventTopics.close)
        expect(unref(sideBarOpen)).toBe(false)
      })
    })
    it('should set "sideBarActivePanel" to "null"', () => {
      createComposableWrapper(() => {
        const { sideBarActivePanel } = useSideBar({ bus: eventBus })
        eventBus.publish(SideBarEventTopics.close)
        expect(unref(sideBarActivePanel)).toBeNull()
      })
    })
  })
  describe('toggle', () => {
    it('should toggle "sideBarOpen" back and forth', () => {
      createComposableWrapper(() => {
        const { sideBarOpen } = useSideBar({ bus: eventBus })
        eventBus.publish(SideBarEventTopics.toggle)
        expect(unref(sideBarOpen)).toBe(true)
        eventBus.publish(SideBarEventTopics.toggle)
        expect(unref(sideBarOpen)).toBe(false)
      })
    })
    it('should not influence "sideBarActivePanel"', () => {
      createComposableWrapper(() => {
        const { sideBarActivePanel } = useSideBar({ bus: eventBus })
        // initial state
        eventBus.publish(SideBarEventTopics.toggle)
        expect(unref(sideBarActivePanel)).toBe(null)
        // modified active panel
        eventBus.publish(SideBarEventTopics.setActivePanel, 'SomePanel')
        eventBus.publish(SideBarEventTopics.toggle)
        expect(unref(sideBarActivePanel)).toBe('SomePanel')
      })
    })
  })
  describe('openWithPanel', () => {
    it('should set "sideBarOpen" to "true"', () => {
      createComposableWrapper(() => {
        const { sideBarOpen } = useSideBar({ bus: eventBus })
        eventBus.publish(SideBarEventTopics.openWithPanel, 'SomePanel')
        expect(unref(sideBarOpen)).toBe(true)
      })
    })
    it('should set "sideBarActivePanel" to provided value', () => {
      createComposableWrapper(() => {
        const { sideBarActivePanel } = useSideBar({ bus: eventBus })
        eventBus.publish(SideBarEventTopics.openWithPanel, 'SomePanel')
        expect(unref(sideBarActivePanel)).toBe('SomePanel')
      })
    })
  })
  describe('setActivePanel', () => {
    it('should not influence "sideBarOpen"', () => {
      createComposableWrapper(() => {
        const { sideBarOpen } = useSideBar({ bus: eventBus })
        eventBus.publish(SideBarEventTopics.setActivePanel)
        expect(unref(sideBarOpen)).toBe(false)
      })
    })
    it('should set "sideBarActivePanel" to provided value', () => {
      createComposableWrapper(() => {
        const { sideBarActivePanel } = useSideBar({ bus: eventBus })
        eventBus.publish(SideBarEventTopics.setActivePanel, 'SomePanel')
        expect(unref(sideBarActivePanel)).toBe('SomePanel')
      })
    })
  })
})
