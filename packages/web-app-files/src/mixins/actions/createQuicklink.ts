import quickActions, { canShare } from '../../quickActions'
import { createQuicklink } from '../../helpers/share'
import { ShareStatus } from 'web-client/src/helpers/share'

import { isLocationSharesActive, isLocationCommonActive  } from '../../router'
import { bus } from 'web-pkg/src/instance'
import { SideBarEventTopics } from '../../composables/sideBar'

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
            if (
              isLocationSharesActive(this.$router, 'files-shares-with-me') ||
              isLocationCommonActive(this.$router, 'files-common-projects')
            ) {
              if (resources[0].status !== ShareStatus.accepted) {
                return false
              }
            }
            return canShare(resources[0], this.$store)
          },
          componentType: 'button',
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

      bus.publish(SideBarEventTopics.openWithPanel, 'sharing-item#linkShares')
    }
  }
}
