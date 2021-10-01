import last from 'lodash-es/last'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('Files', ['totalFilesCount'])
  },
  methods: {
    accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute) {
      const activeBreadcrumb = last(
        document.getElementById('files-breadcrumb').children[0].children
      )
      const activeBreadcrumbItem = activeBreadcrumb.lastChild

      if (!activeBreadcrumbItem) {
        return
      }

      const itemCount = this.totalFilesCount.files + this.totalFilesCount.folders
      const announcement = this.$ngettext(
        'This folder contains %{ itemCount } item.',
        'This folder contains %{ itemCount } items.',
        itemCount
      )

      const translatedHint =
        itemCount > 0 ? announcement : this.$gettext('This folder has no content.')

      document.querySelectorAll('.oc-breadcrumb-sr').forEach(el => el.remove())

      const invisibleHint = document.createElement('p')
      invisibleHint.className = 'oc-invisible-sr oc-breadcrumb-sr'
      invisibleHint.innerHTML = translatedHint

      activeBreadcrumb.append(invisibleHint)
      if (sameRoute) {
        activeBreadcrumbItem.focus()
      }
    }
  }
}
