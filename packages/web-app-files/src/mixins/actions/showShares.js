import quickActions, { canShare, openNewCollaboratorsPanel } from '../../quickActions'
import { isTrashbinRoute } from '../../helpers/route'

export default {
  computed: {
    $_showShares_items() {
      return [
        {
          name: 'show-shares',
          icon: quickActions.collaborators.icon,
          label: () => this.$gettext('Share'),
          handler: this.$_showShares_trigger,
          isEnabled: ({ resources }) => {
            if (isTrashbinRoute(this.$route)) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }
            return canShare(resources[0], this.$store)
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-show-shares-trigger'
        }
      ]
    }
  },
  methods: {
    $_showShares_trigger({ resources }) {
      openNewCollaboratorsPanel({ item: resources[0], client: this.$client, store: this.$store })
    }
  }
}
