import { triggerShareAction } from '../../helpers/share/triggerShareAction'

import { checkRoute } from '../../helpers/route'
import MixinRoutes from '../routes'
import { shareStatus } from '../../helpers/shareStatus'
import { mapGetters, mapMutations } from 'vuex'

export default {
  mixins: [MixinRoutes],
  computed: {
    ...mapGetters(['isOcis']),
    $_declineShare_items() {
      return [
        {
          icon: 'not_interested',
          handler: this.$_declineShare_trigger,
          label: () => this.$gettext('Decline share'),
          isEnabled: ({ resource }) => {
            if (!checkRoute(['files-shared-with-me'], this.$route.name)) {
              return false
            }

            return [shareStatus.pending, shareStatus.accepted].includes(resource.status)
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-decline-share-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE']),
    async $_declineShare_trigger(resource) {
      try {
        const share = await triggerShareAction(
          resource,
          shareStatus.declined,
          !this.isOcis,
          this.$client
        )
        this.UPDATE_RESOURCE(share)
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Error while declining the selected share.'),
          status: 'danger'
        })
      }
    }
  }
}
