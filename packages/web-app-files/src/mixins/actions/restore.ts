import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
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
import { urlJoin } from 'web-client/src/utils'

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

    async $_restore_collectConflicts(sortedResources: Resource[]) {
      const existingResourcesCache = {}
      const conflicts: Resource[] = []
      const resolvedResources: Resource[] = []
      const missingFolderPaths: string[] = []
      for (const resource of sortedResources) {
        const parentPath = dirname(resource.path)

        let existingResources: Resource[] = []
        if (parentPath in existingResourcesCache) {
          existingResources = existingResourcesCache[parentPath]
        } else {
          try {
            existingResources = (await this.$clientService.webdav.listFiles(this.space, {
              path: parentPath
            })).children
          } catch (error) {
            missingFolderPaths.push(parentPath)
          }
          existingResourcesCache[parentPath] = existingResources
        }
        // Check for naming conflict in parent folder and between resources batch
        const hasConflict =
          existingResources.some((r) => r.name === resource.name) ||
          resolvedResources
            .filter((r) => r.id !== resource.id)
            .some((r) => r.path === resource.path)
        if (hasConflict) {
          conflicts.push(resource)
        } else {
          resolvedResources.push(resource)
        }
      }
      return {
        existingResourcesByPath: existingResourcesCache,
        conflicts,
        resolvedResources,
        missingFolderPaths: missingFolderPaths.filter(
          (path) => !existingResourcesCache[path]?.length
        )
      }
    },
    async $_restore_collectResolveStrategies(conflicts: Resource[]) {
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
    async $_restore_createFolderStructure(path: string, existingPaths: string[]) {
      const { webdav } = clientService

      const pathSegments = path.split('/').filter(Boolean)
      let parentPath = ''
      for (const subFolder of pathSegments) {
        const folderPath = urlJoin(parentPath, subFolder)
        if (existingPaths.includes(folderPath)) {
          parentPath = urlJoin(parentPath, subFolder)
          continue
        }

        try {
          await webdav.createFolder(this.space, { path: folderPath })
        } catch (ignored) {}

        existingPaths.push(folderPath)
        parentPath = folderPath
      }

      return {
        existingPaths
      }
    },
    async $_restore_restoreResources(resources: Resource[], missingFolderPaths: string[]) {
      const restoredResources = []
      const failedResources = []

      let createdFolderPaths = []
      for (const resource of resources) {
        const parentPath = dirname(resource.path)
        if (missingFolderPaths.includes(parentPath)) {
          const { existingPaths } = await this.$_restore_createFolderStructure(
            parentPath,
            createdFolderPaths
          )
          createdFolderPaths = existingPaths
        }

        try {
          await this.$clientService.webdav.restoreFile(this.space, resource, resource, {
            overwrite: true
          })
          restoredResources.push(resource)
        } catch (e) {
          console.error(e)
          failedResources.push(resource)
        }
      }

      // success handler (for partial and full success)
      if (restoredResources.length) {
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
      if (failedResources.length) {
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

      // Reload quota
      if (this.capabilities?.spaces?.enabled) {
        const accessToken = this.$store.getters['runtime/auth/accessToken']
        const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
        const driveResponse = await graphClient.drives.getDrive(this.space.id)
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

    async $_restore_trigger({ resources }: { resources: Resource[] }) {
      // resources need to be sorted by path ASC to recover the parents first in case of deep nested folder structure
      const sortedResources = resources.sort((a, b) => a.path.length - b.path.length)

      // collect and request existing files in associated parent folders of each resource
      const { existingResourcesByPath, conflicts, resolvedResources, missingFolderPaths } =
        await this.$_restore_collectConflicts(sortedResources)

      // iterate through conflicts and collect resolve strategies
      const resolvedConflicts = await this.$_restore_collectResolveStrategies(conflicts)

      // iterate through conflicts and behave according to strategy
      const filesToOverwrite = resolvedConflicts
        .filter((e) => e.strategy === ResolveStrategy.REPLACE)
        .map((e) => e.resource)
      resolvedResources.push(...filesToOverwrite)
      const filesToKeepBoth = resolvedConflicts
        .filter((e) => e.strategy === ResolveStrategy.KEEP_BOTH)
        .map((e) => e.resource)

      for (let resource of filesToKeepBoth) {
        resource = { ...resource }
        const parentPath = dirname(resource.path)
        const existingResources = existingResourcesByPath[parentPath] || []
        const extension = extractExtensionFromFile(resource)
        const resolvedName = resolveFileNameDuplicate(resource.name, extension, [
          ...existingResources,
          ...resolvedConflicts.map((e) => e.resource),
          ...resolvedResources
        ])
        resource.name = resolvedName
        resource.path = urlJoin(parentPath, resolvedName)
        resolvedResources.push(resource)
      }
      return this.$_restore_restoreResources(resolvedResources, missingFolderPaths)
    }
  }
}
