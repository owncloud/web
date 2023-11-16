import { onBeforeUnmount, readonly, ref, Ref, unref } from 'vue'
import { EventBus, eventBus as defaultEventBus } from '../../services/eventBus'
import { SideBarEventTopics } from './eventTopics'

interface SideBarResult {
  sideBarOpen: Ref<boolean>
  sideBarActivePanel: Ref<string>
}

interface SideBarOptions {
  bus?: EventBus
}

export const useSideBar = (options?: SideBarOptions): SideBarResult => {
  const eventBus = options?.bus || defaultEventBus
  const sideBarOpen = ref(false)
  const sideBarActivePanel = ref(null)
  const toggleSideBarToken = eventBus.subscribe(SideBarEventTopics.toggle, () => {
    sideBarOpen.value = !unref(sideBarOpen)
  })
  const closeSideBarToken = eventBus.subscribe(SideBarEventTopics.close, () => {
    sideBarOpen.value = false
    sideBarActivePanel.value = null
  })
  const openSideBarToken = eventBus.subscribe(SideBarEventTopics.open, () => {
    sideBarOpen.value = true
    sideBarActivePanel.value = null
  })
  const openSideBarWithPanelToken = eventBus.subscribe(
    SideBarEventTopics.openWithPanel,
    (panelName: string) => {
      sideBarOpen.value = true
      sideBarActivePanel.value = panelName
    }
  )
  const setActiveSideBarPanelToken = eventBus.subscribe(
    SideBarEventTopics.setActivePanel,
    (panelName: string) => {
      sideBarActivePanel.value = panelName
    }
  )
  onBeforeUnmount(() => {
    eventBus.unsubscribe(SideBarEventTopics.toggle, toggleSideBarToken)
    eventBus.unsubscribe(SideBarEventTopics.close, closeSideBarToken)
    eventBus.unsubscribe(SideBarEventTopics.open, openSideBarToken)
    eventBus.unsubscribe(SideBarEventTopics.openWithPanel, openSideBarWithPanelToken)
    eventBus.unsubscribe(SideBarEventTopics.setActivePanel, setActiveSideBarPanelToken)
  })

  return {
    sideBarOpen: readonly(sideBarOpen),
    sideBarActivePanel: readonly(sideBarActivePanel)
  }
}
