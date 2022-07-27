<template>
  <div>
    <h2 class="oc-px-m oc-py-s">
      {{ title }}
      <span class="oc-text-initial">({{ items.length }})</span>
    </h2>

    <no-content-message
      v-if="!items.length > 0"
      :id="noContentMessageId"
      class="files-empty oc-flex-stretch"
      icon="group"
    >
      <template #message>
        <span>{{ emptyMessage }}</span>
      </template>
    </no-content-message>
    <resource-table
      v-else
      :id="tableId"
      v-model="itemsSelected"
      :data-test-share-status="shareStatus"
      class="files-table"
      :class="{ 'files-table-squashed': !sidebarClosed }"
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
            v-if="showAcceptButton"
            size="small"
            variation="success"
            class="file-row-share-status-accept"
            @click.stop="$_acceptShare_trigger({ resources: [resource] })"
          >
            <oc-icon size="small" name="check" />
            <translate>Accept</translate>
          </oc-button>
          <oc-button
            v-if="showDeclineButton"
            size="small"
            class="file-row-share-decline oc-ml-s"
            @click.stop="$_declineShare_trigger({ resources: [resource] })"
          >
            <oc-icon size="small" name="close" />
            <translate>Decline</translate>
          </oc-button>
        </div>
      </template>
      <template #contextMenu>
        <context-actions :items="itemsSelected" />
      </template>
      <template #footer>
        <div v-if="showMoreLessToggle && hasMore" class="oc-width-1-1 oc-text-center oc-mt">
          <oc-button
            id="files-shared-with-me-pending-show-all"
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
          v-else-if="items.length > 0"
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
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import FileActions from '../../mixins/fileActions'
import MixinAcceptShare from '../../mixins/actions/acceptShare'
import MixinDeclineShare from '../../mixins/actions/declineShare'
import MixinFilesListFilter from '../../mixins/filesListFilter'
import MixinMountSideBar from '../../mixins/sidebar/mountSideBar'
import { useResourcesViewDefaults } from '../../composables'
import { Resource } from '../../helpers/resource'
import { useCapabilityShareJailEnabled, useStore } from 'web-pkg/src/composables'
import { createLocationSpaces } from '../../router'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import { ShareStatus } from '../../helpers/share'
import ContextActions from '../../components/FilesList/ContextActions.vue'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    ResourceTable,
    ContextActions,
    ListInfo
  },

  mixins: [
    FileActions,
    MixinAcceptShare,
    MixinDeclineShare,
    MixinMountSideBar,
    MixinFilesListFilter
  ],
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
      required: true
    },
    sortDir: {
      type: String,
      required: true
    },
    sortHandler: {
      type: Function,
      required: true
    },
    showMoreLessToggle: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { fileListHeaderY } = useResourcesViewDefaults<Resource, any, any[]>()

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
      fileListHeaderY
    }
  },

  data: () => ({
    ShareStatus,
    showMore: false
  }),

  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    ...mapGetters(['configuration']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    displayedFields() {
      return ['name', 'status', 'owner', 'sdate', 'sharedWith']
    },
    countFiles() {
      return this.items.filter((s) => s.type !== 'folder').length
    },
    countFolders() {
      return this.items.filter((s) => s.type === 'folder').length
    },
    showAcceptButton() {
      return this.shareStatus === ShareStatus.declined || this.shareStatus === ShareStatus.pending
    },
    showDeclineButton() {
      return this.shareStatus === ShareStatus.accepted || this.shareStatus === ShareStatus.pending
    },
    itemsSelected: {
      get() {
        return this.selectedFiles.filter((r) => r.status === this.shareStatus)
      },
      set(resources) {
        this.SET_FILE_SELECTION(resources.filter((r) => r.status === this.shareStatus))
      }
    },
    displayThumbnails() {
      return (
        !this.configuration?.options?.disablePreviews && this.shareStatus === ShareStatus.accepted
      )
    },
    resourceClickable() {
      return this.shareStatus === ShareStatus.accepted
    },
    toggleMoreLabel() {
      return this.showMore ? this.$gettext('Show less') : this.$gettext('Show more')
    },
    hasMore() {
      return this.items.length > 3
    },
    resourceItems() {
      if (!this.showMoreLessToggle || this.showMore) {
        return this.items
      }
      return this.items.slice(0, 3)
    },
    tableId() {
      switch (this.shareStatus) {
        case ShareStatus.pending:
          return 'files-shared-with-me-pending-table'
        case ShareStatus.accepted:
          return 'files-shared-with-me-accepted-table'
        case ShareStatus.declined:
          return 'files-shared-with-me-declined-table'
        default:
          return ''
      }
    },
    noContentMessageId() {
      switch (this.shareStatus) {
        case ShareStatus.pending:
          return 'files-shared-with-me-pending-empty'
        case ShareStatus.accepted:
          return 'files-shared-with-me-accepted-empty'
        case ShareStatus.declined:
          return 'files-shared-with-me-declined-empty'
        default:
          return ''
      }
    }
  },
  beforeDestroy() {
    visibilityObserver.disconnect()
  },
  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview', 'loadAvatars']),
    ...mapMutations('Files', ['LOAD_FILES', 'SET_FILE_SELECTION', 'CLEAR_CURRENT_FILES_LIST']),

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

    toggleShowMore() {
      this.showMore = !this.showMore
    }
  }
})
</script>
