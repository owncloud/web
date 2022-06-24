<template>
  <main id="files-location-picker" class="oc-flex oc-height-1-1">
    <div tabindex="-1" class="files-list-wrapper oc-width-expand">
      <div id="files-location-picker-app-bar" class="oc-p-s">
        <h1 class="location-picker-selection-info oc-mb" v-text="title" />
        <p
          class="oc-text-muted oc-text-meta"
          data-testid="location-picker-current-hint"
          v-text="currentHint"
        />
        <hr class="oc-mt-rm" />
        <oc-breadcrumb :items="breadcrumbs" class="oc-mb-s" />
        <oc-grid gutter="small" flex class="oc-flex-middle">
          <div>
            <oc-button
              id="location-picker-btn-cancel"
              size="small"
              @click="leaveLocationPicker(originalLocation)"
            >
              <translate>Cancel</translate>
            </oc-button>
          </div>
          <div>
            <oc-button
              id="location-picker-btn-confirm"
              variation="primary"
              appearance="filled"
              size="small"
              :disabled="!canConfirm"
              @click="confirmAction"
            >
              <span v-text="confirmBtnText" />
            </oc-button>
          </div>
        </oc-grid>
      </div>
      <div id="files-view">
        <app-loading-spinner v-if="loadResourcesTask.isRunning" />
        <template v-else>
          <no-content-message
            v-if="isEmpty"
            id="files-location-picker-empty"
            class="files-empty"
            icon="folder"
          >
            <template #message>
              <span v-translate>There are no resources in this folder.</span>
            </template>
          </no-content-message>
          <resource-table
            v-else
            id="files-location-picker-table"
            class="files-table"
            :are-thumbnails-displayed="false"
            :resources="paginatedResources"
            :disabled="disabledResources"
            :target-route="targetRoute"
            :has-actions="false"
            :is-selectable="false"
            :header-position="fileListHeaderY"
            :sort-by="sortBy"
            :sort-dir="sortDir"
            @sort="handleSort"
          >
            <template #footer>
              <pagination :pages="paginationPages" :current-page="paginationPage" />
              <list-info
                v-if="paginatedResources.length > 0"
                class="oc-width-1-1 oc-my-s"
                :files="totalFilesCount.files"
                :folders="totalFilesCount.folders"
                :size="totalFilesSize"
              />
            </template>
          </resource-table>
        </template>
      </div>
    </div>
  </main>
</template>

<script>
import { mapMutations, mapState, mapActions, mapGetters } from 'vuex'

import { basename, join } from 'path'
import ResourceTable from '../components/FilesList/ResourceTable.vue'
import { batchActions } from '../helpers/batchActions'
import { cloneStateObject } from '../helpers/store'
import MixinsGeneral from '../mixins'
import MixinFilesListFilter from '../mixins/filesListFilter'
import { useTask } from 'vue-concurrency'

