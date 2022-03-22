<template>
  <div class="files-app-bar">
    <oc-hidden-announcer :announcement="selectedResourcesAnnouncement" level="polite" />
    <file-drop
      v-if="canUpload && hasFreeSpace"
      :root-path="currentPath"
      :path="currentPath"
      :headers="headers"
      @success="onFileSuccess"
      @error="onFileError"
      @progress="onFileProgress"
    />
    <div class="files-topbar oc-py-s">
      <h1 class="oc-invisible-sr" v-text="pageTitle" />
      <div class="oc-flex oc-flex-between">
        <oc-breadcrumb
          v-if="breadcrumbs.length"
          id="files-breadcrumb"
          data-testid="files-breadcrumbs"
          class="oc-flex oc-flex-middle"
          context-menu-padding="small"
          :items="breadcrumbs"
        >
          <template #contextMenu>
            <context-actions v-if="showContextActions" :items="contextActionItems" />
          </template>
        </oc-breadcrumb>
        <shares-navigation v-if="isSharesLocation" />
        <view-options v-if="!hideViewOptions" />
      </div>
      <div class="files-app-bar-actions">
        <div
          v-if="showActions || selectedFiles.length > 0 || hasBulkActions"
          class="oc-flex-1 oc-flex oc-flex-start"
          style="gap: 15px"
        >
          <create-and-upload
            v-if="showActions && areDefaultActionsVisible"
            :can-upload="canUpload"
            :current-path="currentPath"
            :has-free-space="hasFreeSpace"
            :headers="headers"
            @success="onFileSuccess"
            @error="onFileError"
            @progress="onFileProgress"
          />
          <size-info v-if="hasBulkActions && selectedFiles.length > 0" class="oc-visible@l" />
          <batch-actions v-if="hasBulkActions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import pathUtil from 'path'

import Mixins from '../../mixins'
import MixinFileActions from '../../mixins/fileActions'
import { buildResource, buildWebDavFilesPath, buildWebDavSpacesPath } from '../../helpers/resources'
import { bus } from 'web-pkg/src/instance'
import { DavProperties } from 'web-pkg/src/constants'
import {
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationTrashActive
} from '../../router'
import { useActiveLocation } from '../../composables'

import BatchActions from './SelectedResources/BatchActions.vue'
import ContextActions from '../FilesList/ContextActions.vue'
import CreateAndUpload from './CreateAndUpload.vue'
import FileDrop from './Upload/FileDrop.vue'
import SharesNavigation from './SharesNavigation.vue'
import SizeInfo from './SelectedResources/SizeInfo.vue'
import ViewOptions from './ViewOptions.vue'
import { useCapabilitySpacesEnabled } from 'web-pkg/src/composables'

