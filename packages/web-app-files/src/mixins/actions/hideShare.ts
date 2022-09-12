import { triggerShareAction } from '../../helpers/share/triggerShareAction'
import { isLocationSharesActive, isLocationSpacesActive, createLocationShares } from '../../router'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from 'web-client/src/helpers/share'
import get from 'lodash-es/get'

export default {
  ...mapGetters(['capabilities']),
  $_hideShare_hasResharing() {
    return get(this.capabilities, 'files_sharing.resharing', true)
  },
  $_hideShare_hasShareJail() {
    return get(this.capabilities, 'spaces.share_jail', false)
  },
  computed: {
    $_hideShare_items() {
      return [
        {
          name: 'hide-share',
          icon: 'eye-off',
          handler: this.$_hideShare_trigger,
          label: ({ resources }) => this.$ngettext('Hide share', 'Hide shares', resources.length),
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

            const hideDisabled = resources.some((resource) => {
              return resource.status === ShareStatus.declined
            })
            return !hideDisabled
          },
          componentType: 'button',
          class: 'oc-files-actions-hide-share-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE']),
    ...mapActions(['showMessage']),
    ...mapActions('Files', ['resetFileSelection']),
    async $_hideShare_trigger({ resources }) {
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
                this.$_hideShare_hasResharing,
                this.$_hideShare_hasShareJail,
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
              'The selected share was hidden successfully',
              'The selected shares were hidden successfully',
              resources.length
            )
          })
          this.$router.push(createLocationShares('files-shares-with-me'))
        }

        return
      }

      this.showMessage({
        title: this.$ngettext(
          'Failed to hide the selected share',
          'Failed to hide selected shares',
          resources.length
        ),
        status: 'danger'
      })
    }
  }
}
