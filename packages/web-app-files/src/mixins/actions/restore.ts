import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import PQueue from 'p-queue'
import { isLocationTrashActive } from '../../router'
import {
  buildWebDavFilesTrashPath,
  buildWebDavFilesPath,
  buildWebDavSpacesTrashPath
} from '../../helpers/resources'
import { clientService } from 'web-pkg/src/services'
import { buildWebDavSpacesPath, isProjectSpaceResource } from 'web-client/src/helpers'

export default {
  computed: {
    ...mapState(['user']),
    ...mapGetters(['configuration', 'capabilities']),

    $_restore_items() {
      return [
        {
          name: 'restore',
          icon: 'arrow-go-back',
          label: () => this.$gettext('Restore'),
          handler: this.$_restore_trigger,
          isEnabled: ({ resources }) => {
            if (!isLocationTrashActive(this.$router, 'files-trash-generic')) {
              return false
            }
            if (!resources.every((r) => r.canBeRestored())) {
              return false
            }

            const { manager, editor } = this.space?.spaceRoles
            const isProjectSpace = isProjectSpaceResource(this.space)
            if (isProjectSpace && ![...manager, ...editor].includes(this.user.uuid)) {
              return false
            }

            return resources.length > 0
          },
          componentType: 'button',
          class: 'oc-files-actions-restore-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files', ['removeFilesFromTrashbin']),
    ...mapActions(['showMessage']),
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),
    ...mapMutations(['SET_QUOTA']),

    async $_restore_trigger({ resources }) {
      const restoredResources = []
      const failedResources = []
      const restorePromises = []
      const restoreQueue = new PQueue({ concurrency: 4 })
      resources.forEach((resource) => {
        const hasShareJail = this.capabilities?.spaces?.share_jail === true
        const path = hasShareJail
          ? buildWebDavSpacesTrashPath(this.space.id)
          : buildWebDavFilesTrashPath(this.user.id)
        const restorePath = hasShareJail
          ? buildWebDavSpacesPath(this.space.id, resource.path)
          : buildWebDavFilesPath(this.user.id, resource.path)

        restorePromises.push(
          restoreQueue.add(async () => {
            try {
              await this.$client.fileTrash.restore(path, resource.id, restorePath)
              restoredResources.push(resource)
            } catch (e) {
              console.error(e)
              failedResources.push(resource)
            }
          })
        )
      })
      await Promise.all(restorePromises)

      // success handler (for partial and full success)
      if (restoredResources.length > 0) {
        this.removeFilesFromTrashbin(restoredResources)
        let translated
        const translateParams: any = {}
        if (restoredResources.length === 1) {
          translated = this.$gettext('%{resource} was restored successfully')
          translateParams.resource = restoredResources[0].name
        } else {
          translated = this.$gettext('%{resourceCount} files restored successfully')
          translateParams.resourceCount = restoredResources.length
        }
        this.showMessage({
          title: this.$gettextInterpolate(translated, translateParams, true)
        })
      }

      // failure handler (for partial and full failure)
      if (failedResources.length > 0) {
        let translated
        const translateParams: any = {}
        if (failedResources.length === 1) {
          translated = this.$gettext('Failed to restore "%{resource}"')
          translateParams.resource = failedResources[0].name
        } else {
          translated = this.$gettext('Failed to restore %{resourceCount} files')
          translateParams.resourceCount = failedResources.length
        }
        this.showMessage({
          title: this.$gettextInterpolate(translated, translateParams, true),
          status: 'danger'
        })
      }

      // Load quota
      if (this.capabilities?.spaces?.enabled) {
        const accessToken = this.$store.getters['runtime/auth/accessToken']
        const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
        const driveId = this.space.id
        const driveResponse = await graphClient.drives.getDrive(driveId)
        this.UPDATE_SPACE_FIELD({
          id: driveResponse.data.id,
          field: 'spaceQuota',
          value: driveResponse.data.quota
        })
      } else {
        const user = await this.$client.users.getUser(this.user.id)
        this.SET_QUOTA(user.quota)
      }
    }
  }
}
