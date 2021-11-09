import { triggerShareAction } from '../../helpers/share/triggerShareAction'

import { isSharedWithMeRoute } from '../../helpers/route'
import { shareStatus } from '../../helpers/shareStatus'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import PQueue from 'p-queue'

export default {
  computed: {
    ...mapGetters(['isOcis']),
    $_declineShare_items() {
      return [
        {
          name: 'decline-share',
          icon: 'not_interested',
          handler: this.$_declineShare_trigger,
          label: ({ resources }) =>
            this.$ngettext('Decline share', 'Decline shares', resources.length),
          isEnabled: ({ resources }) => {
            if (!isSharedWithMeRoute(this.$route)) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            const declineDisabled = resources.some((resource) => {
              return resource.status === shareStatus.declined
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
                shareStatus.declined,
                !this.isOcis,
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
          'Error while declining the selected share.',
          'Error while declining selected shares.',
          resources.length
        ),
        status: 'danger'
      })
    }
  }
}
