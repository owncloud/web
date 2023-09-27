import { computed, unref } from 'vue'
import { activeApp, useRoute } from 'web-pkg/src/composables'

const isFilesAppActive = (activeApp: string): boolean => {
  // FIXME: we should use this constant but it somehow breaks the unit tests
  // return activeApp === FilesApp.appInfo.id
  return activeApp === 'files'
}

export const useIsFilesAppActive = () => {
  const currentRoute = useRoute()

  return computed(() => isFilesAppActive(activeApp(unref(currentRoute))))
}
