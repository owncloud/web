import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import PQueue from 'p-queue'
import { dirname } from 'path'
import { isLocationTrashActive } from '../../router'

import { clientService } from 'web-pkg/src/services'
import { Resource, isProjectSpaceResource, extractExtensionFromFile } from 'web-client/src/helpers'
import {
  ResolveStrategy,
  ResolveConflict,
  resolveFileNameDuplicate,
  ConflictDialog
} from '../../helpers/resource/'

export default {
  computed: {
    ...mapState(['user']),
    ...mapState('runtime/spaces', ['spaces']),
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

            if (
              isProjectSpaceResource(this.space) &&
              !this.space.isEditor(this.user.uuid) &&
              !this.space.isManager(this.user.uuid)
            ) {
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

    async collectRestoreConflicts(resources) {
      const parentFolders = {}
      const conflicts = []
      const resolvedResources = []
      for (const resource of resources) {
        const parentPath = dirname(resource.path)

        // check if parent folder has already been requested
        let parentResources = []
        if (parentPath in parentFolders) {
          parentResources = parentFolders[parentPath]
        } else {
          try {
            parentResources = await this.$clientService.webdav.listFiles(this.space, {
              path: parentPath
            })
          } catch (error) {
            await this.restoreFolderStructure(resource)
          }
          const resourceParentPath = dirname(resource.path)
          parentResources = parentResources.filter((e) => dirname(e.path) === resourceParentPath)
          parentFolders[parentPath] = parentResources
        }
        // Check for naming conflict in parent folder and between resources batch
        const hasConflict =
          parentResources.some((e) => e.name === resource.name) ||
          resources.filter((e) => e.id !== resource.id).some((e) => e.path === resource.path)
        if (!hasConflict) {
          resolvedResources.push(resource)
        } else {
          conflicts.push(resource)
        }
      }
      return {
        parentFolders,
        conflicts,
        resolvedResources
      }
    },
    async collectRestoreResolveStrategies(conflicts) {
      let count = 0
      const resolvedConflicts = []
      const allConflictsCount = conflicts.length
      let doForAllConflicts = false
      let allConflictsStrategy
      for (const conflict of conflicts) {
        const isFolder = conflict.type === 'folder'
        if (doForAllConflicts) {
          resolvedConflicts.push({
            resource: conflict,
            strategy: allConflictsStrategy
          })
          continue
        }
        const remainingConflictCount = allConflictsCount - count
        const conflictDialog = new ConflictDialog(
          this.createModal,
          this.hideModal,
          this.showMessage,
          this.$gettext,
          this.$ngettext,
          this.$gettextInterpolate
        )
        const resolvedConflict: ResolveConflict = await conflictDialog.resolveFileExists(
          { name: conflict.name, isFolder } as Resource,
          remainingConflictCount,
          remainingConflictCount <= 1,
          false
        )
        count++
        if (resolvedConflict.doForAllConflicts) {
          doForAllConflicts = true
          allConflictsStrategy = resolvedConflict.strategy
        }
        resolvedConflicts.push({
          resource: conflict,
          strategy: resolvedConflict.strategy
        })
      }
      return resolvedConflicts
    },
    async restoreFolderStructure(resource) {
      const { webdav } = clientService
      const createdFolders = []
      const directory = dirname(resource.path)

      const folders = directory.split('/')
      let createdSubFolders = ''
      for (const subFolder of folders) {
        if (!subFolder) {
          continue
        }

        const folderToCreate = `${createdSubFolders}/${subFolder}`
        if (createdFolders.includes(folderToCreate)) {
          createdSubFolders += `/${subFolder}`
          createdFolders.push(createdSubFolders)
          continue
        }

        try {
          await webdav.createFolder(this.space, { path: folderToCreate })
        } catch (error) {
          console.error(error)
        }

        createdSubFolders += `/${subFolder}`
        createdFolders.push(createdSubFolders)
      }
    },
    async restoreResources(resources, filesToOverwrite) {
      const restoredResources = []
      const failedResources = []
      const restorePromises = []
      const restoreQueue = new PQueue({ concurrency: 4 })
      resources.forEach((resource) => {
        const overwrite = filesToOverwrite.includes(resource)

        restorePromises.push(
          restoreQueue.add(async () => {
            try {
              const hasShareJail = this.capabilities?.spaces?.share_jail === true
              await this.$clientService.webdav.restoreFile(
                this.space,
                this.user.id,
                hasShareJail,
                resource.id,
                resource.path,
                { overwrite }
              )
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
    },

    async $_restore_trigger({ resources }) {
      // collect and request existing files in associated parent folders of each resource
      const { parentFolders, conflicts, resolvedResources } = await this.collectRestoreConflicts(
        resources
      )

      // iterate through conflicts and collect resolve strategies
      const resolvedConflicts = await this.collectRestoreResolveStrategies(conflicts)

      // iterate through conflicts and behave according to strategy
      const filesToOverwrite = resolvedConflicts
        .filter((e) => e.strategy === ResolveStrategy.REPLACE)
        .map((e) => e.resource)
      resolvedResources.push(...filesToOverwrite)
      const filesToKeepBoth = resolvedConflicts

        .filter((e) => e.strategy === ResolveStrategy.KEEP_BOTH)
        .map((e) => e.resource)

      for (let resource of filesToKeepBoth) {
        debugger
        resource = { ...resource }
        const parentPath = dirname(resource.path)
        const parentResources = parentFolders[parentPath] || []
        const extension = extractExtensionFromFile({ name: resource.name } as Resource)
        const resolvedName = resolveFileNameDuplicate(resource.name, extension, [
          ...parentResources,
          ...resolvedConflicts.map((e) => e.resource),
          ...resolvedResources
        ])
        resource.name = resolvedName
        resource.path = `${parentPath}${resolvedName}`
        resolvedResources.push(resource)
      }
      this.restoreResources(resolvedResources, filesToOverwrite)
    }
  }
}
