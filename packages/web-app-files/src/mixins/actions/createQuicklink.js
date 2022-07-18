import quickActions, { canShare } from '../../quickActions'
import { ShareStatus, createQuicklink } from '../../helpers/share'
import { isLocationSharesActive } from '../../router'

export default {
  computed: {
    $_createQuicklink_items() {
      return [
        {
          name: 'create-quicklink',
          icon: quickActions.quicklink.icon,
          iconFillType: quickActions.quicklink.iconFillType,
          label: () => this.$gettext('Copy quicklink'),
          handler: this.$_createQuicklink_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }
            if (isLocationSharesActive(this.$router, 'files-shares-with-me')) {
              if (resources[0].status !== ShareStatus.accepted) {
                return false
              }
            }
            if (this.$route === 'files-spaces-personal') {
              return true
            }
            return canShare(resources[0], this.$store)
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-create-quicklink-trigger'
        }
      ]
    }
  },
  methods: {
    async $_createQuicklink_trigger({ resources }) {
      const store = this.$store
      const [resource] = resources
      await createQuicklink({
        resource,
        storageId: this.$route.params.storageId || resource?.fileId || resource?.id,
        store
      })

      await store.dispatch('Files/sidebar/openWithPanel', 'sharing-item')
    }
  }
}
