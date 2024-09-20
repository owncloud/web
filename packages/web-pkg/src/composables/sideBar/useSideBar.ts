import { nextTick, onBeforeUnmount, readonly, ref, Ref, unref } from 'vue'
import { EventBus, eventBus as defaultEventBus } from '../../services/eventBus'
import { SideBarEventTopics } from './eventTopics'
import { useLocalStorage } from '../localStorage'

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
  const isSideBarOpen = useLocalStorage(`oc_sideBarOpen`, false)

  const focusSidebar = async () => {
    await nextTick()
    const appSideBar = document.getElementById('app-sidebar')
    if (!appSideBar) {
      return
    }
    appSideBar.focus()
  }

  const sideBarActivePanel = ref(null)
  const toggleSideBarToken = eventBus.subscribe(SideBarEventTopics.toggle, () => {
    isSideBarOpen.value = !unref(isSideBarOpen)
    if (unref(isSideBarOpen)) {
      focusSidebar()
    }
  })
  const closeSideBarToken = eventBus.subscribe(SideBarEventTopics.close, () => {
    isSideBarOpen.value = false
    sideBarActivePanel.value = null
  })
  const openSideBarToken = eventBus.subscribe(SideBarEventTopics.open, () => {
    isSideBarOpen.value = true
    sideBarActivePanel.value = null
    focusSidebar()
  })
  const openSideBarWithPanelToken = eventBus.subscribe(
    SideBarEventTopics.openWithPanel,
    (panelName: string) => {
      isSideBarOpen.value = true
      sideBarActivePanel.value = panelName
      focusSidebar()
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

  const onPanelActive = (name: string, callback: (string: string) => void) => {
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
