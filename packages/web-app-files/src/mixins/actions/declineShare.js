import { triggerShareAction } from '../../helpers/share/triggerShareAction'

import { checkRoute } from '../../helpers/route'
import MixinRoutes from '../routes'
import MixinDestroySideBar from '../sidebar/destroySideBar'
import { shareStatus } from '../../helpers/shareStatus'
import { mapGetters, mapMutations } from 'vuex'

export default {
  mixins: [MixinRoutes, MixinDestroySideBar],
  computed: {
    ...mapGetters(['isOcis']),
    $_declineShare_items() {
      return [
        {
          icon: 'not_interested',
          handler: this.$_declineShare_trigger,
          label: () => this.$gettext('Decline share'),
          isEnabled: ({ resource }) => {
            if (!checkRoute(['files-shared-with-me', 'files-personal'], this.$route.name)) {
              return false
            }
            if (!resource.isReceivedShare()) {
              // not a received share, but an own file/folder. Use `delete` action instead.
              return false
            }

            return [shareStatus.pending, shareStatus.accepted].includes(resource.status)
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-sidebar-decline-share-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE', 'REMOVE_FILE']),
    async $_declineShare_trigger(resource) {
      try {
        const share = await triggerShareAction(
          resource,
          shareStatus.declined,
          !this.isOcis,
          this.$client
        )
        // handling of store mutations has to be differently per supported route
        if (this.isSharedWithMeRoute) {
          this.UPDATE_RESOURCE(share)
          return
        }
        if (this.isPersonalRoute) {
          this.$_destroySideBar_hideDetails()
          this.REMOVE_FILE(resource)
          return
        }
        console.error(
          'Store mutation for declineShare not implemented for route ' + this.$route.name
        )
      } catch (error) {
        console.log(error)
        this.showMessage({
          title: this.$gettext('Error while declining the selected share.'),
          status: 'danger'
        })
      }
    }
  }
}
