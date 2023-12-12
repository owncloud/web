<template>
  <div>
    <h2 class="oc-px-m oc-py-s oc-invisible-sr">
      {{ title }}
      <span class="oc-text-medium">({{ items.length }})</span>
    </h2>

    <no-content-message
      v-if="!items.length"
      class="files-empty oc-flex-stretch"
      icon="share-forward"
    >
      <template #message>
        <span>{{ emptyMessage }}</span>
      </template>
    </no-content-message>
    <resource-table
      v-else
      v-model:selectedIds="selectedResourcesIds"
      :data-test-share-status="shareStatus"
      class="files-table"
      :class="{ 'files-table-squashed': isSideBarOpen }"
      :fields-displayed="displayedFields"
      sidebar-closed
      :are-thumbnails-displayed="displayThumbnails"
      :resources="resourceItems"
      :are-resources-clickable="resourceClickable"
      :target-route-callback="resourceTargetRouteCallback"
      :header-position="fileListHeaderY"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      :grouping-settings="groupingSettings"
      @file-click="triggerDefaultAction"
      @row-mounted="rowMounted"
      @sort="sortHandler"
    >
      <template #status="{ resource }">
        <div
          :key="resource.getDomSelector() + resource.status"
          class="oc-text-nowrap oc-flex oc-flex-middle oc-flex-right"
        >
          <oc-icon
            v-if="getShowSynchedIcon(resource)"
            v-oc-tooltip="$gettext('Synced with your devices')"
            name="loop-right"
            class="sync-enabled"
          />
        </div>
      </template>
      <template #contextMenu="{ resource }">
        <context-actions
          v-if="isResourceInSelection(resource)"
          :action-options="{ space: getMatchingSpace(resource), resources: selectedResources }"
        />
      </template>
      <template #quickActions="{ resource }">
        <oc-button
          size="small"
          appearance="raw"
          :class="['oc-ml-s', 'oc-p-s', hideShareAction.class]"
          @click.stop="hideShareAction.handler({ space: null, resources: [resource] })"
        >
          <oc-icon size="small" :name="resource.hidden ? 'eye' : 'eye-off'" fill-type="line" />
          <span>{{ hideShareAction.label({ space: null, resources: [resource] }) }}</span>
        </oc-button>
      </template>
      <template #footer>
        <div v-if="showMoreToggle && hasMore" class="oc-width-1-1 oc-text-center oc-mt">
          <oc-button
            id="files-shared-with-me-show-all"
            appearance="raw"
            gap-size="xsmall"
            size="small"
            :data-test-expand="(!showMore).toString()"
            @click="toggleShowMore"
          >
            {{ toggleMoreLabel }}
            <oc-icon :name="'arrow-' + (showMore ? 'up' : 'down') + '-s'" fill-type="line" />
          </oc-button>
        </div>
        <list-info
          v-else
          class="oc-width-1-1 oc-my-s"
          :files="countFiles"
          :folders="countFolders"
        />
      </template>
    </resource-table>
  </div>
</template>

