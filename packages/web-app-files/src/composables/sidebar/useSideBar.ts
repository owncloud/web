import { onBeforeUnmount, ref, Ref, unref } from '@vue/composition-api'
import { bus } from 'web-pkg/src/instance'

interface SideBarResult {
  sideBarOpen: Ref<boolean>
  sideBarActivePanel: Ref<string>
}

export const useSideBar = (): SideBarResult => {
  const sideBarOpen = ref(false)
  const sideBarActivePanel = ref(null)
  const toggleSideBarToken = bus.subscribe('app.files.sidebar.toggle', () => {
    sideBarOpen.value = !unref(sideBarOpen)
  })
  const closeSideBarToken = bus.subscribe('app.files.sidebar.close', () => {
    sideBarOpen.value = false
    sideBarActivePanel.value = null
  })
  const openSideBarToken = bus.subscribe('app.files.sidebar.open', () => {
    sideBarOpen.value = true
    sideBarActivePanel.value = null
  })
  const openSideBarWithPanelToken = bus.subscribe(
    'app.files.sidebar.openWithPanel',
    (panelName) => {
      sideBarOpen.value = true
      sideBarActivePanel.value = panelName
    }
  )
  const setActiveSideBarPanelToken = bus.subscribe(
    'app.files.sidebar.setActivePanel',
    (panelName) => {
      sideBarActivePanel.value = panelName
    }
  )
  onBeforeUnmount(() => {
    bus.unsubscribe('app.files.sidebar.toggle', toggleSideBarToken)
    bus.unsubscribe('app.files.sidebar.close', closeSideBarToken)
    bus.unsubscribe('app.files.sidebar.open', openSideBarToken)
    bus.unsubscribe('app.files.sidebar.openWithPanel', openSideBarWithPanelToken)
    bus.unsubscribe('app.files.sidebar.setActivePanel', setActiveSideBarPanelToken)
  })

  return {
    sideBarOpen,
    sideBarActivePanel
  }
}
