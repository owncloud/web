import quickActions, { canShare, createPublicLink } from '../../quickActions'

export default {
  computed: {
    $_createPublicLink_items() {
      return [
        {
          name: 'create-public-link',
          icon: quickActions.publicLink.icon,
          label: () => this.$gettext('Create & copy public link'),
          handler: this.$_createPublicLink_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
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
