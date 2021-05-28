import last from 'lodash-es/last'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('Files', ['activeFilesCount'])
  },
  methods: {
    accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute) {
      const activeBreadcrumb = last(
        document.getElementById('files-breadcrumb').children[0].children
      )
      const activeBreadcrumbItem = activeBreadcrumb.lastChild

      const announcement = this.$gettextInterpolate(
        'containing %{filesCount} files and %{folderCount} folders',
        { filesCount: this.activeFilesCount.files, folderCount: this.activeFilesCount.folders }
      )

      const translatedHint =
        this.activeFilesCount.folders > 0 || this.activeFilesCount.files > 0
          ? announcement
          : this.$gettext('This folder has no content')

      document.querySelectorAll('.oc-breadcrumb-sr').forEach(el => el.remove())

      const invisibleHint = document.createElement('span')
      invisibleHint.className = 'oc-invisible-sr oc-breadcrumb-sr'
      invisibleHint.innerHTML = translatedHint

      activeBreadcrumb.append(invisibleHint)
      if (sameRoute) {
        activeBreadcrumbItem.focus()
      }
    }
  }
}
