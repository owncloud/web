import { computed, unref } from 'vue'
import { activeApp, useRoute } from 'web-pkg/src/composables'

const isFilesAppActive = (activeApp: string): boolean => {
  // FIXME: we should use this constant but it somehow breaks the unit tests
  // return activeApp === FilesApp.appInfo.id
  return activeApp === 'files'
}

export default {
  computed: {
    $_isFilesAppActive(): boolean {
      return isFilesAppActive(activeApp(this.$route))
    }
  }
}

// FIXME: move whole file to composables/ and delete mixin when we have gotten rid of action mixins
export const useIsFilesAppActive = () => {
  const currentRoute = useRoute()

  return computed(() => isFilesAppActive(activeApp(unref(currentRoute))))
}
