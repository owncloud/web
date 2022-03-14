<template>
  <div class="files-search-result">
    <no-content-message v-if="!paginatedResources.length" class="files-empty" icon="folder">
      <template #message>
        <p class="oc-text-muted">
          <span v-if="!!$route.query.term" v-translate>No resource found</span>
          <span v-else v-translate>No search term entered</span>
        </p>
      </template>
    </no-content-message>
    <resource-table
      v-else
      v-model="selected"
      class="files-table"
      :class="{ 'files-table-squashed': false }"
      :resources="paginatedResources"
      :target-route="resourceTargetLocation"
      :are-paths-displayed="true"
      :are-thumbnails-displayed="displayThumbnails"
      :has-actions="true"
      :hover="true"
      :is-selectable="false"
      @fileClick="$_fileActions_triggerDefaultAction"
      @rowMounted="rowMounted"
    >
      <template #contextMenu="{ resource }">
        <context-actions v-if="isResourceInSelection(resource)" :items="selected" />
      </template>
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
  </div>
</template>

<script>
import { usePagination } from '../../composables'
import { useRouteQuery, useStore } from 'web-pkg/src/composables'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageType, ImageDimension } from '../../constants'
import { createLocationSpaces } from '../../router'
import NoContentMessage from '../FilesList/NoContentMessage.vue'
import ResourceTable from '../FilesList/ResourceTable.vue'
import ContextActions from '../FilesList/ContextActions.vue'
import debounce from 'lodash-es/debounce'
import { mapMutations, mapGetters, mapActions } from 'vuex'
import { computed, ref } from '@vue/composition-api'
import ListInfo from '../FilesList/ListInfo.vue'
import Pagination from '../FilesList/Pagination.vue'
import MixinFileActions from '../../mixins/fileActions'
import MixinFilesListFilter from '../../mixins/filesListFilter'
import MixinFilesListScrolling from '../../mixins/filesListScrolling'

const visibilityObserver = new VisibilityObserver()

export default {
  components: { ContextActions, ListInfo, Pagination, NoContentMessage, ResourceTable },
  mixins: [MixinFileActions, MixinFilesListFilter, MixinFilesListScrolling],
  props: {
    searchResults: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  setup() {
    const store = useStore()
    const paginationPageQuery = useRouteQuery('page', '1')
    const paginationPage = computed(() => parseInt(String(paginationPageQuery.value)))
    const { items: paginatedResources, total: paginationPages } = usePagination({
      page: paginationPage,
      items: computed(() => store.getters['Files/activeFiles'])
    })

    const selected = ref([])
    return {
      selected,
      paginatedResources,
      paginationPages,
      paginationPage,
      resourceTargetLocation: createLocationSpaces('files-spaces-personal-home')
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['totalFilesCount', 'totalFilesSize']),
    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },
  watch: {
    searchResults: {
      handler: function () {
        this.CLEAR_CURRENT_FILES_LIST()
        this.LOAD_FILES({
          currentFolder: null,
          files: this.searchResults.length
            ? this.searchResults.map((searchResult) => searchResult.data)
            : []
        })
      },
      immediate: true
    }
  },
  beforeDestroy() {
    visibilityObserver.disconnect()
  },
  methods: {
    ...mapMutations('Files', ['CLEAR_CURRENT_FILES_LIST', 'LOAD_FILES']),
    ...mapActions('Files', ['loadPreview']),
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
    },
    isResourceInSelection(resource) {
      return this.selected?.includes(resource)
    }
  }
}
</script>
