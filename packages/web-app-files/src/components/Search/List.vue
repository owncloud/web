<template>
  <div class="files-search-result">
    <app-bar :has-bulk-actions="true" />
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
      v-model="selectedResources"
      class="files-table"
      :class="{ 'files-table-squashed': false }"
      :resources="paginatedResources"
      :target-route="resourceTargetLocation"
      :are-paths-displayed="true"
      :are-thumbnails-displayed="displayThumbnails"
      :has-actions="true"
      :is-selectable="false"
      @fileClick="$_fileActions_triggerDefaultAction"
      @rowMounted="rowMounted"
    >
      <template #contextMenu="{ resource }">
        <context-actions v-if="isResourceInSelection(resource)" :items="selectedResources" />
      </template>
      <template #footer>
        <pagination :pages="paginationPages" :current-page="paginationPage" />
        <div
          v-if="searchResultExceedsLimit"
          class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s"
          v-text="searchResultExceedsLimitText"
        />
        <list-info
          v-else-if="paginatedResources.length > 0"
          class="oc-width-1-1 oc-my-s"
          :files="totalFilesCount.files"
          :folders="totalFilesCount.folders"
          :size="totalFilesSize"
        />
      </template>
    </resource-table>
  </div>
</template>

<script lang="ts">
import { useResourcesViewDefaults } from '../../composables'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageType, ImageDimension } from '../../constants'
import { createLocationSpaces } from '../../router'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import ResourceTable from '../FilesList/ResourceTable.vue'
import ContextActions from '../FilesList/ContextActions.vue'
import debounce from 'lodash-es/debounce'
import { mapMutations, mapGetters, mapActions } from 'vuex'
import AppBar from '../AppBar/AppBar.vue'
import { defineComponent } from '@vue/composition-api'
import ListInfo from '../FilesList/ListInfo.vue'
import Pagination from '../FilesList/Pagination.vue'
import MixinFileActions from '../../mixins/fileActions'
import MixinFilesListFilter from '../../mixins/filesListFilter'
import MixinFilesListScrolling from '../../mixins/filesListScrolling'
import { searchLimit } from '../../search/sdk/list'
import { Resource } from '../../helpers/resource'
import { useStore } from 'web-pkg/src/composables'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: { AppBar, ContextActions, ListInfo, Pagination, NoContentMessage, ResourceTable },
  mixins: [MixinFileActions, MixinFilesListFilter, MixinFilesListScrolling],
  props: {
    searchResult: {
      type: Object,
      default: function () {
        return { meta: { range: null }, values: [] }
      }
    }
  },
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
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['totalFilesCount', 'totalFilesSize']),
    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    },
    itemCount() {
      return this.totalFilesCount.files + this.totalFilesCount.folders
    },
    rangeSupported() {
      return this.searchResult.meta?.range
    },
    rangeItems() {
      return this.searchResult.meta?.range?.split('/')[1]
    },
    searchResultExceedsLimit() {
      return !this.rangeSupported || (this.rangeItems && this.rangeItems > searchLimit)
    },
    searchResultExceedsLimitText() {
      if (!this.rangeSupported) {
        const translated = this.$gettext('Showing up to %{searchLimit} results')
        return this.$gettextInterpolate(translated, {
          searchLimit
        })
      }

      const translated = this.$gettext(
        'Found %{rangeItems}, showing the %{itemCount} best matching results'
      )
      return this.$gettextInterpolate(translated, {
        itemCount: this.itemCount,
        rangeItems: this.rangeItems
      })
    }
  },
  watch: {
    searchResult: {
      handler: function () {
        this.CLEAR_CURRENT_FILES_LIST()
        this.LOAD_FILES({
          currentFolder: null,
          files: this.searchResult.values.length
            ? this.searchResult.values.map((searchResult) => searchResult.data)
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
})
</script>
