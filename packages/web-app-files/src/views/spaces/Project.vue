<template>
  <div class="space-overview oc-p-s">
    <list-loader v-if="loadSpaceTask.isRunning" />
    <template v-else>
      <not-found-message v-if="!space.id" class="files-not-found oc-height-1-1" />
      <div v-else class="oc-grid oc-grid-match oc-child-width-1-3@s">
        <div>
          <img
            class="space-overview-image"
            alt=""
            :src="'data:image/jpeg;base64,' + imageContent"
          />
        </div>
        <div>
          <h3 class="oc-mb-s">{{ space.name }}</h3>
          <span v-if="space.description">{{ space.description }}</span>
          <div>
            <div ref="markdownContainer" class="markdown-container" v-html="markdownContent"></div>
            <div v-if="showMarkdownCollapse" class="markdown-collapse oc-text-center oc-mt-s">
              <oc-button appearance="raw" @click="toggleCollapseMarkdown">
                <oc-icon :name="markdownCollapseIcon" />
                <span>{{ markdownCollapseText }}</span>
              </oc-button>
            </div>
          </div>
        </div>
      </div>
      <no-content-message v-if="isEmpty" id="files-spaces-empty" class="files-empty" icon="folder">
        <template #message>
          <p class="oc-text-muted">
            <span v-translate>No resources found</span>
          </p>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-spaces-table"
        v-model="selected"
        class="files-table oc-mt-xl"
        :resources="paginatedResources"
        :target-route="resourceTargetLocation"
        @fileClick="$_fileActions_triggerDefaultAction"
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
    </template>
  </div>
</template>

<script>
import NoContentMessage from '../../components/FilesList/NoContentMessage.vue'
import NotFoundMessage from '../../components/FilesList/NotFoundMessage.vue'
import ListLoader from '../../components/FilesList/ListLoader.vue'
import { computed, ref, unref } from '@vue/composition-api'
import { client } from 'web-client'
import { useTask } from 'vue-concurrency'
import { useStore, useRouter, useRouteQuery } from 'web-pkg/src/composables'
import marked from 'marked'
import MixinAccessibleBreadcrumb from '../../mixins/accessibleBreadcrumb'
import { bus } from 'web-pkg/src/instance'
import { buildResource } from '../../helpers/resources'
import ResourceTable, { determineSortFields } from '../../components/FilesList/ResourceTable.vue'
import { createLocationSpaces } from '../../router'
import { usePagination, useSort } from '../../composables'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import MixinFileActions from '../../mixins/fileActions'

