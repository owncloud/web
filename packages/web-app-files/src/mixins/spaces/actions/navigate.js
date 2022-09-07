import { createLocationSpaces, isLocationTrashActive } from '../../../router'

export default {
  computed: {
    $_navigate_space_items() {
      return [
        {
          name: 'navigate',
          icon: 'layout-grid',
          label: () => {
            return this.$gettext('Navigate to space')
          },
          handler: this.$_navigate_space_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length) {
              return false
            }
            return isLocationTrashActive(this.$router, 'files-trash-spaces-project')
          },
          componentType: 'button',
          class: 'oc-files-actions-navigate-trigger'
        }
      ]
    }
  },
  methods: {
    $_navigate_space_trigger({ resources }) {
      const driveAlias = resources[0].driveAlias
      if (!driveAlias) {
        return
      }
      return this.$router.push(
        createLocationSpaces('files-spaces-generic', {
          params: {
            driveAliasAndItem: driveAlias
          }
        })
      )
    }
  }
}
