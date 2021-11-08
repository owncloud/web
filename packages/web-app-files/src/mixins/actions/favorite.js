import { mapActions } from 'vuex'

import { checkRoute } from '../../helpers/route'

export default {
  inject: { displayedItem: { default: null } },
  computed: {
    $_favorite_items() {
      return [
        {
          name: 'favorite',
          icon: 'star',
          handler: this.$_favorite_trigger,
          label: ({ resources }) => {
            if (resources[0].starred) {
              return this.$gettext('Remove from favorites')
            }
            return this.$gettext('Add to favorites')
          },
          isEnabled: ({ resources }) => {
            if (!checkRoute(['files-personal', 'files-favorites'], this.$route.name)) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }

            return (
              this.isAuthenticated && this.capabilities.files && this.capabilities.files.favorites
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

    $_favorite_trigger({ resources }) {
      this.markFavorite({
        client: this.$client,
        file: resources[0]
      })
        .then(() => {
          if (this.displayedItem) {
            this.displayedItem.value.starred = !this.displayedItem.value.starred
          }
        })
        .catch(() => {
          const translated = this.$gettext('Error while starring "%{file}"')
          const title = this.$gettextInterpolate(translated, { file: resources[0].name }, true)
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
