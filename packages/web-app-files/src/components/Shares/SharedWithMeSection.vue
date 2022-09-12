<template>
  <div>
    <no-content-message v-if="!items.length" class="files-empty oc-flex-stretch" icon="group">
      <template #message>
        <span>{{ emptyMessage }}</span>
      </template>
    </no-content-message>
    <resource-table
      v-else
      v-model="selectedResourcesIds"
      :data-test-share-status="shareStatus"
      class="files-table"
      :class="{ 'files-table-squashed': sideBarOpen }"
      :fields-displayed="displayedFields"
      sidebar-closed
      :are-thumbnails-displayed="displayThumbnails"
      :resources="resourceItems"
      :are-resources-clickable="resourceClickable"
      :target-route="resourceTargetLocation"
      :target-route-param-mapping="resourceTargetParamMapping"
      :target-route-query-mapping="resourceTargetQueryMapping"
      :header-position="fileListHeaderY"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      :grouping-settings="groupingSettings"
      @fileClick="$_fileActions_triggerDefaultAction"
      @rowMounted="rowMounted"
      @sort="sortHandler"
    >
      <template #status="{ resource }">
        <div
          :key="resource.getDomSelector() + resource.status"
          class="oc-text-nowrap oc-flex oc-flex-middle oc-flex-right"
        >
          <oc-button
            v-if="getShowUnhideButton(resource)"
            size="small"
            class="file-row-share-status-accept"
            @click.stop="$_unhideShare_trigger({ resources: [resource] })"
          >
            <oc-icon size="small" name="eye" />
            <translate>Unhide</translate>
          </oc-button>
          <oc-button
            v-if="getShowHideButton(resource)"
            size="small"
            class="file-row-share-decline oc-ml-s"
            @click.stop="$_hideShare_trigger({ resources: [resource] })"
          >
            <oc-icon size="small" name="eye-off" />
            <translate>Hide</translate>
          </oc-button>
        </div>
      </template>
      <!-- <template #quickActions="{ resource }">
        <quick-actions
          :class="resource.preview"
          class="oc-visible@s"
          :item="resource"
          :actions="app.quickActions"
          :methods="[$_hideShare_trigger, $_unhideShare_trigger]"
        />
      </template>-->
      <template #contextMenu>
        <context-actions :items="selectedResources" />
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
import { computed, defineComponent, unref } from '@vue/composition-api'
import debounce from 'lodash-es/debounce'
import { ImageDimension, ImageType } from '../../constants'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import FileActions from '../../mixins/fileActions'
import MixinUnhideShare from '../../mixins/actions/unhideShare'
import MixinHideShare from '../../mixins/actions/hideShare'
import { useCapabilityShareJailEnabled, useStore } from 'web-pkg/src/composables'
import { createLocationSpaces } from '../../router'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import { ShareStatus } from 'web-client/src/helpers/share'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useSelectedResources } from '../../composables/selection'
import { SortDir } from '../../composables'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    ResourceTable,
    ContextActions,
    ListInfo,
    NoContentMessage
  },

  mixins: [FileActions, MixinUnhideShare, MixinHideShare],

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
    const resourceTargetLocation = computed(() =>
      unref(hasShareJail)
        ? createLocationSpaces('files-spaces-share')
        : createLocationSpaces('files-spaces-personal', {
            params: { storageId: store.getters.user.id }
          })
    )
    const resourceTargetParamMapping = computed(() =>
      unref(hasShareJail) ? { name: 'shareName', path: 'item' } : undefined
    )
    const resourceTargetQueryMapping = computed(() =>
      unref(hasShareJail) ? { id: 'shareId' } : undefined
    )

    return {
      resourceTargetLocation,
      resourceTargetParamMapping,
      resourceTargetQueryMapping,
      ...useSelectedResources({ store })
    }
  },

  data: () => ({
    ShareStatus,
    showMore: false
  }),

  computed: {
    ...mapGetters(['configuration']),

    displayedFields() {
      return ['name', 'owner', 'sdate', 'sharedWith', 'status']
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

      visibilityObserver.observe(component.$el, {
        onEnter: debounced,
        onExit: debounced.cancel
      })
    },
    getShowUnhideButton(resource) {
      return resource.status === ShareStatus.declined
    },
    getShowHideButton(resource) {
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