<script lang="ts">
import { ResourceTable, useFileActions, useFileActionsToggleHideShare } from '@ownclouders/web-pkg'
import { computed, defineComponent, PropType, unref } from 'vue'
import { debounce } from 'lodash-es'
import { ImageDimension, ImageType } from '@ownclouders/web-pkg'
import { VisibilityObserver } from '@ownclouders/web-pkg'
import { mapActions } from 'vuex'
import { SortDir, useStore, useGetMatchingSpace } from '@ownclouders/web-pkg'
import { createLocationSpaces } from '@ownclouders/web-pkg'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import { ShareStatus } from '@ownclouders/web-client/src/helpers/share'
import { ContextActions } from '@ownclouders/web-pkg'
import { NoContentMessage } from '@ownclouders/web-pkg'
import { useSelectedResources } from '@ownclouders/web-pkg'
import { RouteLocationNamedRaw } from 'vue-router'
import { Resource } from '@ownclouders/web-client/src/helpers'
import { CreateTargetRouteOptions } from '@ownclouders/web-pkg'
import { createFileRouteOptions } from '@ownclouders/web-pkg'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    ResourceTable,
    ContextActions,
    ListInfo,
    NoContentMessage
  },

  props: {
    title: {
      type: String,
      required: true
    },
    emptyMessage: {
      type: String,
      required: false,
      default: ''
    },
    items: {
      type: Array as PropType<Resource[]>,
      required: true
    },
    shareStatus: {
      type: Number,
      default: ShareStatus.accepted
    },
    sortBy: {
      type: String,
      required: false,
      default: undefined
    },
    sortDir: {
      type: String,
      required: false,
      default: undefined,
      validator: (value: string) => {
        return (
          value === undefined || [SortDir.Asc.toString(), SortDir.Desc.toString()].includes(value)
        )
      }
    },
    sortHandler: {
      type: Function as PropType<any>,
      required: true
    },
    showMoreToggle: {
      type: Boolean,
      default: false
    },
    showMoreToggleCount: {
      type: Number,
      default: 3
    },
    resourceClickable: {
      type: Boolean,
      default: true
    },
    displayThumbnails: {
      type: Boolean,
      default: true
    },
    isSideBarOpen: {
      type: Boolean,
      default: false
    },
    fileListHeaderY: {
      type: Number,
      default: 0
    },
    /**
     * This is only relevant for CERN and can be ignored in any other cases.
     */
    groupingSettings: {
      type: Object,
      required: false,
      default: null
    }
  },
  setup() {
    const store = useStore()
    const { getMatchingSpace } = useGetMatchingSpace()

    const { triggerDefaultAction } = useFileActions()
    const { actions: hideShareActions } = useFileActionsToggleHideShare({ store })
    const hideShareAction = computed(() => unref(hideShareActions)[0])

    const resourceTargetRouteCallback = ({
      path,
      fileId,
      resource
    }: CreateTargetRouteOptions): RouteLocationNamedRaw => {
      return createLocationSpaces(
        'files-spaces-generic',
        createFileRouteOptions(getMatchingSpace(resource), { path, fileId })
      )
    }

    return {
      triggerDefaultAction,
      hideShareAction,
      resourceTargetRouteCallback,
      ...useSelectedResources({ store }),
      getMatchingSpace
    }
  },

  data: () => ({
    ShareStatus,
    showMore: false
  }),

  computed: {
    displayedFields() {
      return ['name', 'status', 'owner', 'sdate', 'sharedWith']
    },
    countFiles() {
      return this.items.filter((s) => s.type !== 'folder').length
    },
    countFolders() {
      return this.items.filter((s) => s.type === 'folder').length
    },
    toggleMoreLabel() {
      return this.showMore ? this.$gettext('Show less') : this.$gettext('Show more')
    },
    hasMore() {
      return this.items.length > this.showMoreToggleCount
    },
    resourceItems() {
      if (!this.showMoreToggle || this.showMore) {
        return this.items
      }
      return this.items.slice(0, this.showMoreToggleCount)
    }
  },
  beforeUnmount() {
    visibilityObserver.disconnect()
  },
  methods: {
    ...mapActions('Files', ['loadPreview', 'loadAvatars']),

    rowMounted(resource, component) {
      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadAvatars({ resource, clientService: this.$clientService })

        if (!this.displayThumbnails) {
          return
        }

        this.loadPreview({
          previewService: this.$previewService,
          space: this.getMatchingSpace(resource),
          resource,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, {
        onEnter: debounced,
        onExit: debounced.cancel
      })
    },
    getShowSynchedIcon(resource: Resource) {
      return resource.status === ShareStatus.accepted
    },
    getShowAcceptButton(resource: Resource) {
      return resource.status === ShareStatus.declined || resource.status === ShareStatus.pending
    },
    getShowDeclineButton(resource: Resource) {
      return resource.status === ShareStatus.accepted || resource.status === ShareStatus.pending
    },
    toggleShowMore() {
      this.showMore = !this.showMore
    }
  }
})
</script>

<style lang="scss" scoped>
.oc-files-actions-hide-share-trigger:hover {
  background-color: var(--oc-color-background-secondary) !important;
}
</style>
