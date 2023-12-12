import { onBeforeUnmount, readonly, ref, Ref, unref } from 'vue'
import { EventBus, eventBus as defaultEventBus } from '../../services/eventBus'
import { SideBarEventTopics } from './eventTopics'

interface SideBarResult {
  isSideBarOpen: Ref<boolean>
  sideBarActivePanel: Ref<string>
  onPanelActive: (name: string, callback: (string: any) => void) => void
}

interface SideBarOptions {
  bus?: EventBus
}

export const useSideBar = (options?: SideBarOptions): SideBarResult => {
  const eventBus = options?.bus || defaultEventBus
  const isSideBarOpen = ref(false)
  const sideBarActivePanel = ref(null)
  const toggleSideBarToken = eventBus.subscribe(SideBarEventTopics.toggle, () => {
    isSideBarOpen.value = !unref(isSideBarOpen)
  })
  const closeSideBarToken = eventBus.subscribe(SideBarEventTopics.close, () => {
    isSideBarOpen.value = false
    sideBarActivePanel.value = null
  })
  const openSideBarToken = eventBus.subscribe(SideBarEventTopics.open, () => {
    isSideBarOpen.value = true
    sideBarActivePanel.value = null
  })
  const openSideBarWithPanelToken = eventBus.subscribe(
    SideBarEventTopics.openWithPanel,
    (panelName: string) => {
      isSideBarOpen.value = true
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

  const onPanelActive = (name: string, callback: (string) => void) => {
    eventBus.subscribe(SideBarEventTopics.setActivePanel, (panelName: string) => {
      if (name !== panelName) {
        return
      }
      // acount for threshold
      setTimeout(() => {
        callback(panelName)
      }, 100)
    })
  }

  return {
    isSideBarOpen: readonly(isSideBarOpen),
    sideBarActivePanel: readonly(sideBarActivePanel),
    onPanelActive
  }
}
