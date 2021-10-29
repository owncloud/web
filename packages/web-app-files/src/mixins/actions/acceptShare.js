import { triggerShareAction } from '../../helpers/share/triggerShareAction'

import { checkRoute } from '../../helpers/route'
import MixinRoutes from '../routes'
import { shareStatus } from '../../helpers/shareStatus'
import { mapGetters, mapMutations } from 'vuex'

export default {
  mixins: [MixinRoutes],
  computed: {
    ...mapGetters(['isOcis']),
    $_acceptShare_items() {
      return [
        {
          icon: 'check',
          handler: this.$_acceptShare_trigger,
          label: () => this.$gettext('Accept share'),
          isEnabled: ({ resource }) => {
            if (!checkRoute(['files-shared-with-me'], this.$route.name)) {
              return false
            }

            return [shareStatus.pending, shareStatus.declined].includes(resource.status)
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-accept-share-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE']),
    async $_acceptShare_trigger(resource) {
      try {
        const share = await triggerShareAction(
          resource,
          shareStatus.accepted,
          !this.isOcis,
          this.$client
        )
        this.UPDATE_RESOURCE(share)
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Error while accepting the selected share.'),
          status: 'danger'
        })
      }
    }
  }
}
