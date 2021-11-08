import MixinDeleteResources from '../../mixins/deleteResources'
import { isPersonalRoute, isPublicFilesRoute, isTrashbinRoute } from '../../helpers/route'
import { mapState } from 'vuex'
import { isSameResource } from '../../helpers/resource'

export default {
  mixins: [MixinDeleteResources],
  computed: {
    ...mapState('Files', ['currentFolder']),
    $_delete_items() {
      return [
        {
          name: 'delete',
          icon: 'delete',
          label: () => this.$gettext('Delete'),
          handler: this.$_delete_trigger,
          isEnabled: ({ resources }) => {
            if (!isPersonalRoute(this.$route) && !isPublicFilesRoute(this.$route)) {
              return false
            }

            const deleteDisabled = resources.some((resource) => {
              if (isSameResource(resource, this.currentFolder)) {
                return true
              }
              return !resource.canBeDeleted()
            })
            return !deleteDisabled
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-delete-trigger'
        },
        {
          // this menu item is ONLY for the trashbin (permanently delete a file/folder)
          icon: 'delete',
          label: () => this.$gettext('Delete'),
          handler: this.$_delete_trigger,
          isEnabled: () => isTrashbinRoute(this.$route),
          componentType: 'oc-button',
          class: 'oc-files-actions-delete-trigger'
        }
      ]
    }
  },
  methods: {
    $_delete_trigger({ resources }) {
      this.$_deleteResources_displayDialog(resources)
    }
  }
}
