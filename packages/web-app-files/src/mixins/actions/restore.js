import { mapActions, mapState } from 'vuex'
import PQueue from 'p-queue'
import { isLocationTrashActive, isLocationCommonActive } from '../../router'
import {
  buildWebDavFilesTrashPath,
  buildWebDavFilesPath,
  buildWebDavSpacesTrashPath,
  buildWebDavSpacesPath
} from '../../helpers/resources'

export default {
  computed: {
    ...mapState(['user']),

    $_restore_items() {
      return [
        {
          name: 'restore',
          icon: 'arrow-go-back',
          label: () => this.$gettext('Restore'),
          handler: this.$_restore_trigger,
          isEnabled: ({ resources }) => {
            if (
              !isLocationTrashActive(this.$router, 'files-trash-personal') &&
              !isLocationTrashActive(this.$router, 'files-trash-spaces-project') &&
              !isLocationCommonActive(this.$router, 'files-common-projects-trash')
            ) {
              return false
            }
            if (!resources.every((r) => r.canBeRestored())) {
              return false
            }

            return resources.length > 0
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-restore-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files', ['removeFilesFromTrashbin']),
    ...mapActions(['showMessage']),

    async $_restore_trigger({ resources }) {
      const restoredResources = []
      const failedResources = []
      const restorePromises = []
      const restoreQueue = new PQueue({ concurrency: 4 })

      const project = this.$route.query.project
      const query = project ? { base_path: project } : undefined

      resources.forEach((resource) => {
        const path = isLocationTrashActive(this.$router, 'files-trash-spaces-project')
          ? buildWebDavSpacesTrashPath(this.$route.params.storageId)
          : buildWebDavFilesTrashPath(this.user.id)
        const restorePath = isLocationTrashActive(this.$router, 'files-trash-spaces-project')
          ? buildWebDavSpacesPath(this.$route.params.storageId, resource.path)
          : buildWebDavFilesPath(this.user.id, resource.path)

        restorePromises.push(
          restoreQueue.add(async () => {
            try {
              await this.$client.fileTrash.restore(path, resource.id, restorePath, query)
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
        const translateParams = {}
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
        const translateParams = {}
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
    }
  }
}
