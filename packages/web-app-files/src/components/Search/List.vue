<template>
  <div class="files-search-result">
    <no-content-message v-if="!activeFilesCurrentPage.length" class="files-empty" icon="folder">
      <template #message>
        <p class="oc-text-muted">
          <span v-if="!!$route.query.term" v-translate>No resource found</span>
          <span v-else v-translate>No search term entered</span>
        </p>
      </template>
    </no-content-message>
    <oc-table-files
      v-else
      class="files-table"
      :class="{ 'files-table-squashed': false }"
      :resources="activeFilesCurrentPage"
      :target-route="{ name: 'files-personal' }"
      :are-paths-displayed="true"
      :are-thumbnails-displayed="displayThumbnails"
      :has-actions="false"
      :is-selectable="false"
      @fileClick="$_fileActions_triggerDefaultAction"
      @rowMounted="rowMounted"
    >
      <template #footer>
        <pagination />
        <list-info
          v-if="activeFilesCurrentPage.length > 0"
          class="uk-width-1-1 oc-my-s"
          :files="totalFilesCount.files"
          :folders="totalFilesCount.folders"
          :size="totalFilesSize"
        />
      </template>
    </oc-table-files>
  </div>
</template>

<script>
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageType, ImageDimension } from '../../constants'
import NoContentMessage from '../FilesList/NoContentMessage.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import debounce from 'lodash-es/debounce'
import { mapMutations, mapGetters, mapActions } from 'vuex'
import ListInfo from '../FilesList/ListInfo.vue'
import MixinFileActions from '../../mixins/fileActions'
import MixinFilesListFilter from '../../mixins/filesListFilter'
import MixinFilesListScrolling from '../../mixins/filesListScrolling'
import MixinFilesListPositioning from '../../mixins/filesListPositioning'
import MixinFilesListPagination from '../../mixins/filesListPagination'

const visibilityObserver = new VisibilityObserver()

export default {
  components: { ListInfo, NoContentMessage, Pagination },
  mixins: [
    MixinFileActions,
    MixinFilesListFilter,
    MixinFilesListScrolling,
    MixinFilesListPositioning,
    MixinFilesListPagination
  ],
  props: {
    searchResults: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['activeFilesCurrentPage', 'totalFilesCount', 'totalFilesSize']),
    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },
  watch: {
    $route: {
      handler: '$_filesListPagination_updateCurrentPage',
      immediate: true
    },
    searchResults: {
      handler: function() {
        this.CLEAR_CURRENT_FILES_LIST()
        this.LOAD_FILES({
          currentFolder: null,
          files: this.searchResults.length
            ? this.searchResults.map(searchResult => searchResult.data)
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
    }
  }
}
</script>