export default {
  components: {
    NoContentMessage,
    ListLoader,
    NotFoundMessage,
    ResourceTable,
    ListInfo,
    Pagination,
    ContextActions
  },
  mixins: [MixinAccessibleBreadcrumb, MixinFileActions],
  setup() {
    const router = useRouter()
    const store = useStore()

    const spaceId = router.currentRoute.params.spaceId
    console.log(spaceId)

    const space = ref({})
    const markdownContent = ref('')
    const imageContent = ref('')
    const { graph } = client(store.getters.configuration.server, store.getters.getToken)

    const storeItems = computed(() => store.getters['Files/activeFiles'] || [])
    const fields = computed(() => {
      return determineSortFields(unref(storeItems)[0])
    })

    const { sortBy, sortDir, items, handleSort } = useSort({
      items: storeItems,
      fields
    })

    const paginationPageQuery = useRouteQuery('page', '1')
    const paginationPage = computed(() => parseInt(String(paginationPageQuery.value)))
    const { items: paginatedResources, total: paginationPages } = usePagination({
      page: paginationPage,
      items,
      sortDir,
      sortBy
    })

    const loadSpaceTask = useTask(function* () {
      const response = yield graph.drives.getDrive(spaceId)
      space.value = response.data || {}
    })
    const loadReadmeTask = useTask(function* (signal, ref) {
      const markdownEntry = space.value?.special?.find((el) => el?.specialFolder?.name === 'readme')

      if (!markdownEntry) {
        return
      }

      const fileContents = yield ref.$client.files.getFileContents(
        `spaces/${space.value.id}/${markdownEntry.name}`
      )

      if (ref.markdownResizeObserver) {
        ref.markdownResizeObserver.unobserve(ref.$refs.markdownContainer)
      }

      markdownContent.value = marked.parse(fileContents)

      if (markdownContent.value) {
        ref.markdownResizeObserver.observe(ref.$refs.markdownContainer)
      }
    })
    const loadImageTask = useTask(function* (signal, ref) {
      const imageEntry = space.value?.special?.find((el) => el?.specialFolder?.name === 'image')

      if (!imageEntry) {
        return
      }

      const fileContents = yield ref.$client.files.getFileContents(
        `spaces/${space.value.id}/${imageEntry.name}`,
        {
          responseType: 'arrayBuffer'
        }
      )

      imageContent.value = Buffer.from(fileContents).toString('base64')
    })

    const loadFilesListTask = useTask(function* (signal, ref, sameRoute, path = null) {
      ref.CLEAR_CURRENT_FILES_LIST()
      const response = yield ref.$client.files.list(
        `spaces/${ref.$route.params.spaceId}/${path || ''}`
      )

      const resources = response.map(buildResource)
      const currentFolder = resources.shift()

      ref.LOAD_FILES({
        currentFolder,
        files: resources
      })
      ref.loadIndicators({
        client: ref.$client,
        currentFolder: currentFolder.path
      })

      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
      ref.scrollToResourceFromRoute()
    })

    const loadResourcesTask = useTask(function* (signal, ref, sameRoute, path) {
      yield loadSpaceTask.perform(ref)
      loadReadmeTask.perform(ref)
      loadImageTask.perform(ref)
      loadFilesListTask.perform(ref, sameRoute, path)
    })

    return {
      space,
      loadSpaceTask,
      loadImageTask,
      loadReadmeTask,
      markdownContent,
      imageContent,
      loadResourcesTask,
      loadFilesListTask,
      resourceTargetLocation: createLocationSpaces('files-spaces-project'),
      paginatedResources,
      paginationPages,
      paginationPage,
      handleSort,
      sortBy,
      sortDir
    }
  },
  data: function () {
    return {
      markdownCollapsed: true,
      markdownContainerCollapsedClass: 'collapsed',
      showMarkdownCollapse: false,
      markdownResizeObserver: new ResizeObserver(this.onMarkdownResize)
    }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'selectedFiles',
      'currentFolder',
      'totalFilesCount',
      'totalFilesSize'
    ]),

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SET_FILE_SELECTION(resources)
      }
    },
    isEmpty() {
      return this.paginatedResources.length < 1
    },

    markdownCollapseIcon() {
      return this.markdownCollapsed === true ? 'add' : 'subtract'
    },
    markdownCollapseText() {
      return this.markdownCollapsed === true
        ? this.$gettext('Show more')
        : this.$gettext('Show less')
    }
  },
  watch: {
    $route: {
      handler: function (to, from) {
        const sameRoute = to.name === from?.name
        const sameItem = to.params?.item === from?.params?.item

        if (!sameRoute || !sameItem) {
          this.loadFilesListTask.perform(this, sameRoute, to.params.item)
        }
      },
      immediate: true
    }
  },
  async mounted() {
    await this.loadResourcesTask.perform(this, false, this.$route.params.item || '')

    document.title = `${this.space.name} - ${this.$route.meta.title}`
    this.$route.params.name = this.space.name

    const loadSpaceEventToken = bus.subscribe('app.files.list.load', (path) => {
      this.loadResourcesTask.perform(this, this.$route.params.item === path, path)
    })

    this.$on('beforeDestroy', () => bus.unsubscribe('app.files.list.load', loadSpaceEventToken))
  },
  beforeDestroy() {
    this.markdownResizeObserver.unobserve(this.$refs.markdownContainer)
  },
  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview']),
    ...mapMutations('Files', [
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'REMOVE_FILE',
      'REMOVE_FILE_FROM_SEARCHED',
      'SET_FILE_SELECTION',
      'REMOVE_FILE_SELECTION'
    ]),

    toggleCollapseMarkdown() {
      this.markdownCollapsed = !this.markdownCollapsed
      return this.$refs.markdownContainer.classList.toggle(this.markdownContainerCollapsedClass)
    },
    onMarkdownResize() {
      if (!this.$refs.markdownContainer) {
        return
      }

      this.$refs.markdownContainer.classList.remove(this.markdownContainerCollapsedClass)
      const markdownContainerHeight = this.$refs.markdownContainer.offsetHeight

      if (markdownContainerHeight < 150) {
        return (this.showMarkdownCollapse = false)
      }

      this.showMarkdownCollapse = true

      if (this.markdownCollapsed) {
        this.$refs.markdownContainer.classList.add(this.markdownContainerCollapsedClass)
      }
    },

    isResourceInSelection(resource) {
      return this.selected?.includes(resource)
    }
  }
}
</script>

<style lang="scss">
.space-overview {
  &-image {
    border-radius: 10px;
    max-height: 250px;
  }

  .markdown-container * {
    color: grey !important;
  }

  .markdown-container.collapsed {
    max-height: 150px;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(180deg, #000 90%, transparent);
  }
}
</style>
