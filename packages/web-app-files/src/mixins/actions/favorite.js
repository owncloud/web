import { mapActions } from 'vuex'

import { checkRoute } from '../../helpers/route'

export default {
  computed: {
    $_favorite_items() {
      return [
        {
          icon: 'star',
          handler: this.$_favorite_trigger,
          label: item => {
            if (item.starred) {
              return this.$gettext('Remove from favorites')
            }
            return this.$gettext('Add to favorites')
          },
          isEnabled: () => {
            const isRouteAllowed = checkRoute(
              ['files-personal', 'files-favorites'],
              this.$route.name
            )

            return (
              this.isAuthenticated &&
              this.capabilities.files &&
              this.capabilities.files.favorites &&
              isRouteAllowed
            )
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-favorite-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files', ['markFavorite']),

    $_favorite_trigger(resource) {
      this.markFavorite({
        client: this.$client,
        file: resource
      }).catch(() => {
        const translated = this.$gettext('Error while starring "%{file}"')
        const title = this.$gettextInterpolate(translated, { file: resource.name }, true)
        this.showMessage({
          title: title,
          status: 'danger',
          autoClose: {
            enabled: true
          }
        })
      })
    }
  }
}
