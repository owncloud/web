import { createLocationTrash } from '../../../router'
import { createFileRouteOptions } from '../../../router/utils'

export default {
  computed: {
    $_deletedFiles_items() {
      return [
        {
          name: 'deletedFiles',
          icon: 'delete-bin-5',
          label: () => {
            return this.$gettext('Deleted files')
          },
          handler: this.$_deletedFiles_trigger,
          isEnabled: ({ resources }) => {
            return resources.length === 1
          },
          componentType: 'button',
          class: 'oc-files-actions-delete-trigger'
        }
      ]
    }
  },
  methods: {
    $_deletedFiles_trigger({ resources }) {
      this.$router.push(
        createLocationTrash(
          'files-trash-generic',
          createFileRouteOptions(this.space, { fileId: this.space.id })
        )
      )
    }
  }
}
