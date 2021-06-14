<template>
  <main id="files-location-picker" class="uk-flex uk-height-1-1">
    <div tabindex="-1" class="files-list-wrapper uk-width-expand">
      <div id="files-app-bar" class="oc-p-s">
        <h1 class="location-picker-selection-info oc-mb" v-text="title" />
        <p class="oc-text-muted uk-text-meta" v-text="currentHint" />
        <hr class="oc-mt-rm" />
        <oc-breadcrumb :items="breadcrumbs" class="oc-mb-s" />
        <oc-grid gutter="small" flex class="uk-flex-middle">
          <div>
            <oc-button size="small" @click="leaveLocationPicker(originalLocation)">
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
        <list-loader v-if="loading" />
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
          <oc-table-files
            v-else
            id="files-location-picker-table"
            class="files-table"
            :are-previews-displayed="false"
            :resources="activeFiles"
            :disabled="disabledResources"
            :target-route="targetRoute"
            :has-actions="false"
            :is-selectable="false"
            :header-position="headerPosition"
          >
            <template #footer>
              <div
                v-if="activeFilesCount.folders > 0 || activeFilesCount.files > 0"
                class="uk-text-nowrap oc-text-muted uk-text-center uk-width-1-1"
              >
                <span id="files-list-count-folders" v-text="activeFilesCount.folders" />
                <translate :translate-n="activeFilesCount.folders" translate-plural="folders"
                  >folder</translate
                >
                <translate>and</translate>
                <span id="files-list-count-files" v-text="activeFilesCount.files" />
                <translate :translate-n="activeFilesCount.files" translate-plural="files"
                  >file</translate
                >
                <template v-if="activeFiles.length > 0">
                  &ndash; {{ getResourceSize(filesTotalSize) }}
                </template>
              </div>
            </template>
          </oc-table-files>
        </template>
      </div>
    </div>
  </main>
</template>

<script>
import { mapMutations, mapState, mapActions, mapGetters } from 'vuex'
import { basename, join } from 'path'
import { batchActions } from '../helpers/batchActions'
import { cloneStateObject } from '../helpers/store'
import MixinsGeneral from '../mixins'
import MixinResources from '../mixins/resources'
import MixinRoutes from '../mixins/routes'

import NoContentMessage from '../components/NoContentMessage.vue'
import ListLoader from '../components/ListLoader.vue'

