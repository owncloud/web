<template>
  <div>
    <app-bar :breadcrumbs="breadcrumbs" :has-bulk-actions="true" />
    <h2 v-if="$route.query.project" class="oc-px-m oc-py-s">
      Trashbin for project "{{ $route.query.name }}"
    </h2>
    <app-loading-spinner v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-trashbin-empty"
        class="files-empty"
        icon="delete-bin-5"
      >
        <template #message>
          <span v-if="noContentMessage">{{ noContentMessage }}</span>
          <span v-else v-translate>You have no deleted files</span>
        </template>
      </no-content-message>
      <resource-table
        v-else
        :id="$route.query.project ? 'files-project-trashbin-table' : 'files-trashbin-table'"
        :key="$route.query.project ? `trashbin${$route.query.project}` : 'trashbin'"
        v-model="selectedResources"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :fields-displayed="['name', 'ddate']"
        :are-paths-displayed="true"
        :are-thumbnails-displayed="false"
        :resources="paginatedResources"
        :are-resources-clickable="false"
        :header-position="fileListHeaderY"
        :sort-by="sortBy"
        :sort-dir="sortDir"
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
import { mapGetters, mapMutations, mapState } from 'vuex'
import AppBar from './AppBar/AppBar.vue'
import ResourceTable from './FilesList/ResourceTable.vue'

import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinResources from '../mixins/resources'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import ListInfo from './FilesList/ListInfo.vue'
import Pagination from './FilesList/Pagination.vue'
import ContextActions from './FilesList/ContextActions.vue'
import { useResourcesViewDefaults } from '../composables'
import { bus } from 'web-pkg/src/instance'
import { defineComponent } from '@vue/composition-api'
import { Resource } from '../helpers/resource'

export default defineComponent({
  name: 'TrashBin',

  components: {
    AppBar,
    ResourceTable,
    AppLoadingSpinner,
    NoContentMessage,
    ListInfo,
    Pagination,
    ContextActions
  },

  mixins: [MixinResources, MixinMountSideBar, MixinFilesListFilter],
  props: {
    breadcrumbs: { type: Array, default: () => [] },
    noContentMessage: {
      type: String,
      required: false,
      default: ''
    }
  },

  setup() {
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>()
    }
  },

  computed: {
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['highlightedFile', 'selectedFiles', 'totalFilesCount']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    isEmpty() {
      return this.paginatedResources.length < 1
    }
  },

  watch: {
    $route(to, from) {
      this.onCreated()
    }
  },

  created() {
    this.onCreated()
  },

  methods: {
    ...mapMutations('Files', ['LOAD_FILES', 'CLEAR_CURRENT_FILES_LIST']),
    onCreated() {
      this.loadResourcesTask.perform(this)

      const loadResourcesEventToken = bus.subscribe('app.files.list.load', (path) => {
        this.loadResourcesTask.perform(this, this.$route.params.item === path, path)
      })

      this.$on('beforeDestroy', () => {
        bus.unsubscribe('app.files.list.load', loadResourcesEventToken)
      })
    }
  }
})
</script>
