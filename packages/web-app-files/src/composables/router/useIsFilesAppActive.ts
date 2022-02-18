import { computed, ComputedRef, unref } from '@vue/composition-api'
import { useActiveApp } from 'web-pkg/src/composables'

export const isFilesAppActive = (activeApp: string): boolean => {
  // FIXME: we should use this constant but it somehow breaks the unit tests
  // return activeApp === FilesApp.appInfo.id
  return activeApp === 'files'
}

/*
 * This composable can be used to check whether the current route
 * belongs to the file app. It's used to determine whether certain
 * file actions should be enabled in other apps too, for instance
 * in the search app. This way we avoid having cross references to
 * other apps in the files app.
 */
export const useIsFilesAppActive = (): ComputedRef<boolean> => {
  const activeApp = useActiveApp()
  return computed(() => {
    return isFilesAppActive(unref(activeApp))
  })
}
