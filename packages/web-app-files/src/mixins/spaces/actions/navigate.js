import { createLocationSpaces, isLocationTrashActive } from '../../../router'
import { createFileRouteOptions } from '../../../router/utils'

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
      if (!this.space) {
        return
      }
      return this.$router.push(
        createLocationSpaces(
          'files-spaces-generic',
          createFileRouteOptions(this.space, { fileId: this.space.id })
        )
      )
    }
  }
}