export default {
  metaInfo() {
    const title = `${this.title} - ${this.configuration.theme.general.name}`

    return { title }
  },

  components: {
    NoContentMessage,
    ListLoader
  },

  mixins: [MixinsGeneral, MixinResources, MixinRoutes],

  data: () => ({
    headerPosition: 0,
    originalLocation: '',
    loading: true
  }),

  computed: {
    ...mapState('Files', [
      'selectedResourcesForMove',
      'locationPickerTargetFolder',
      'currentFolder'
    ]),
    ...mapGetters('Files', [
      'activeFiles',
      'fileSortField',
      'fileSortDirectionDesc',
      'publicLinkPassword',
      'davProperties',
      'activeFilesCount',
      'filesTotalSize'
    ]),
    ...mapGetters(['configuration']),

    title() {
      const translated =
        this.currentAction === batchActions.move
          ? this.$gettext('Move into »%{ target }«')
          : this.$gettext('Copy into »%{ target }«')
      const target = basename(this.target) || this.$gettext('All files')
      return this.$gettextInterpolate(translated, { target })
    },

    currentAction() {
      return this.$route.params.action
    },

    isPublicContext() {
      return this.$route.params.context === 'public'
    },

    target() {
      return this.$route.params.item
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
      const pathSegments = this.target.split('/').filter(item => item !== '')

      if (this.isPublicContext) {
        const itemPath = encodeURIComponent(join.apply(null, pathSegments.slice(0, 1)))
        breadcrumbs.push(this.createBreadcrumbNode(0, this.$gettext('Public link'), itemPath))
        for (let i = 1; i < pathSegments.length; i++) {
          const itemPath = encodeURIComponent(join.apply(null, pathSegments.slice(0, i + 1)))
          breadcrumbs.push(this.createBreadcrumbNode(i + 1, pathSegments[i], itemPath))
        }
      } else {
        breadcrumbs.push(this.createBreadcrumbNode(0, this.$gettext('All files'), '/'))
        for (let i = 0; i < pathSegments.length; i++) {
          const itemPath = encodeURIComponent(join.apply(null, pathSegments.slice(0, i + 1)))
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
      const resources = cloneStateObject(this.activeFiles)

      return resources
        .filter(resource => resource.type !== 'folder' || this.resources.includes(resource.path))
        .map(resource => resource.id)
    },

    isEmpty() {
      return this.activeFiles.length < 1
    },

    targetRoute() {
      return {
        name: this.$route.name,
        query: {
          resource: this.resources
        },
        params: {
          action: this.currentAction
        }
      }
    },

    currentHint() {
      if (this.currentAction === 'move') {
        return this.$gettext(
          `Navigate into the desired folder and move selected resources into it.
          You can navigate into a folder by clicking on its name.
          To navigate back, you can click on the breadcrumbs.
          Resources will be moved into the folder where you are currently located.`
        )
      }

      return this.$gettext(
        `Navigate into the desired folder and copy selected resources into it.
        You can navigate into a folder by clicking on its name.
        To navigate back, you can click on the breadcrumbs.
        Resources will be copied into the folder where you are currently located.`
      )
    }
  },

  watch: {
    $route: {
      handler: 'navigateToTarget',
      immediate: true
    }
  },

  created() {
    window.onresize = this.adjustTableHeaderPosition
    this.originalLocation = this.target
  },

  mounted() {
    this.adjustTableHeaderPosition()
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
            resource: this.resources
          }
        }
      }
    },

    adjustTableHeaderPosition() {
      this.$nextTick(() => {
        const header = document.querySelector('#files-app-bar')
        this.headerPosition = header.getBoundingClientRect().bottom
      })
    },

    async navigateToTarget(target) {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      if (typeof target === 'object') {
        target = this.target
      }

      const resources = this.isPublicContext
        ? await this.$client.publicFiles.list(target, this.publicLinkPassword, this.davProperties)
        : await this.$client.files.list(target, 1, this.davProperties)

      this.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })
      this.loadIndicators({ client: this.$client, currentFolder: this.$route.params.item || '/' })
      this.adjustTableHeaderPosition()
      this.loading = false
    },

    leaveLocationPicker(target) {
      if (this.isPublicContext) {
        this.$router.push({ name: 'files-public-list', params: { token: target } })
        return
      }

      this.$router.push({ name: 'files-personal', params: { item: target || '/' } })
    },

    isRowDisabled(resource) {
      if (resource.type !== 'folder' || !resource.canCreate()) {
        return true
      }
      return this.resources.some(item => item === resource.path)
    },

    async confirmAction() {
      const errors = []
      let promise = null

      // Execute move or copy
      for (const resource of this.resources) {
        let targetPath = this.target || '/'
        const resourceName = basename(resource)
        targetPath += '/' + resourceName
        const exists = this.activeFiles.some(item => {
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
            promise = this.isPublicContext
              ? this.$client.publicFiles.move(resource, targetPath, this.publicLinkPassword)
              : this.$client.files.move(resource, targetPath)
            break
          }
          case batchActions.copy: {
            promise = this.isPublicContext
              ? this.$client.publicFiles.copy(resource, targetPath, this.publicLinkPassword)
              : this.$client.files.copy(resource, targetPath)
            break
          }
          default:
            return
        }

        await promise.catch(error => {
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
      let desc = ''
      if (errors.length === 1) {
        switch (this.currentAction) {
          case batchActions.move: {
            title = this.$gettext('An error occurred while moving %{resource}')
            break
          }
          case batchActions.copy: {
            title = this.$gettext('An error occurred while copying %{resource}')
            break
          }
          default:
            return
        }

        this.showMessage({
          title: this.$gettextInterpolate(title, { resource: errors[0].resource }, true),
          desc: errors[0].message,
          status: 'danger'
        })

        return
      }

      switch (this.currentAction) {
        case batchActions.move: {
          title = this.$gettext('An error occurred while moving several resources')
          desc = this.$ngettext(
            '%{count} resource could not be moved',
            '%{count} resources could not be moved',
            errors.length
          )
          break
        }
        case batchActions.copy: {
          title = this.$gettext('An error occurred while copying several resources')
          desc = this.$ngettext(
            '%{count} resource could not be copied',
            '%{count} resources could not be copied',
            errors.length
          )
          break
        }
        default:
          return
      }

      this.showMessage({
        title,
        desc: this.$gettextInterpolate(desc, { count: errors.length }, false),
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

#files-app-bar {
  position: sticky;
  top: 0;
  height: auto;
  z-index: 1;
  grid-area: header;
  background-color: var(--oc-color-background-default);
  box-sizing: border-box;
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
