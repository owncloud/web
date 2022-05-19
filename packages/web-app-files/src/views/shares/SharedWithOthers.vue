<template>
  <div>
    <app-bar :has-shares-navigation="true" />
    <app-loading-spinner v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-shared-with-others-empty"
        class="files-empty"
        icon="group"
      >
        <template #message>
          <span v-translate>
            You are currently not collaborating on any of your resources with other people
          </span>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-shared-with-others-table"
        v-model="selectedResources"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :grouping-settings="groupingSettings"
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
import { useStore } from 'web-pkg/src/composables'

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
    const store = useStore()
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),

      resourceTargetLocation: createLocationSpaces('files-spaces-personal', {
        params: { storageId: store.getters.user.id }
      })
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['highlightedFile', 'totalFilesCount']),
    ...mapGetters(['configuration', 'getToken', 'user']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    groupingSettings() {
      const that = this
      return {
        groupingBy: localStorage.getItem('grouping-shared-with-others') || 'Shared on',
        showGroupingOptions: true,
        groupingFunctions: {
          'Name alphabetically': function (row) {
            localStorage.setItem('grouping-shared-with-others', 'Name alphabetically')
            if (!isNaN(row.name.charAt(0))) return '#'
            if (row.name.charAt(0) === '.') return row.name.charAt(1).toLowerCase()
            return row.name.charAt(0).toLowerCase()
          },
          'Shared on': function (row) {
            localStorage.setItem('grouping-shared-with-others', 'Shared on')
            const recently = Date.now() - 604800000
            const lastMonth = Date.now() - 2592000000
            if (Date.parse(row.sdate) < lastMonth) return 'Older'
            if (Date.parse(row.sdate) >= recently) return 'Recently'
            else return 'Last month'
          },
          None: function () {
            localStorage.setItem('grouping-shared-with-others', 'None')
          }
        },
        sortGroups: {
          'Name alphabetically': function (groups) {
            // sort in alphabetical order by group name
            const sortedGroups = groups.sort(function (a, b) {
              if (a.name < b.name) {
                return -1
              }
              if (a.name > b.name) {
                return 1
              }
              return 0
            })
            // if sorting is done by name, reverse groups depending on asc/desc
            if (that.sortBy === 'name' && that.sortDir === 'desc') sortedGroups.reverse()
            return sortedGroups
          },
          'Shared on': function (groups) {
            // sort in order: 1-Recently, 2-Last month, 3-Older
            const sortedGroups = []
            const options = ['Recently', 'Last month', 'Older']
            for (const o of options) {
              const found = groups.find((el) => el.name.toLowerCase() === o.toLowerCase())
              if (found) sortedGroups.push(found)
            }
            // if sorting is done by sdate, reverse groups depending on asc/desc
            if (that.sortBy === 'sdate' && that.sortDir === 'asc') sortedGroups.reverse()
            return sortedGroups
          }
        }
      }
    },

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    }
  },

  created() {
    this.loadResourcesTask.perform()
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview', 'loadAvatars']),
    ...mapMutations('Files', ['LOAD_FILES', 'CLEAR_CURRENT_FILES_LIST']),

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

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
