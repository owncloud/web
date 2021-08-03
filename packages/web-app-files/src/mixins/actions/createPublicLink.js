import quickActions, { canShare, createPublicLink } from '../../quickActions'

export default {
  computed: {
    $_createPublicLink_items() {
      return [
        {
          icon: quickActions.publicLink.icon,
          label: () => this.$gettext('Create & copy public link'),
          handler: this.$_createPublicLink_trigger,
          isEnabled: ({ resource }) => canShare(resource, this.$store),
          componentType: 'oc-button',
          class: 'oc-files-actions-create-public-link-trigger'
        }
      ]
    }
  },
  methods: {
    $_createPublicLink_trigger(resource) {
      createPublicLink({ item: resource, client: this.$client, store: this.$store })
    }
  }
}
