import { mapActions } from 'vuex'

import { checkRoute } from '../../helpers/route'

export default {
  computed: {
    $_navigate_items() {
      return [
        {
          icon: 'folder-open',
          handler: resource => this.$_navigate_trigger(resource),
          label: () =>
            this.$pgettext('Action in the files list row to open a folder', 'Open folder'),
          isEnabled: ({ resource }) => {
            if (checkRoute(['files-trashbin'], this.$route.name)) {
              return false
            }

            return resource.type === 'folder'
          },
          canBeDefault: true,
          componentType: 'router-link',
          route: this.route,
          class: 'oc-files-actions-sidebar-navigate'
        }
      ]
    },
    route() {
      let route = 'files-personal'
      if (this.publicPage()) {
        route = 'files-public-list'
      }

      return route
    }
  },
  methods: {
    ...mapActions('Files', ['resetSearch']),

    $_navigate_trigger(folder) {
      if (this.searchTerm !== '' && this.$route.params.item === folder.path) {
        this.resetSearch()
      }

      this.$router.push({
        name: this.route,
        params: {
          item: folder.path
        }
      })
    }
  }
}