export default {
  components: {
    BatchActions,
    ContextActions,
    CreateAndUpload,
    FileDrop,
    SharesNavigation,
    SizeInfo,
    ViewOptions
  },
  mixins: [Mixins, MixinFileActions],
  setup() {
    return {
      hasSpaces: useCapabilitySpacesEnabled(),
      isSharesLocation: useActiveLocation(isLocationSharesActive),
      isPersonalLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-personal-home'),
      isPublicLocation: useActiveLocation(isLocationPublicActive, 'files-public-files'),
      isSpacesProjectsLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-projects'),
      isSpacesProjectLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-project'),
      isTrashPersonalActive: useActiveLocation(isLocationTrashActive, 'files-trash-personal'),
      isTrashSpacesProjectActive: useActiveLocation(
        isLocationTrashActive,
        'files-trash-spaces-project'
      )
    }
  },
  data: () => ({
    newFileAction: null,
    path: '',
    fileFolderCreationLoading: false
  }),
  computed: {
    ...mapGetters([
      'getToken',
      'capabilities',
      'configuration',
      'newFileHandlers',
      'quota',
      'user'
    ]),
    ...mapGetters('Files', ['files', 'currentFolder', 'selectedFiles', 'publicLinkPassword']),
    ...mapState('Files', ['areHiddenFilesShown']),

    showContextActions() {
      if (this.isTrashPersonalActive) {
        return false
      }
      if (this.isSpacesProjectLocation) {
        return this.currentFolder && this.breadcrumbs.length > 2
      }

      return this.currentFolder && this.breadcrumbs.length > 1
    },
    contextActionItems() {
      if (this.isTrashSpacesProjectActive) {
        return []
      }
      return [this.currentFolder]
    },
    currentPath() {
      const path = this.$route.params.item || ''
      if (path.endsWith('/')) {
        return path
      }
      return path + '/'
    },
    headers() {
      if (this.publicPage()) {
        const password = this.publicLinkPassword

        if (password) {
          return { Authorization: 'Basic ' + Buffer.from('public:' + password).toString('base64') }
        }

        return {}
      }
      return {
        Authorization: 'Bearer ' + this.getToken
      }
    },
    canUpload() {
      if (!this.currentFolder) {
        return false
      }
      return this.currentFolder.canUpload({ user: this.user })
    },
    showActions() {
      return this.$route.meta.hideFilelistActions !== true
    },
    hasBulkActions() {
      return this.$route.meta.hasBulkActions === true
    },
    hideViewOptions() {
      return this.$route.meta.hideViewOptions === true
    },
    pageTitle() {
      const title = this.$route.meta.title
      return this.$gettext(title)
    },

    breadcrumbs: function () {
      if (
        !(
          this.isPublicLocation ||
          this.isPersonalLocation ||
          this.isSpacesProjectsLocation ||
          this.isSpacesProjectLocation ||
          this.isTrashPersonalActive ||
          this.isTrashSpacesProjectActive
        )
      ) {
        return []
      }

      const personalRouteName = this.hasSpaces
        ? this.$gettext('Personal')
        : this.$gettext('All files')

      if (this.isTrashPersonalActive) {
        return [
          {
            text: this.$gettext('Deleted files'),
            to: '/files/trash'
          },
          {
            text: personalRouteName,
            onClick: () => bus.publish('app.files.list.load')
          }
        ]
      }

      if (this.isTrashSpacesProjectActive) {
        return [
          {
            text: this.$gettext('Deleted files'),
            to: '/files/trash'
          },
          {
            text: this.$route.params.storageId,
            onClick: () => bus.publish('app.files.list.load')
          }
        ]
      }

      const { params: routeParams, path: routePath } = this.$route
      const requestedItemPath = routeParams.item || ''
      const basePaths =
        '/' +
        decodeURIComponent(routePath)
          .replace(requestedItemPath, '')
          .split('/')
          .filter(Boolean)
          .join('/')

      return [basePaths, ...requestedItemPath.split('/').filter(Boolean)].reduce(
        (acc, rawItem, i, rawItems) => {
          const to = [(acc[i - 1] || {}).to, rawItem].filter(Boolean).join('/')
          acc.push({
            text: rawItem,
            onClick: () => bus.publish('app.files.list.load', to.replace(basePaths, '') || '/'),
            to
          })

          if (i === rawItems.length - 1) {
            this.isPublicLocation && acc.shift()

            if (acc.length) {
              if (this.isPersonalLocation) {
                acc[0].text = personalRouteName
                acc[0].to = acc[0].to + '/'
              } else if (this.isSpacesProjectLocation || this.isSpacesProjectsLocation) {
                acc[0] = {
                  text: this.$gettext('Spaces'),
                  to: '/files/spaces/projects'
                }
                if (this.$route.params.storageId) {
                  acc.splice(1, 0, {
                    text: this.$route.params.storageId,
                    to: `/files/spaces/projects/${this.$route.params.storageId}`
                  })
                }
              } else {
                acc[0].text = this.$gettext('Public link')
              }
            }
            acc.length && delete acc[acc.length - 1].to
          } else {
            delete acc[i].onClick
          }

          return acc
        },
        []
      )
    },

    hasFreeSpace() {
      return (
        !this.quota ||
        this.quota.free > 0 ||
        (this.currentFolder &&
          this.currentFolder.permissions &&
          this.currentFolder.permissions.indexOf('M') >= 0) ||
        this.publicPage()
      )
    },

    areDefaultActionsVisible() {
      return this.selectedFiles.length < 1
    },

    selectedResourcesAnnouncement() {
      if (this.selectedFiles.length === 0) {
        return this.$gettext('No items selected.')
      }
      const translated = this.$ngettext(
        '%{ amount } item selected. Actions are available above the table.',
        '%{ amount } items selected. Actions are available above the table.',
        this.selectedFiles.length
      )
      return this.$gettextInterpolate(translated, { amount: this.selectedFiles.length })
    }
  },

  created() {
    // Storage returns a string so we need to convert it into a boolean
    const areHiddenFilesShown = window.localStorage.getItem('oc_hiddenFilesShown') || 'false'
    const areHiddenFilesShownBoolean = areHiddenFilesShown === 'true'

    if (areHiddenFilesShownBoolean !== this.areHiddenFilesShown) {
      this.SET_HIDDEN_FILES_VISIBILITY(areHiddenFilesShownBoolean)
    }
  },

  methods: {
    ...mapActions('Files', ['updateFileProgress', 'removeFilesFromTrashbin', 'loadIndicators']),
    ...mapActions(['openFile', 'showMessage']),
    ...mapMutations('Files', ['UPSERT_RESOURCE', 'SET_HIDDEN_FILES_VISIBILITY']),
    ...mapMutations(['SET_QUOTA']),

    async onFileSuccess(event, file) {
      try {
        if (file.name) {
          file = file.name
        }

        await this.$nextTick()

        let path = pathUtil.join(this.currentPath, file)
        let resource

        if (this.isPersonalLocation) {
          path = buildWebDavFilesPath(this.user.id, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesProjectLocation) {
          path = buildWebDavSpacesPath(this.$route.params.storageId, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else {
          resource = await this.$client.publicFiles.getFileInfo(
            path,
            this.publicLinkPassword,
            DavProperties.PublicLink
          )
        }

        resource = buildResource(resource)

        this.UPSERT_RESOURCE(resource)

        if (this.isPersonalLocation) {
          this.loadIndicators({
            client: this.$client,
            currentFolder: this.currentFolder.path,
            encodePath: this.encodePath
          })
        }

        const user = await this.$client.users.getUser(this.user.id)

        this.SET_QUOTA(user.quota)
      } catch (error) {
        console.error(error)
      }
    },

    onFileError(error) {
      console.error(error)
      this.showMessage({
        title: this.$gettext('Failed to upload'),
        status: 'danger'
      })
    },

    onFileProgress(progress) {
      this.updateFileProgress(progress)
    }
  }
}
</script>

<style lang="scss" scoped>
.files-app-bar {
  background-color: var(--oc-color-background-default);
  box-sizing: border-box;
  z-index: 2;
  padding: 0 var(--oc-space-medium);
  border-top-right-radius: 15px;

  &-actions {
    align-items: center;
    display: flex;
    gap: var(--oc-space-small);
    justify-content: flex-end;
    min-height: 3rem;
  }

  #files-breadcrumb {
    min-height: 2rem;
  }
}
</style>
