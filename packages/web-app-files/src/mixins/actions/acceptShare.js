import { triggerShareAction } from '../../helpers/share/triggerShareAction'

import { mapActions, mapMutations } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from '../../helpers/share'
import { isLocationSharesActive } from '../../router'
import { useCapabilityFilesSharingResharing } from 'web-pkg/src/composables'

export default {
  computed: {
    setup() {
      return {
        hasResharing: useCapabilityFilesSharingResharing()
      }
    },
    $_acceptShare_items() {
      return [
        {
          name: 'accept-share',
          icon: 'check',
          handler: this.$_acceptShare_trigger,
          label: ({ resources }) =>
            this.$ngettext('Accept share', 'Accept shares', resources.length),
          isEnabled: ({ resources }) => {
            if (!isLocationSharesActive(this.$router, 'files-shares-with-me')) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            const acceptDisabled = resources.some((resource) => {
              return resource.status === ShareStatus.accepted
            })
            return !acceptDisabled
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-accept-share-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE']),
    ...mapActions(['showMessage']),
    ...mapActions('Files', ['resetFileSelection']),
    async $_acceptShare_trigger({ resources }) {
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
                this.hasResharing,
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
          'Failed to accept the selected share.',
          'Failed to accept selected shares.',
          resources.length
        ),
        status: 'danger'
      })
    }
  }
}
