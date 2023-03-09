import { triggerShareAction } from '../../helpers/share/triggerShareAction'

import { mapActions, mapGetters, mapMutations } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from 'web-client/src/helpers/share'
import { isLocationSharesActive, isLocationSpacesActive } from '../../router'
import get from 'lodash-es/get'

export default {
  computed: {
    ...mapGetters(['capabilities']),
    $_acceptShare_hasResharing() {
      return get(this.capabilities, 'files_sharing.resharing', true)
    },
    $_acceptShare_hasShareJail() {
      return get(this.capabilities, 'spaces.share_jail', false)
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
            if (
              !isLocationSharesActive(this.$router, 'files-shares-with-me') &&
              !isLocationSpacesActive(this.$router, 'files-spaces-generic')
            ) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            if (
              isLocationSpacesActive(this.$router, 'files-spaces-generic') &&
              (this.space?.driveType !== 'share' ||
                resources.length > 1 ||
                resources[0].path !== '/')
            ) {
              return false
            }

            const acceptDisabled = resources.some((resource) => {
              return resource.status !== ShareStatus.declined
            })
            return !acceptDisabled
          },
          componentType: 'button',
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
                this.$_acceptShare_hasResharing,
                this.$_acceptShare_hasShareJail,
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

        if (isLocationSpacesActive(this.$router, 'files-spaces-generic')) {
          this.showMessage({
            title: this.$ngettext(
              'The selected share was accepted successfully',
              'The selected shares were accepted successfully',
              resources.length
            )
          })
        }

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