import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import { DavProperties } from 'web-pkg/src/constants'
import { createLocationPublic, createLocationSpaces } from '../router'
import { buildWebDavFilesPath, buildWebDavSpacesPath } from '../helpers/resources'
import { useResourcesViewDefaults } from '../composables'
import {
  useCapabilityShareJailEnabled,
  usePublicLinkPassword,
  useStore
} from 'web-pkg/src/composables'
import { unref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'

export default {
  metaInfo() {
    const title = `${this.title} - ${this.configuration.currentTheme.general.name}`

    return { title }
  },

  components: {
    ResourceTable,
    NoContentMessage,
    AppLoadingSpinner,
    ListInfo,
    Pagination
  },

  mixins: [MixinsGeneral, MixinFilesListFilter],

  setup() {
    const store = useStore()
    const hasShareJail = useCapabilityShareJailEnabled()
    const loadResourcesTask = useTask(function* (signal, ref, target) {
      ref.CLEAR_CURRENT_FILES_LIST()

      if (typeof target === 'object') {
        target = ref.target
      }

      const { context } = ref.$route.params

      let resources
      let webDavPath
      switch (context) {
        case 'public':
          resources = yield ref.$client.publicFiles.list(
            target,
            ref.publicLinkPassword,
            DavProperties.Default
          )
          break
        case 'space':
          resources = yield ref.$client.files.list(
            buildWebDavSpacesPath(ref.$route.query.storageId, target),
            1,
            DavProperties.Default
          )
          break
        default:
          if (unref(hasShareJail)) {
            const graphClient = clientService.graphAuthenticated(
              ref.$store.getters.configuration.server,
              ref.$store.getters.getToken
            )
            const userResponse = yield graphClient.users.getMe()
            if (!userResponse.data) {
              throw new Error('graph.user.getMe() has no data')
            }

            webDavPath = buildWebDavSpacesPath(userResponse.data.id, target)
          } else {
            webDavPath = buildWebDavFilesPath(ref.user.id, target)
          }
          resources = yield ref.$client.files.list(webDavPath, 1, DavProperties.Default)
      }

      ref.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })
      ref.loadIndicators({
        client: ref.$client,
        currentFolder: ref.$route.params.item || '/'
      })
      ref.refreshFileListHeaderPosition()
    }).restartable()

    return {
      ...useResourcesViewDefaults({ loadResourcesTask }),
      hasShareJail,
      publicLinkPassword: usePublicLinkPassword({ store })
    }
  },

  data: () => ({
    originalLocation: ''
  }),

  computed: {
    ...mapState('Files', [
      'selectedResourcesForMove',
      'locationPickerTargetFolder',
      'currentFolder'
    ]),
    ...mapGetters('Files', ['totalFilesCount', 'totalFilesSize']),
    ...mapGetters(['configuration']),
    ...mapGetters(['homeFolder']),
    ...mapState(['user']),

    title() {
      const personalRouteTitle = this.hasShareJail
        ? this.$gettext('Personal')
        : this.$gettext('All files')
      const target =
        basename(this.target) || personalRouteTitle
          ? this.$gettext('Personal')
          : this.$gettext('All files')
      const translated =
        this.currentAction === batchActions.move
          ? this.$gettext('Move into »%{ target }«')
          : this.$gettext('Copy into »%{ target }«')
      return this.$gettextInterpolate(translated, { target })
    },

    currentAction() {
      return this.$route.params.action
    },

    isPublicContext() {
      return this.$route.params.context === 'public'
    },

    target() {
      return this.$route.params.item || this.homeFolder
    },

    resources() {
      const resources = cloneStateObject(this.$route.query.resource)

      // In case there is only one resource, ensure that the return will still be an array
      if (typeof resources === 'string') {
        return [resources]
      }

      return resources
    },

    resourcesCount() {
      return this.resources.length
    },

    breadcrumbs() {
      const breadcrumbs = []
      const pathSegments = this.target.split('/').filter((item) => item !== '')

      if (this.isPublicContext) {
        const itemPath = join.apply(null, pathSegments.slice(0, 1))
        breadcrumbs.push(this.createBreadcrumbNode(0, this.$gettext('Public link'), itemPath))
        for (let i = 1; i < pathSegments.length; i++) {
          const itemPath = join.apply(null, pathSegments.slice(0, i + 1))
          breadcrumbs.push(this.createBreadcrumbNode(i + 1, pathSegments[i], itemPath))
        }
      } else {
        const personalRouteTitle = this.hasShareJail
          ? this.$gettext('Personal')
          : this.$gettext('All files')
        breadcrumbs.push(this.createBreadcrumbNode(0, personalRouteTitle, '/'))
        for (let i = 0; i < pathSegments.length; i++) {
          const itemPath = join.apply(null, pathSegments.slice(0, i + 1))
          breadcrumbs.push(this.createBreadcrumbNode(i + 1, pathSegments[i], itemPath))
        }
      }

      // the very last breadcrumb node is not supposed to be clickable
      delete breadcrumbs[breadcrumbs.length - 1].to

      return breadcrumbs
    },

    canConfirm() {
      return this.currentFolder && this.currentFolder.canCreate()
    },

    confirmBtnText() {
      switch (this.currentAction) {
        case batchActions.move:
          return this.$pgettext('Confirm action in the location picker for move', 'Move here')
        case batchActions.copy:
          return this.$pgettext('Confirm action in the location picker for copy', 'Paste here')
        default:
          return this.$gettext('Confirm')
      }
    },

    disabledResources() {
      const resources = cloneStateObject(this.paginatedResources)

      return resources
        .filter((resource) => resource.type !== 'folder' || this.resources.includes(resource.path))
        .map((resource) => resource.id)
    },

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    targetRoute() {
      const route = {
        name: this.$route.name,
        query: {
          resource: this.resources
        },
        params: {
          action: this.currentAction
        }
      }

      if (this.$route.query.storageId) {
        route.query.storageId = this.$route.query.storageId
      }

      return route
    },

    currentHint() {
      if (this.currentAction === 'move') {
        return this.$gettext(
          'Navigate to the desired destination to move the selected files and folders to. The selected files and folders will be moved into the folder where you are currently located.'
        )
      }

      return this.$gettext(
        'Navigate to the desired destination to copy the selected files and folders to. The selected files and folders will be copied into the folder where you are currently located.'
      )
    }
  },

  watch: {
    $route: {
      handler: function (to, from) {
        const sameRoute = to.name === from?.name
        const sameItem = to.params?.item === from?.params?.item
        if (!sameRoute || !sameItem) {
          this.loadResourcesTask.perform(this, this.$route)
        }
      },
      immediate: true
    }
  },

  created() {
    this.originalLocation = this.target
  },

  methods: {
    ...mapMutations('Files', ['CLEAR_CURRENT_FILES_LIST']),
    ...mapActions('Files', ['loadFiles', 'loadIndicators']),
    ...mapActions(['showMessage']),

    createBreadcrumbNode(index, text, itemPath) {
      return {
        index,
        text,
        to: {
          name: this.$route.name,
          params: {
            action: this.currentAction,
            item: itemPath
          },
          query: {
            resource: this.resources,
            ...(this.$route.query.storageId && { storageId: this.$route.query.storageId })
          }
        }
      }
    },

    leaveLocationPicker(target) {
      switch (this.$route.params.context) {
        case 'public':
          return this.$router.push(
            createLocationPublic('files-public-files', { params: { item: target } })
          )
        case 'space':
          return this.$router.push(
            createLocationSpaces('files-spaces-project', {
              params: { storageId: this.$route.query.storageId, item: target || '/' }
            })
          )
        case 'personal':
          return this.$router.push(
            createLocationSpaces('files-spaces-personal', {
              params: { storageId: this.$route.query.storageId, item: target || '/' }
            })
          )
        default:
          return this.$router.push(
            createLocationSpaces('files-spaces-personal', {
              params: { storageId: this.$store.getters.user.id }
            })
          )
      }
    },

    isRowDisabled(resource) {
      if (resource.type !== 'folder' || !resource.canCreate()) {
        return true
      }
      return this.resources.some((item) => item === resource.path)
    },

    async confirmAction() {
      const errors = []
      let promise = null

      // Execute move or copy
      for (const resource of this.resources) {
        let targetPath
        let resourceName = basename(resource)
        const exists = this.paginatedResources.some((item) => {
          return basename(item.name) === resourceName
        })
        if (exists) {
          const message = this.$gettext('Resource with name %{name} already exists')
          errors.push({
            resource: resourceName,
            message: this.$gettextInterpolate(message, { name: resourceName }, true)
          })
          continue
        }

        switch (this.currentAction) {
          case batchActions.move: {
            switch (this.$route.params.context) {
              case 'public':
                targetPath = `${this.target || '/'}`
                targetPath += `/${resourceName}`
                promise = this.$client.publicFiles.move(
                  resource,
                  targetPath,
                  this.publicLinkPassword
                )
                break
              case 'space':
                targetPath = buildWebDavSpacesPath(this.$route.query.storageId, this.target || '/')
                targetPath += `/${resourceName}`
                promise = this.$client.files.move(
                  buildWebDavSpacesPath(this.$route.query.storageId, resource),
                  targetPath
                )
                break
              case 'personal':
              default:
                if (this.hasShareJail) {
                  targetPath = buildWebDavSpacesPath(
                    this.$route.query.storageId,
                    this.target || '/'
                  )
                  targetPath += `/${resourceName}`
                  promise = this.$client.files.move(
                    buildWebDavSpacesPath(this.$route.query.storageId, resource),
                    targetPath
                  )
                } else {
                  targetPath = buildWebDavFilesPath(this.user.id, this.target || '/')
                  targetPath += `/${resourceName}`
                  promise = this.$client.files.move(
                    buildWebDavFilesPath(this.user.id, resource),
                    targetPath
                  )
                }
            }
            break
          }
          case batchActions.copy: {
            switch (this.$route.params.context) {
              case 'public':
                targetPath = `${this.target || '/'}`
                targetPath += `/${resourceName}`

                promise = this.$client.publicFiles.copy(
                  resource,
                  targetPath,
                  this.publicLinkPassword
                )
                break
              case 'space':
                targetPath = buildWebDavSpacesPath(this.$route.query.storageId, this.target || '/')
                resourceName = basename(resource)
                targetPath += `/${resourceName}`
                promise = this.$client.files.copy(
                  buildWebDavSpacesPath(this.$route.query.storageId, resource),
                  targetPath
                )
                break
              case 'personal':
              default:
                if (this.hasShareJail) {
                  targetPath = buildWebDavSpacesPath(
                    this.$route.query.storageId,
                    this.target || '/'
                  )
                  resourceName = basename(resource)
                  targetPath += `/${resourceName}`
                  promise = this.$client.files.copy(
                    buildWebDavSpacesPath(this.$route.query.storageId, resource),
                    targetPath
                  )
                } else {
                  targetPath = buildWebDavFilesPath(this.user.id, this.target || '/')
                  targetPath += `/${resourceName}`
                  promise = this.$client.files.copy(
                    buildWebDavFilesPath(this.user.id, resource),
                    targetPath
                  )
                }
            }
            break
          }
          default:
            return
        }

        await promise.catch((error) => {
          error.resource = resourceName
          errors.push(error)
        })
      }

      // Leave location picker if everything was successful
      if (errors.length === 0) {
        this.leaveLocationPicker(this.target)
        return
      }

      // Display error messages
      let title = ''
      if (errors.length === 1) {
        switch (this.currentAction) {
          case batchActions.move: {
            title = this.$gettext('Failed to move "%{resourceName}"')
            break
          }
          case batchActions.copy: {
            title = this.$gettext('Failed to copy "%{resourceName}"')
            break
          }
          default:
            return
        }

        this.showMessage({
          title: this.$gettextInterpolate(title, { resourceName: errors[0].resource }, true),
          status: 'danger'
        })

        return
      }

      switch (this.currentAction) {
        case batchActions.move: {
          title = this.$gettext('Failed to move %{count} resources')
          break
        }
        case batchActions.copy: {
          title = this.$gettext('Failed to copy %{count} resources')
          break
        }
        default:
          return
      }

      this.showMessage({
        title: this.$gettextInterpolate(title, { count: errors.length }),
        status: 'danger'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#files-location-picker {
  height: 100%;
  max-height: 100%;
  overflow-y: hidden;

  &-app-bar {
    position: sticky;
    top: 0;
    height: auto;
    z-index: 1;
    grid-area: header;
    background-color: var(--oc-color-background-default);
    box-sizing: border-box;
  }
}

.files-list-wrapper {
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: max-content 1fr;
  gap: 0 0;
  grid-template-areas:
    'header'
    'main';

  &:focus {
    outline: none;
  }
}

#files-view {
  grid-area: main;
}

#files-location-picker-table ::deep tr {
  td:first-of-type {
    padding-left: 30px;
  }
}
</style>
