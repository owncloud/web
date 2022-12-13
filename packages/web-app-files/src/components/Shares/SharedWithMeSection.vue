<template>
  <div>
    <h2 class="oc-px-m oc-py-s">
      {{ title }}
      <span class="oc-text-medium">({{ items.length }})</span>
    </h2>

    <no-content-message v-if="!items.length" class="files-empty oc-flex-stretch" icon="group">
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
      @file-click="$_fileActions_triggerDefaultAction"
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
            @click.stop="$_acceptShare_trigger({ resources: [resource] })"
          >
            <oc-icon size="small" name="check" />
            <span v-translate>Accept</span>
          </oc-button>
          <oc-button
            v-if="getShowDeclineButton(resource)"
            size="small"
            class="file-row-share-decline oc-ml-s"
            @click.stop="$_declineShare_trigger({ resources: [resource] })"
          >
            <oc-icon size="small" name="spam-3" fill-type="line" />
            <span v-translate>Decline</span>
          </oc-button>
        </div>
      </template>
      <template #contextMenu="{ resource }">
        <context-actions
          v-if="isResourceInSelection(resource)"
          :items="selectedResources"
          :space="createShareSpace(resource)"
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
import ResourceTable from '../FilesList/ResourceTable.vue'
import { computed, defineComponent, unref } from 'vue'
import { debounce } from 'lodash-es'
import { ImageDimension, ImageType } from 'web-pkg/src/constants'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { mapActions, mapGetters } from 'vuex'
import FileActions from '../../mixins/fileActions'
import MixinAcceptShare from '../../mixins/actions/acceptShare'
import MixinDeclineShare from '../../mixins/actions/declineShare'
import { useCapabilityShareJailEnabled, useStore } from 'web-pkg/src/composables'
import { createLocationSpaces } from '../../router'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import { ShareStatus } from 'web-client/src/helpers/share'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useSelectedResources } from '../../composables/selection'
import { SortDir } from '../../composables'
import { RouteLocationNamedRaw } from 'vue-router'
import { buildShareSpaceResource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { CreateTargetRouteOptions } from '../../helpers/folderLink'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    ResourceTable,
    ContextActions,
    ListInfo,
    NoContentMessage
  },

  mixins: [FileActions, MixinAcceptShare, MixinDeclineShare],
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
      type: Array,
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
      type: Function,
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
    groupingSettings: {
      type: Object,
      required: false,
      default: null
    }
  },
  setup() {
    const store = useStore()
    const hasShareJail = useCapabilityShareJailEnabled()
    const resourceTargetRouteCallback = ({
      path,
      fileId,
      resource
    }: CreateTargetRouteOptions): RouteLocationNamedRaw => {
      if (unref(hasShareJail)) {
        const space = buildShareSpaceResource({
          shareId: resource.id,
          shareName: resource.name,
          serverUrl: configurationManager.serverUrl
        })
        return createLocationSpaces(
          'files-spaces-generic',
          createFileRouteOptions(space, { path, fileId })
        )
      }
      const personalSpace = store.getters['runtime/spaces/spaces'].find(
        (space) => space.driveType === 'personal'
      )
      return createLocationSpaces(
        'files-spaces-generic',
        createFileRouteOptions(personalSpace, { path, fileId })
      )
    }

    const personalSpace = computed(() => {
      return store.getters['runtime/spaces/spaces'].find((space) => space.driveType === 'personal')
    })

    return {
      resourceTargetRouteCallback,
      ...useSelectedResources({ store }),
      hasShareJail: useCapabilityShareJailEnabled(),
      personalSpace
    }
  },

  data: () => ({
    ShareStatus,
    showMore: false
  }),

  computed: {
    ...mapGetters(['configuration']),

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
    },
    createShareSpace(resource) {
      if (!this.hasShareJail) {
        return this.personalSpace
      }
      return buildShareSpaceResource({
        shareId: resource.shareId,
        shareName: resource.name,
        serverUrl: configurationManager.serverUrl
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.files-empty {
  height: auto;
}
</style>
