import { activeApp } from 'web-pkg/src/composables'

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
