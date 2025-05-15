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
      v-model:selected-ids="selectedResourcesIds"
      :is-side-bar-open="isSideBarOpen"
      :fields-displayed="displayedFields"
      :resources="resourceItems"
      :are-resources-clickable="resourceClickable"
      :target-route-callback="resourceTargetRouteCallback"
      :header-position="fileListHeaderY"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      :grouping-settings="groupingSettings"
      @file-click="triggerDefaultAction"
      @item-visible="loadPreview({ space: getMatchingSpace($event), resource: $event })"
      @sort="sortHandler"
    >
      <template #syncEnabled="{ resource }">
        <div
          :key="resource.getDomSelector()"
          class="oc-text-nowrap oc-flex oc-flex-middle oc-flex-right oc-gap-s"
        >
          <oc-icon
            v-if="resource.shareRoles?.length"
            v-oc-tooltip="$gettext(resource.shareRoles[0].displayName)"
            :accessible-label="$gettext(resource.shareRoles[0].description)"
            :name="resource.shareRoles[0].icon"
            fill-type="line"
            size="small"
          />
          <oc-icon
            v-if="isExternalShare(resource)"
            v-oc-tooltip="ShareTypes.remote.label"
            :accessible-label="ShareTypes.remote.label"
            :name="ShareTypes.remote.icon"
            fill-type="line"
            size="small"
          />
          <oc-icon
            v-if="resource.syncEnabled"
            v-oc-tooltip="$gettext('Synced with your devices')"
            :accessible-label="$gettext('Synced with your devices')"
            name="loop-right"
            class="sync-enabled"
            size="small"
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
          v-oc-tooltip="hideShareAction.label({ space: null, resources: [resource] })"
          appearance="raw"
          :class="['oc-p-xs', hideShareAction.class]"
          @click.stop="hideShareAction.handler({ space: null, resources: [resource] })"
        >
          <oc-icon :name="resource.hidden ? 'eye' : 'eye-off'" fill-type="line" />
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
        <list-info v-else class="oc-width-1-1 oc-my-s" />
      </template>
    </resource-table>
  </div>
</template>

<script lang="ts">
import {
  ResourceTable,
  useCapabilityStore,
  useConfigStore,
  useFileActions,
  useFileActionsToggleHideShare,
  useLoadPreview,
  useResourcesStore
} from '@ownclouders/web-pkg'
import { computed, defineComponent, PropType, unref } from 'vue'
import { SortDir, useGetMatchingSpace } from '@ownclouders/web-pkg'
import { createLocationSpaces } from '@ownclouders/web-pkg'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import { IncomingShareResource, ShareTypes } from '@ownclouders/web-client'
import { ContextActions } from '@ownclouders/web-pkg'
import { NoContentMessage } from '@ownclouders/web-pkg'
import { useSelectedResources } from '@ownclouders/web-pkg'
import { RouteLocationNamedRaw } from 'vue-router'
import { CreateTargetRouteOptions } from '@ownclouders/web-pkg'
import { createFileRouteOptions } from '@ownclouders/web-pkg'

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
      type: Array as PropType<IncomingShareResource[]>,
      required: true
    },
    sortBy: {
      type: String,
      required: false,
      default: undefined
    },
    sortDir: {
      type: String as PropType<SortDir>,
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
    const capabilityStore = useCapabilityStore()
    const configStore = useConfigStore()
    const { getMatchingSpace } = useGetMatchingSpace()
    const { loadPreview } = useLoadPreview()

    const { triggerDefaultAction } = useFileActions()
    const { actions: hideShareActions } = useFileActionsToggleHideShare()
    const hideShareAction = computed(() => unref(hideShareActions)[0])

    const { updateResourceField } = useResourcesStore()

    const isExternalShare = (resource: IncomingShareResource) => {
      return resource.shareTypes.includes(ShareTypes.remote.value)
    }

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
      capabilityStore,
      configStore,
      triggerDefaultAction,
      hideShareAction,
      resourceTargetRouteCallback,
      ...useSelectedResources(),
      getMatchingSpace,
      updateResourceField,
      isExternalShare,
      ShareTypes,
      loadPreview
    }
  },

  data: () => ({
    showMore: false
  }),

  computed: {
    displayedFields() {
      return ['name', 'syncEnabled', 'sharedBy', 'sdate', 'sharedWith']
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
  methods: {
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
