import { triggerShareAction } from '../../helpers/share/triggerShareAction'
import { isLocationSharesActive, isLocationSpacesActive, createLocationShares } from '../../router'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from '../../helpers/share'
import get from 'lodash-es/get'

export default {
  ...mapGetters(['capabilities']),
  $_declineShare_hasResharing() {
    return get(this.capabilities, 'files_sharing.resharing', true)
  },
  $_declineShare_hasShareJail() {
    return get(this.capabilities, 'spaces.share_jail', false)
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
            if (
              !isLocationSharesActive(this.$router, 'files-shares-with-me') &&
              !isLocationSpacesActive(this.$router, 'files-spaces-share')
            ) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            if (
              isLocationSpacesActive(this.$router, 'files-spaces-share') &&
              (resources.length > 1 || resources[0].path !== '/')
            ) {
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
                this.$_declineShare_hasResharing,
                this.$_declineShare_hasShareJail,
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

        if (isLocationSpacesActive(this.$router, 'files-spaces-share')) {
          this.showMessage({
            title: this.$ngettext(
              'The selected share was declined successfully',
              'The selected shares was declined successfully',
              resources.length
            )
          })
          this.$router.push(createLocationShares('files-shares-with-me'))
        }

        return
      }

      this.showMessage({
        title: this.$ngettext(
          'Failed to decline the selected share',
          'Failed to decline selected shares',
          resources.length
        ),
        status: 'danger'
      })
    }
  }
}
