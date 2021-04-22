import MixinDeleteResources from '../../mixins/deleteResources'
import { checkRoute } from '../../helpers/route'

export default {
  mixins: [MixinDeleteResources],
  computed: {
    $_delete_items() {
      return [
        {
          icon: 'delete',
          label: () => {
            return this.$gettext('Delete')
          },
          handler: this.$_delete_trigger,
          isEnabled: ({ resource }) => {
            if (checkRoute(['files-trashbin'], this.$route.name)) {
              return false
            }

            return resource.canBeDeleted()
          },
          componentType: 'oc-button'
        },
        {
          icon: 'delete',
          label: () => this.$gettext('Delete'),
          handler: this.$_delete_trigger,
          isEnabled: () => checkRoute(['files-trashbin'], this.$route.name),
          componentType: 'oc-button'
        }
      ]
    }
  },
  methods: {
    $_delete_trigger(resource) {
      this.$_deleteResources_displayDialog(resource, true)
    }
  }
}
