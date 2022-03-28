import { openSpaceMembersPanel } from '../../../quickActions'
import { mapMutations } from 'vuex'

export default {
  computed: {
    $_showMembers_items() {
      return [
        {
          name: 'show-members',
          icon: 'group',
          label: () => this.$gettext('Members'),
          handler: this.$_showMembers_trigger,
          isEnabled: ({ resources }) => resources.length === 1,
          componentType: 'oc-button',
          class: 'oc-files-actions-show-details-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['SET_FILE_SELECTION']),

    $_showMembers_trigger({ resources }) {
      this.SET_FILE_SELECTION(resources)
      openSpaceMembersPanel({ item: resources[0], client: this.$client, store: this.$store })
    }
  }
}
