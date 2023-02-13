import { mapActions } from 'vuex'

import { isLocationCommonActive, isLocationSpacesActive } from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'

export default {
  mixins: [isFilesAppActive],
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
            if (
              this.$_isFilesAppActive &&
              !isLocationSpacesActive(this.$router, 'files-spaces-generic') &&
              !isLocationCommonActive(this.$router, 'files-common-favorites')
            ) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }

            if (this.$route.query.contextRouteName === 'files-public-link') {
              return false
            }

            if (this.$route.query.contextRouteParams?.driveAliasAndItem === 'public') {
              return false
            }

            return this.capabilities?.files?.favorites
          },
          componentType: 'button',
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
      }).catch(() => {
        const translated = this.$gettext('Failed to change favorite state of "%{file}"')
        const title = this.$gettextInterpolate(translated, { file: resources[0].name }, true)
        this.showMessage({
          title: title,
          status: 'danger'
        })
      })
    }
  }
}
