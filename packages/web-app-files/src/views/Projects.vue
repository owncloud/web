<template>
  <div class="oc-flex oc-flex-column">
    <app-bar :has-bulk-actions="true">
      <template #actions>
        <template v-if="!isLightweight">
          <oc-button
            id="new-project-menu-btn"
            key="new-project-menu-btn-enabled"
            :aria-label="newButtonAriaLabel"
            variation="primary"
            appearance="filled"
            class="oc-background-primary-gradient"
            style="white-space: nowrap"
            @click="onNewProjectButtonClick"
          >
            <oc-icon name="add" />
            <translate>New Project</translate>
          </oc-button>
        </template>
      </template>
    </app-bar>
    <app-loading-spinner v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="!hasProjects"
        id="files-shared-with-me-shares-empty"
        class="files-empty oc-flex-stretch"
        icon="group"
      >
        <template #message>
          <span>{{ sharesEmptyMessage }}</span>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-shared-with-me-shares-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-thumbnails-displayed="displayThumbnails"
        :resources="activeFiles"
        :are-resources-clickable="true"
        :target-route="resourceTargetLocation"
        :header-position="fileListHeaderY"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
        @sort="handleSort"
      >
        <template #contextMenu="{ resource }">
          <context-actions v-if="isResourceInSharesSelection(resource)" :items="selected" />
        </template>
      </resource-table>
    </template>
  </div>
</template>

<script lang="ts">
import AppBar from '../components/AppBar/AppBar.vue'
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import ResourceTable from '../components/FilesList/ResourceTable.vue'
import { determineSortFields } from '../helpers/ui/resourceTable'
import { aggregateResourceShares } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import { useFileListHeaderPosition, useSort } from '../composables'
import {
  useStore,
  useCapabilityFilesSharingResharing,
  useCapabilityShareJailEnabled
} from 'web-pkg/src/composables'
import debounce from 'lodash-es/debounce'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { useTask } from 'vue-concurrency'
import { ShareStatus } from '../helpers/share'
import { computed, unref } from '@vue/composition-api'
import { createLocationSpaces } from '../router'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    AppBar,
    ResourceTable,
    NoContentMessage,
    AppLoadingSpinner,
    ContextActions
  },

  mixins: [FileActions, MixinMountSideBar, MixinFilesListFilter],

  setup() {
    const store = useStore()
    const { y: fileListHeaderY } = useFileListHeaderPosition()

    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + ref.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')
      const response = yield fetch('api/v0/projects', {
        method: 'GET',
        headers
      })
      if (!response.ok) {
        const message = `An error has occured: ${response.status}`
        throw new Error(message)
      }
      const data = yield response.json()

      // const data = {
      //   projects: [
      //     {
      //       name: 'cboxmacwin',
      //       path: '/eos/project/c/cboxmacwin',
      //       permissions: 'admin'
      //     },
      //     {
      //       name: 'cern-organization',
      //       path: '/eos/project/c/cern-organization',
      //       permissions: 'admin'
      //     }
      //   ]
      // }

      const recievedResources = []
      if (data && data.projects) {
        data.projects.forEach((p, i) => {
          recievedResources.push({
            id: i + p.name,
            type: 'dir',

            uid_owner: 'einstein',
            displayname_owner: 'Albert Einstein',
            additional_info_owner: 'einstein@example.org',
            stime: 1649346512,
            parent: '',
            expiration: '',
            token: '',
            uid_file_owner: 'einstein',
            displayname_file_owner: 'Albert Einstein',
            additional_info_file_owner: 'einstein@example.org',
            state: 2,
            path: '/eos/project/' + p.name.charAt(0) + '/' + p.name,
            item_type: 'folder',
            mimetype: 'httpd/unix-directory',
            storage_id: 'shared::/Shares/a',
            storage: 0,
            item_source: i + p.name,
            file_source: i + p.name,
            file_parent: '',
            file_target: '/eos/project/' + p.name.charAt(0) + '/' + p.name,
            share_with: 'admin',
            share_with_displayname: 'Admin',
            share_with_additional_info: 'admin@example.org',
            mail_send: 0,
            name: '/' + p.name.charAt(0) + '/' + p.name,
            sharedWith: [
              {
                username: 'admin',
                displayName: 'Admin',
                name: 'Admin',
                shareType: 0
              }
            ]
          })
        })
      }

      let resources = []

      const hasResharing = useCapabilityFilesSharingResharing(ref.$store)
      const hasShareJail = useCapabilityShareJailEnabled(ref.$store)

      try {
        if (recievedResources.length) {
          resources = aggregateResourceShares(
            recievedResources,
            false,
            unref(hasResharing),
            unref(hasShareJail)
          )
        }
      } catch (error) {
        console.error(error)
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
      }

      resources.forEach((r) => {
        delete r.owner
        delete r.share
        delete r.sdate
        delete r.status
        delete r.sharedWith
        delete r.indicators
      })

      ref.$store.commit('Files/LOAD_FILES', {
        currentFolder: null,
        files: resources
      })
    })
    const storeItems = computed(() => store.getters['Files/activeFiles'] || [])
    const fields = computed(() => {
      return determineSortFields(unref(storeItems)[0])
    })
    const {
      sortBy,
      sortDir,
      items: activeFiles,
      handleSort
    } = useSort({
      items: storeItems,
      fields,
      sortByQueryName: 'shares-sort-by',
      sortDirQueryName: 'shares-sort-dir'
    })

    return {
      resourceTargetLocation: createLocationSpaces('files-spaces-personal'),
      fileListHeaderY,
      loadResourcesTask,
      handleSort,
      sortBy,
      sortDir,
      activeFiles
    }
  },

  data: () => ({
    ShareStatus,
    showMorePending: false
  }),

  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    ...mapGetters(['isOcis', 'configuration', 'getToken']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    isLightweight() {
      return this.$store.getters.user.usertype === 'lightweight'
    },

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        // this will (intentionally) reset the file selection to shares for the current view mode only.
        this.SET_FILE_SELECTION(resources)
      }
    },

    sharesEmptyMessage() {
      return this.$gettext('You are not collaborating on any projects.')
    },
    hasProjects() {
      return this.projectsCount > 0
    },
    projectsCount() {
      return this.activeFiles.length
    },
    sharesCountFiles() {
      return this.activeFiles.filter((s) => s.type !== 'folder').length
    },
    sharesCountFolders() {
      return this.activeFiles.filter((s) => s.type === 'folder').length
    },
    sharesToggleRouterLink() {
      return {
        name: this.$route.name,
        params: {
          ...this.$route.params
        },
        query: {
          ...this.$route.query
        }
      }
    },
    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },

  created() {
    this.loadResourcesTask.perform(this)
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview', 'loadAvatars']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['LOAD_FILES', 'SET_FILE_SELECTION', 'CLEAR_CURRENT_FILES_LIST']),

    onNewProjectButtonClick() {
      window.open(
        'https://cern.service-now.com/service-portal?id=sc_cat_item&name=EOS-projet-space&se=CERNBox-Service',
        '_blank'
      )
    },
    rowMounted(resource, component) {
      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadAvatars({ resource })

        if (!this.displayThumbnails) {
          return
        }

        this.loadPreview({
          resource,
          isPublic: false,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, {
        onEnter: debounced,
        onExit: debounced.cancel
      })
    },

    isResourceInSharesSelection(resource) {
      return this.selected?.includes(resource)
    }
  }
}
</script>

<style>
#files-shared-with-me-pending-table,
#files-shared-with-me-pending-table th {
  background-color: var(--oc-color-background-highlight);
}
</style>
