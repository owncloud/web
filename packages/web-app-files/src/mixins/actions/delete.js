import MixinDeleteResources from '../../mixins/deleteResources'
import { checkRoute } from '../../helpers/route'

export default {
  mixins: [MixinDeleteResources],
  computed: {
    $_delete_items() {
      return [
        {
          icon: 'delete',
          ariaLabel: () => {
            return this.$gettext('Delete')
          },
          handler: this.$_delete_trigger,
          isEnabled: ({ resource }) => {
            if (checkRoute(['files-trashbin'], this.$route.name)) {
              return false
            }

            return resource.canBeDeleted()
          }
        },
        {
          icon: 'delete',
          ariaLabel: () => this.$gettext('Delete'),
          handler: this.$_delete_trigger,
          isEnabled: () => checkRoute(['files-trashbin'], this.$route.name)
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
