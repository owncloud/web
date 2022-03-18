import { triggerShareAction } from '../../helpers/share/triggerShareAction'
import { isLocationSharesActive } from '../../router'
import { mapActions, mapMutations } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from '../../helpers/share'
import { useCapabilityFilesSharingResharing } from 'web-pkg/src/composables'

export default {
  setup() {
    return {
      hasResharing: useCapabilityFilesSharingResharing()
    }
  },
  computed: {
    $_declineShare_items() {
      return [
        {
          name: 'decline-share',
          icon: 'close',
          handler: this.$_declineShare_trigger,
          label: ({ resources }) =>
            this.$ngettext('Decline share', 'Decline shares', resources.length),
          isEnabled: ({ resources }) => {
            if (!isLocationSharesActive(this.$router, 'files-shares-with-me')) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            const declineDisabled = resources.some((resource) => {
              return resource.status === ShareStatus.declined
            })
            return !declineDisabled
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-decline-share-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE']),
    ...mapActions(['showMessage']),
    ...mapActions('Files', ['resetFileSelection']),
    async $_declineShare_trigger({ resources }) {
      const errors = []
      const triggerPromises = []
      const triggerQueue = new PQueue({ concurrency: 4 })
      resources.forEach((resource) => {
        triggerPromises.push(
          triggerQueue.add(async () => {
            try {
              const share = await triggerShareAction(
                resource,
                ShareStatus.declined,
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
          'Failed to decline the selected share.',
          'Failed to decline selected shares.',
          resources.length
        ),
        status: 'danger'
      })
    }
  }
}
