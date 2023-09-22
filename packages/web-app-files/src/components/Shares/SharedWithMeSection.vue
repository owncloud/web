<template>
  <div>
    <h2 class="oc-px-m oc-py-s">
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
      :class="{ 'files-table-squashed': sideBarOpen }"
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
          <oc-button
            v-if="getShowAcceptButton(resource)"
            size="small"
            variation="success"
            class="file-row-share-status-accept"
            @click.stop="triggerAction('accept-share', { space: null, resources: [resource] })"
          >
            <oc-icon size="small" name="check" />
            <span v-translate>Accept</span>
          </oc-button>
          <oc-button
            v-if="getShowDeclineButton(resource)"
            size="small"
            class="file-row-share-decline oc-ml-s"
            @click.stop="triggerAction('decline-share', { space: null, resources: [resource] })"
          >
            <oc-icon size="small" name="spam-3" fill-type="line" />
            <span v-translate>Decline</span>
          </oc-button>
        </div>
      </template>
      <template #contextMenu="{ resource }">
        <context-actions
          v-if="isResourceInSelection(resource)"
          :action-options="{ space: getMatchingSpace(resource), resources: selectedResources }"
        />
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
import ResourceTable from 'web-pkg/src/components/FilesList/ResourceTable.vue'
import { defineComponent, PropType } from 'vue'
import { debounce } from 'lodash-es'
import { ImageDimension, ImageType } from 'web-pkg/src/constants'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { mapActions } from 'vuex'
import { useFileActions } from 'web-pkg/src/composables/actions/files/useFileActions'
import { SortDir, useStore, useGetMatchingSpace } from 'web-pkg/src/composables'
import { createLocationSpaces } from 'web-pkg/src/router'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import { ShareStatus } from 'web-client/src/helpers/share'
import ContextActions from 'web-pkg/src/components/FilesList/ContextActions.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useSelectedResources } from 'web-pkg/src/composables/selection'
import { RouteLocationNamedRaw } from 'vue-router'
import { Resource } from 'web-client/src/helpers'
import { CreateTargetRouteOptions } from 'web-pkg/src/helpers/folderLink'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'

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
      required: true
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
    sideBarOpen: {
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
      ...useFileActions(),
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
    getShowAcceptButton(resource) {
      return resource.status === ShareStatus.declined || resource.status === ShareStatus.pending
    },
    getShowDeclineButton(resource) {
      return resource.status === ShareStatus.accepted || resource.status === ShareStatus.pending
    },
    toggleShowMore() {
      this.showMore = !this.showMore
    }
  }
})
</script>

<style lang="scss" scoped>
.files-empty {
  height: auto;
}
</style>
