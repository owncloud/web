<template>
  <div class="oc-flex oc-width-1-1">
    <files-view-wrapper>
      <app-bar
        :breadcrumbs="breadcrumbs"
        :has-bulk-actions="true"
        :side-bar-open="sideBarOpen"
        :space="space"
      />

      <trashbin-date-picker @range-changed="rangeChanged" />
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <no-content-message
          v-if="isEmpty"
          id="files-trashbin-empty"
          class="files-empty"
          icon="delete-bin-7"
          icon-fill-type="line"
        >
          <template #message>
            <span>{{ noContentMessage }}</span>
          </template>
        </no-content-message>
        <resource-table
          v-else
          id="files-trashbin-table"
          v-model:selectedIds="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': sideBarOpen }"
          :fields-displayed="['name', 'ddate']"
          :are-paths-displayed="true"
          :are-thumbnails-displayed="false"
          :resources="paginatedResources"
          :are-resources-clickable="false"
          :header-position="fileListHeaderY"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          :space="space"
          :has-actions="showActions"
          @sort="handleSort"
        >
          <template #contextMenu="{ resource }">
            <context-actions
              v-if="isResourceInSelection(resource)"
              :action-options="{ space, resources: selectedResources }"
            />
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
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" :space="space" />
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex'

import AppBar from '../../components/AppBar/AppBar.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import ResourceTable from '../../components/FilesList/ResourceTable.vue'
import TrashbinDatePicker from '../../components/FilesList/TrashbinDatePicker.vue'
import SideBar from '../../components/SideBar/SideBar.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import Pagination from 'web-pkg/src/components/Pagination.vue'

import { eventBus } from 'web-pkg/src/services/eventBus'
import { useResourcesViewDefaults } from '../../composables'
import { computed, defineComponent, PropType, onMounted, onBeforeUnmount, unref, ref } from 'vue'
import { Resource } from 'web-client'
import { useCapabilityShareJailEnabled, useCapabilitySpacesEnabled } from 'web-pkg/src/composables'
import { createLocationTrash } from '../../router'
import { isProjectSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { useDocumentTitle } from 'web-pkg/src/composables/appDefaults/useDocumentTitle'
import { useGettext } from 'vue3-gettext'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'GenericTrash',

  components: {
    AppBar,
    AppLoadingSpinner,
    ContextActions,
    FilesViewWrapper,
    ListInfo,
    NoContentMessage,
    Pagination,
    ResourceTable,
    SideBar,
    TrashbinDatePicker
  },

  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
    },
    itemId: {
      type: [String, Number],
      required: false,
      default: null
    }
  },

  setup(props) {
    const { $gettext } = useGettext()
    const router = useRouter()
    let loadResourcesEventToken
    const noContentMessage = computed(() => {
      return props.space.driveType === 'personal'
        ? $gettext('You have no deleted files')
        : $gettext('Space has no deleted files')
    })

    const hasSpaces = useCapabilitySpacesEnabled()
    const titleSegments = computed(() => {
      const segments = [$gettext('Deleted files')]
      if (unref(hasSpaces)) {
        segments.unshift(props.space.name)
      }
      return segments
    })
    useDocumentTitle({ titleSegments })

    const query =
      router.currentRoute.value.query.from && router.currentRoute.value.query.to
        ? ref({
            from: router.currentRoute.value.query.from,
            to: router.currentRoute.value.query.to
          })
        : ref(null)

    const resourcesViewDefaults = useResourcesViewDefaults<Resource, any, any[]>()
    const performLoaderTask = async () => {
      await resourcesViewDefaults.loadResourcesTask.perform(props.space, query)
      resourcesViewDefaults.refreshFileListHeaderPosition()
      resourcesViewDefaults.scrollToResourceFromRoute(
        unref(resourcesViewDefaults.paginatedResources)
      )
    }

    onMounted(() => {
      performLoaderTask()
      loadResourcesEventToken = eventBus.subscribe('app.files.list.load', () => {
        performLoaderTask()
      })
    })

    function rangeChanged(data) {
      query.value =
        data.range?.from && data.range?.to ? { from: data.range.from, to: data.range.to } : null
      performLoaderTask()
    }

    onBeforeUnmount(() => {
      eventBus.unsubscribe('app.files.list.load', loadResourcesEventToken)
    })

    return {
      ...resourcesViewDefaults,
      hasShareJail: useCapabilityShareJailEnabled(),
      noContentMessage,
      rangeChanged
    }
  },

  computed: {
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['totalFilesCount']),
    ...mapGetters(['user']),

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    breadcrumbs() {
      let currentNodeName = this.space?.name
      if (this.space.driveType === 'personal') {
        currentNodeName = this.hasShareJail ? this.$gettext('Personal') : this.$gettext('All files')
      }
      return [
        {
          text: this.$gettext('Deleted files'),
          to: createLocationTrash('files-trash-overview')
        },
        {
          text: currentNodeName,
          onClick: () => eventBus.publish('app.files.list.load')
        }
      ]
    },

    showActions() {
      return (
        !isProjectSpaceResource(this.space) ||
        this.space.isEditor(this.user) ||
        this.space.isManager(this.user)
      )
    }
  }
})
</script>
