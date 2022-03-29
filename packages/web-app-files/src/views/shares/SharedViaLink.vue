<template>
  <div>
    <app-bar :has-shares-navigation="true" />
    <app-loading-spinner v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-shared-via-link-empty"
        class="files-empty"
        icon="link"
      >
        <template #message>
          <span v-translate>There are no resources with a public link at the moment</span>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-shared-via-link-table"
        v-model="selectedResources"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :fields-displayed="['name', 'sharedWith', 'sdate']"
        :are-thumbnails-displayed="displayThumbnails"
        :are-paths-displayed="true"
        :resources="paginatedResources"
        :target-route="resourceTargetLocation"
        :header-position="fileListHeaderY"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
        @sort="handleSort"
      >
        <template #contextMenu="{ resource }">
          <context-actions v-if="isResourceInSelection(resource)" :items="selectedResources" />
        </template>
        <template #footer>
          <pagination :pages="paginationPages" :current-page="paginationPage" />
          <list-info
            v-if="paginatedResources.length > 0"
            class="oc-width-1-1 oc-my-s"
            :files="totalFilesCount.files"
            :folders="totalFilesCount.folders"
          />
        </template>
      </resource-table>
    </template>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import ResourceTable from '../../components/FilesList/ResourceTable.vue'

import FileActions from '../../mixins/fileActions'
import MixinFilesListFilter from '../../mixins/filesListFilter'
import MixinResources from '../../mixins/resources'
import MixinMountSideBar from '../../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../../constants'
import debounce from 'lodash-es/debounce'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppBar from '../../components/AppBar/AppBar.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import { createLocationSpaces } from '../../router'
import { useResourcesViewDefaults } from '../../composables'
import { defineComponent } from '@vue/composition-api'
import { Resource } from '../../helpers/resource'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    AppBar,
    ResourceTable,
    AppLoadingSpinner,
    NoContentMessage,
    ListInfo,
    Pagination,
    ContextActions
  },

  mixins: [FileActions, MixinResources, MixinMountSideBar, MixinFilesListFilter],

  setup() {
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),

      resourceTargetLocation: createLocationSpaces('files-spaces-personal-home')
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['highlightedFile', 'totalFilesCount']),
    ...mapGetters(['configuration']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },

  created() {
    this.loadResourcesTask.perform()
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview']),
    ...mapMutations('Files', ['LOAD_FILES', 'CLEAR_CURRENT_FILES_LIST']),

    rowMounted(resource, component) {
      if (!this.displayThumbnails) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          resource,
          isPublic: false,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
