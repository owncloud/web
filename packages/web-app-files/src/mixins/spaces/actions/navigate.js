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
            if (!isLocationTrashActive(this.$router, 'files-trash-generic')) {
              return false
            }
            return this.space?.driveType !== 'personal'
          },
          componentType: 'button',
          class: 'oc-files-actions-navigate-trigger'
        }
      ]
    }
  },
  methods: {
    $_navigate_space_trigger() {
      const driveAlias = this.space?.driveAlias
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
