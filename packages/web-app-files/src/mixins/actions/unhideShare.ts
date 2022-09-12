import { triggerShareAction } from '../../helpers/share/triggerShareAction'

import { mapActions, mapGetters, mapMutations } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from 'web-client/src/helpers/share'
import { isLocationSharesActive } from '../../router'
import get from 'lodash-es/get'

export default {
  computed: {
    ...mapGetters(['capabilities']),
    $_unhideShare_hasResharing() {
      return get(this.capabilities, 'files_sharing.resharing', true)
    },
    $_unhideShare_hasShareJail() {
      return get(this.capabilities, 'spaces.share_jail', false)
    },
    $_unhideShare_items() {
      return [
        {
          name: 'unhide-share',
          icon: 'eye',
          handler: this.$_unhideShare_trigger,
          label: ({ resources }) =>
            this.$ngettext('Unhide share', 'Unhide shares', resources.length),
          isEnabled: ({ resources }) => {
            if (!isLocationSharesActive(this.$router, 'files-shares-with-me')) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            const unhideDisabled = resources.some((resource) => {
              return (
                resource.status === ShareStatus.accepted || resource.status === ShareStatus.pending
              )
            })
            return !unhideDisabled
          },
          componentType: 'button',
          class: 'oc-files-actions-unhide-share-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE']),
    ...mapActions(['showMessage']),
    ...mapActions('Files', ['resetFileSelection']),
    async $_unhideShare_trigger({ resources }) {
      const errors = []
      const triggerPromises = []
      const triggerQueue = new PQueue({ concurrency: 4 })
      resources.forEach((resource) => {
        triggerPromises.push(
          triggerQueue.add(async () => {
            try {
              const share = await triggerShareAction(
                resource,
                ShareStatus.accepted,
                this.$_unhideShare_hasResharing,
                this.$_unhideShare_hasShareJail,
                this.$client
              )
              if (share) {
                this.UPDATE_RESOURCE(share)
              }
            } catch (error) {
              console.error(error)
              errors.push(error)
            }
          })
        )
      })
      await Promise.all(triggerPromises)

      if (errors.length === 0) {
        this.resetFileSelection()
        return
      }

      this.showMessage({
        title: this.$ngettext(
          'Failed to unhide the selected share.',
          'Failed to  selected shares.',
          resources.length
        ),
        status: 'danger'
      })
    }
  }
}
