import quickActions, { canShare, openNewCollaboratorsPanel } from '../../quickActions'

export default {
  computed: {
    $_showShares_items() {
      return [
        {
          icon: quickActions.collaborators.icon,
          label: () => this.$gettext('Share'),
          handler: this.$_showShares_trigger,
          isEnabled: ({ resource }) => canShare(resource, this.$store),
          componentType: 'oc-button',
          class: 'oc-files-actions-show-shares-trigger'
        }
      ]
    }
  },
  methods: {
    $_showShares_trigger(resource) {
      openNewCollaboratorsPanel({ item: resource, client: this.$client, store: this.$store })
    }
  }
}
