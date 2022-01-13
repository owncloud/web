import quickActions, { canShare, createPublicLink } from '../../quickActions'
import { ShareStatus } from '../../helpers/share'
import { isLocationSharesActive } from '../../router'

export default {
  computed: {
    $_createPublicLink_items() {
      return [
        {
          name: 'create-public-link',
          icon: quickActions.publicLink.icon,
          iconFillType: quickActions.publicLink.iconFillType,
          label: () => this.$gettext('Create & copy public link'),
          handler: this.$_createPublicLink_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }
            if (isLocationSharesActive(this.$router, 'files-shares-with-me')) {
              if (resources[0].status !== ShareStatus.accepted) {
                return false
              }
              // FIXME: also check via capabilities if resharing is enabled + resharing is allowed on the share
            }
            return canShare(resources[0], this.$store)
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-create-public-link-trigger'
        }
      ]
    }
  },
  methods: {
    $_createPublicLink_trigger({ resources }) {
      createPublicLink({
        item: resources[0],
        client: this.$client,
        store: this.$store,
        $gettext: this.$gettext
      })
    }
  }
}
