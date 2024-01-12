<template>
  <oc-table
    v-bind="$attrs"
    :class="[
      hoverableQuickActions && 'hoverable-quick-actions',
      { condensed: viewMode === ViewModeConstants.condensedTable.name }
    ]"
    :data="resources"
    :fields="fields"
    :highlighted="selectedIds"
    :disabled="disabledResources"
    :sticky="true"
    :header-position="headerPosition"
    :drag-drop="dragDrop"
    :hover="hover"
    :item-dom-selector="resourceDomSelector"
    :selection="selectedResources"
    :sort-by="sortBy"
    :sort-dir="sortDir"
    :lazy="lazyLoading"
    :grouping-settings="groupingSettings"
    padding-x="medium"
    @highlight="fileClicked"
    @row-mounted="rowMounted"
    @contextmenu-clicked="showContextMenu"
    @item-dropped="fileDropped"
    @item-dragged="fileDragged"
    @drop-row-styling="dropRowStyling"
    @sort="sort"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-if="!isLocationPicker" #selectHeader>
      <div class="resource-table-select-all">
        <oc-checkbox
          id="resource-table-select-all"
          size="large"
          :label="allResourcesCheckboxLabel"
          :hide-label="true"
          :model-value="areAllResourcesSelected"
          @update:model-value="toggleSelectionAll"
        />
      </div>
    </template>
    <template v-if="!isLocationPicker" #select="{ item }">
      <oc-checkbox
        :id="`resource-table-select-${resourceDomSelector(item)}`"
        :label="getResourceCheckboxLabel(item)"
        :hide-label="true"
        size="large"
        :model-value="isResourceSelected(item)"
        :outline="isLatestSelectedItem(item)"
        @update:model-value="setSelection($event, item)"
        @click.stop="fileClicked([item, $event, true])"
      />
    </template>
    <template #name="{ item }">
      <div
        class="resource-table-resource-wrapper"
        :class="[{ 'resource-table-resource-wrapper-limit-max-width': hasRenameAction(item) }]"
      >
        <slot name="image" :resource="item" />
        <resource-list-item
          :key="`${item.path}-${resourceDomSelector(item)}-${item.thumbnail}`"
          :resource="item"
          :path-prefix="getPathPrefix(item)"
          :is-path-displayed="arePathsDisplayed"
          :parent-folder-name="getParentFolderName(item)"
          :is-thumbnail-displayed="shouldDisplayThumbnails(item)"
          :is-icon-displayed="!$slots['image']"
          :is-extension-displayed="areFileExtensionsShown"
          :is-resource-clickable="isResourceClickable(item)"
          :folder-link="getFolderLink(item)"
          :parent-folder-link="getParentFolderLink(item)"
          :parent-folder-link-icon-additional-attributes="
            getParentFolderLinkIconAdditionalAttributes(item)
          "
          :class="{ 'resource-table-resource-cut': isResourceCut(item) }"
          @click="emitFileClick(item)"
        />
        <oc-button
          v-if="hasRenameAction(item)"
          class="resource-table-edit-name"
          appearance="raw"
          @click="openRenameDialog(item)"
        >
          <oc-icon name="edit-2" fill-type="line" size="small" />
        </oc-button>
      </div>
      <slot name="additionalResourceContent" :resource="item" />
    </template>
    <template #status="{ item }">
      <!-- @slot Status column -->
      <slot name="status" :resource="item" />
    </template>
    <template #size="{ item }">
      <resource-size :size="item.size || Number.NaN" />
    </template>
    <template #tags="{ item }">
      <component
        :is="userContextReady ? 'router-link' : 'span'"
        v-for="tag in item.tags.slice(0, 2)"
        :key="tag"
        v-bind="getTagComponentAttrs(tag)"
        class="resource-table-tag-wrapper"
      >
        <oc-tag
          v-oc-tooltip="getTagToolTip(tag)"
          class="resource-table-tag oc-ml-xs"
          :rounded="true"
          size="small"
        >
          <oc-icon name="price-tag-3" size="small" />
          <span class="oc-text-truncate">{{ tag }}</span>
        </oc-tag>
      </component>
      <oc-tag
        v-if="item.tags.length > 2"
        size="small"
        class="resource-table-tag-more"
        @click="openTagsSidebar"
      >
        + {{ item.tags.length - 2 }}
      </oc-tag>
    </template>
    <template #manager="{ item }">
      <slot name="manager" :resource="item" />
    </template>
    <template #members="{ item }">
      <slot name="members" :resource="item" />
    </template>
    <template #totalQuota="{ item }">
      <slot name="totalQuota" :resource="item" />
    </template>
    <template #usedQuota="{ item }">
      <slot name="usedQuota" :resource="item" />
    </template>
    <template #remainingQuota="{ item }">
      <slot name="remainingQuota" :resource="item" />
    </template>
    <template #mdate="{ item }">
      <span
        v-oc-tooltip="formatDate(item.mdate)"
        tabindex="0"
        v-text="formatDateRelative(item.mdate)"
      />
    </template>
    <template #indicators="{ item }">
      <oc-status-indicators
        v-if="item.indicators.length"
        :resource="item"
        :indicators="item.indicators"
      />
    </template>
    <template #sdate="{ item }">
      <span
        v-oc-tooltip="formatDate(item.sdate)"
        tabindex="0"
        v-text="formatDateRelative(item.sdate)"
      />
    </template>
    <template #ddate="{ item }">
      <span
        v-oc-tooltip="formatDate(item.ddate)"
        tabindex="0"
        v-text="formatDateRelative(item.ddate)"
      />
    </template>
    <template #owner="{ item }">
      <oc-button appearance="raw-inverse" variation="passive" @click="openSharingSidebar(item)">
        <oc-avatars
          class="resource-table-people"
          :items="item.owner"
          :is-tooltip-displayed="true"
          :accessible-description="getOwnerAvatarDescription(item)"
        />
      </oc-button>
    </template>
    <template #sharedWith="{ item }">
      <oc-button appearance="raw-inverse" variation="passive" @click="openSharingSidebar(item)">
        <oc-avatars
          class="resource-table-people"
          :items="item.sharedWith"
          :stacked="true"
          :max-displayed="3"
          :is-tooltip-displayed="true"
          :accessible-description="getSharedWithAvatarDescription(item)"
        />
      </oc-button>
    </template>
    <template #actions="{ item }">
      <div class="resource-table-actions">
        <!-- @slot Add quick actions before the `context-menu / three dot` button in the actions column -->
        <slot name="quickActions" :resource="item" />
        <context-menu-quick-action
          ref="contextMenuButton"
          :item="item"
          :resource-dom-selector="resourceDomSelector"
          class="resource-table-btn-action-dropdown"
          @quick-action-clicked="showContextMenuOnBtnClick($event, item)"
        >
          <template #contextMenu>
            <slot name="contextMenu" :resource="item" />
          </template>
        </context-menu-quick-action>
      </div>
    </template>
    <template v-if="$slots.footer" #footer>
      <!-- @slot Footer of the files table -->
      <slot name="footer" />
    </template>
  </oc-table>
  <Teleport v-if="dragItem" to="body">
    <resource-ghost-element ref="ghostElement" :preview-items="[dragItem, ...dragSelection]" />
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, unref, ref, ComputedRef } from 'vue'
import { mapGetters, mapActions, mapState } from 'vuex'
import { useWindowSize } from '@vueuse/core'
import { Resource } from '@ownclouders/web-client'
import { extractDomSelector, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { ShareStatus, ShareTypes } from '@ownclouders/web-client/src/helpers/share'

import {
  useCapabilityFilesTags,
  useCapabilityProjectSpacesEnabled,
  useCapabilityShareJailEnabled,
  SortDir,
  ViewModeConstants,
  useConfigurationManager,
  useGetMatchingSpace,
  useFolderLink,
  useEmbedMode,
  useAuthStore
} from '../../composables'
import ResourceListItem from './ResourceListItem.vue'
import ResourceGhostElement from './ResourceGhostElement.vue'
import ResourceSize from './ResourceSize.vue'
import { EVENT_TROW_MOUNTED, EVENT_FILE_DROPPED, ImageDimension } from '../../constants'
import { eventBus } from '../../services'
import {
  displayPositionedDropdown,
  formatDateFromJSDate,
  formatRelativeDateFromJSDate,
  isResourceTxtFileAlmostEmpty
} from '../../helpers'
import { SideBarEventTopics } from '../../composables/sideBar'
import ContextMenuQuickAction from '../ContextActions/ContextMenuQuickAction.vue'

import { useResourceRouteResolver } from '../../composables/filesList/useResourceRouteResolver'
import { ClipboardActions } from '../../helpers/clipboardActions'
import { determineSortFields } from '../../helpers/ui/resourceTable'
import { useFileActionsRename } from '../../composables/actions'
import { createLocationCommon } from '../../router'
import get from 'lodash-es/get'

// ODS component import is necessary here for CERN to overwrite OcTable
import OcTable from 'design-system/src/components/OcTable/OcTable.vue'
import { storeToRefs } from 'pinia'

const TAGS_MINIMUM_SCREEN_WIDTH = 850

export default defineComponent({
  components: {
    ContextMenuQuickAction,
    ResourceGhostElement,
    OcTable,
    ResourceListItem,
    ResourceSize
  },
  props: {
    /**
     * Resources to be displayed in the table.
     * Required fields:
     * - name: The name of the resource containing the file extension in case of a file
     * - path: The full path of the resource
     * - type: The type of the resource. Can be `file` or `folder`
     * Optional fields:
     * - thumbnail
     * - size: The size of the resource
     * - modificationDate: The date of the last modification of the resource
     * - shareDate: The date when the share was created
     * - deletionDate: The date when the resource has been deleted
     * - status: The status of the share. Contains also actions to accept/decline the share
     * - opensInNewWindow: Open the link in a new window
     */
    resources: {
      type: Array as PropType<Resource[]>,
      required: true
    },
    /**
     * Closure function to mutate the resource id into a valid DOM selector.
     */
    resourceDomSelector: {
      type: Function,
      required: false,
      default: (resource) => extractDomSelector(resource.id)
    },
    /**
     * Asserts whether resources path should be shown in the resource name
     */
    arePathsDisplayed: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Asserts whether icons should be replaced with thumbnails for resources which provide them
     */
    areThumbnailsDisplayed: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * V-model for the selection
     */
    selectedIds: {
      type: Array,
      default: () => []
    },
    /**
     * Asserts whether actions are available
     */
    hasActions: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * Accepts a `path` and a `resource` param and returns a corresponding route object.
     */
    targetRouteCallback: {
      type: Function,
      required: false,
      default: undefined
    },
    /**
     * Asserts whether clicking on the resource name triggers any action
     */
    areResourcesClickable: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * Top position of header used when the header is sticky in pixels
     */
    headerPosition: {
      type: Number,
      required: false,
      default: 0
    },
    /**
     * Asserts whether resources in the table can be selected
     */
    isSelectable: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * Sets the padding size for x axis
     * @values xsmall, small, medium, large, xlarge
     */
    paddingX: {
      type: String,
      required: false,
      default: 'small',
      validator: (size: string) => /(xsmall|small|medium|large|xlarge)/.test(size)
    },
    /**
     * Enable Drag & Drop events
     */
    dragDrop: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * The active view mode.
     */
    viewMode: {
      type: String,
      default: () => ViewModeConstants.defaultModeName,
      validator: (value: string) =>
        [ViewModeConstants.condensedTable.name, ViewModeConstants.default.name].includes(value)
    },
    /**
     * Enable hover effect
     */
    hover: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * Show that the table is sorted by this column (no actual sorting takes place)
     */
    sortBy: {
      type: String,
      required: false,
      default: undefined
    },
    /**
     * Define what fields should be displayed in the table
     * If null, all fields are displayed
     */
    fieldsDisplayed: {
      type: Array,
      required: false,
      default: null
    },
    /**
     * Show that the table is sorted ascendingly/descendingly (no actual sorting takes place)
     */
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
    /**
     * Space resource the provided resources originate from. Not required on meta pages like favorites, search, ...
     */
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
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
  emits: [
    'fileClick',
    'sort',
    'rowMounted',
    EVENT_FILE_DROPPED,
    'update:selectedIds',
    'update:modelValue'
  ],
  setup(props, context) {
    const configurationManager = useConfigurationManager()
    const { getMatchingSpace } = useGetMatchingSpace()
    const { isLocationPicker } = useEmbedMode()

    const authStore = useAuthStore()
    const { userContextReady } = storeToRefs(authStore)

    const dragItem = ref<Resource>()
    const ghostElement = ref()

    const { width } = useWindowSize()
    const hasTags = computed(
      () => useCapabilityFilesTags().value && width.value >= TAGS_MINIMUM_SCREEN_WIDTH
    )

    const { actions: renameActions } = useFileActionsRename()
    const renameHandler = computed(() => unref(renameActions)[0].handler)

    const getTagToolTip = (text: string) => (text.length > 7 ? text : '')

    const isResourceDisabled = (resource: Resource) => {
      return resource.processing === true
    }

    const disabledResources: ComputedRef<Array<Resource['id']>> = computed(() => {
      return (
        props.resources
          ?.filter((resource) => isResourceDisabled(resource) === true)
          ?.map((resource) => resource.id) || []
      )
    })

    return {
      configurationManager,
      dragItem,
      ghostElement,
      getTagToolTip,
      renameActions,
      renameHandler,
      ViewModeConstants,
      hasTags,
      disabledResources,
      isResourceDisabled,
      hasShareJail: useCapabilityShareJailEnabled(),
      hasProjectSpaces: useCapabilityProjectSpacesEnabled(),
      userContextReady,
      getMatchingSpace,
      ...useResourceRouteResolver(
        {
          space: ref(props.space),
          targetRouteCallback: computed(() => props.targetRouteCallback)
        },
        context
      ),
      ...useFolderLink({
        space: ref(props.space),
        targetRouteCallback: computed(() => props.targetRouteCallback)
      }),
      isLocationPicker
    }
  },
  data() {
    return {
      constants: {
        ImageDimension,
        EVENT_TROW_MOUNTED
      }
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapState('Files', [
      'areFileExtensionsShown',
      'latestSelectedId',
      'clipboardResources',
      'clipboardAction'
    ]),

    fields() {
      if (this.resources.length === 0) {
        return []
      }
      const firstResource = this.resources[0]
      const fields = []
      if (this.isSelectable) {
        fields.push({
          name: 'select',
          title: '',
          type: 'slot',
          headerType: 'slot',
          width: 'shrink'
        })
      }

      const sortFields = determineSortFields(firstResource)
      fields.push(
        ...[
          {
            name: 'name',
            title: this.$gettext('Name'),
            type: 'slot',
            width: 'expand',
            wrap: 'truncate'
          },

          {
            name: 'manager',
            prop: 'spaceRoles',
            title: this.$gettext('Manager'),
            type: 'slot'
          },
          {
            name: 'members',
            title: this.$gettext('Members'),
            prop: 'spaceRoles',
            type: 'slot'
          },
          {
            name: 'totalQuota',
            prop: 'spaceQuota.total',
            title: this.$gettext('Total quota'),
            type: 'slot',
            sortable: true
          },
          {
            name: 'usedQuota',
            prop: 'spaceQuota.used',
            title: this.$gettext('Used quota'),
            type: 'slot',
            sortable: true
          },
          {
            name: 'remainingQuota',
            prop: 'spaceQuota.remaining',
            title: this.$gettext('Remaining quota'),
            type: 'slot',
            sortable: true
          },
          {
            name: 'indicators',
            title: this.$gettext('Shares'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            width: 'shrink'
          },
          {
            name: 'size',
            title: this.$gettext('Size'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            width: 'shrink'
          },
          {
            name: 'status',
            title: this.$gettext('Status'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            width: 'shrink'
          },
          {
            name: 'status',
            prop: 'disabled',
            title: this.$gettext('Status'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            width: 'shrink'
          },
          this.hasTags
            ? {
                name: 'tags',
                title: this.$gettext('Tags'),
                type: 'slot',
                alignH: 'right',
                wrap: 'nowrap',
                width: 'shrink'
              }
            : {},
          {
            name: 'owner',
            title: this.$gettext('Shared by'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            width: 'shrink'
          },
          {
            name: 'sharedWith',
            title: this.$gettext('Shared with'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            width: 'shrink'
          },
          {
            name: 'mdate',
            title: this.$gettext('Modified'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            width: 'shrink',
            accessibleLabelCallback: (item) =>
              this.formatDateRelative(item.mdate) + ' (' + this.formatDate(item.mdate) + ')'
          },
          {
            name: 'sdate',
            title: this.$gettext('Shared on'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            width: 'shrink',
            accessibleLabelCallback: (item) =>
              this.formatDateRelative(item.sdate) + ' (' + this.formatDate(item.sdate) + ')'
          },
          {
            name: 'ddate',
            title: this.$gettext('Deleted'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            width: 'shrink',
            accessibleLabelCallback: (item) =>
              this.formatDateRelative(item.ddate) + ' (' + this.formatDate(item.ddate) + ')'
          }
        ]
          .filter((field) => {
            let hasField
            if (field.prop) {
              hasField = get(firstResource, field.prop) !== undefined
            } else {
              hasField = Object.prototype.hasOwnProperty.call(firstResource, field.name)
            }
            if (!this.fieldsDisplayed) {
              return hasField
            }
            return hasField && this.fieldsDisplayed.includes(field.name)
          })
          .map((field) => {
            const sortField = sortFields.find((f) => f.name === field.name)
            if (sortField) {
              Object.assign(field, {
                sortable: sortField.sortable,
                sortDir: sortField.sortDir
              })
            }
            return field
          })
      )
      if (this.hasActions) {
        fields.push({
          name: 'actions',
          title: this.$gettext('Actions'),
          type: 'slot',
          alignH: 'right',
          wrap: 'nowrap',
          width: 'shrink'
        })
      }

      return fields
    },
    lazyLoading() {
      return this.configuration?.options?.displayResourcesLazy
    },
    areAllResourcesSelected() {
      return this.selectedResources.length === this.resources.length - this.disabledResources.length
    },
    selectedResources() {
      return this.resources.filter((resource) => this.selectedIds.includes(resource.id))
    },
    allResourcesCheckboxLabel() {
      return this.$gettext('Select all resources')
    },
    contextMenuLabel() {
      return this.$gettext('Show context menu')
    },
    hoverableQuickActions() {
      return this.configuration?.options?.hoverableQuickActions
    },
    dragSelection() {
      const selection = [...this.selectedResources]
      selection.splice(
        selection.findIndex((i) => i.id === this.dragItem.id),
        1
      )
      return selection
    }
  },
  methods: {
    ...mapActions('Files', ['toggleFileSelection']),

    isResourceSelected(item) {
      return this.selectedIds.includes(item.id)
    },
    isResourceCut(resource) {
      if (this.clipboardAction !== ClipboardActions.Cut) {
        return false
      }
      return this.clipboardResources.some((r) => r.id === resource.id)
    },
    shouldDisplayThumbnails(item) {
      return this.areThumbnailsDisplayed && !isResourceTxtFileAlmostEmpty(item)
    },
    getTagLink(tag: string) {
      const currentTerm = unref(this.$router.currentRoute).query?.term
      return createLocationCommon('files-common-search', {
        query: { provider: 'files.sdk', q_tags: tag, ...(currentTerm && { term: currentTerm }) }
      })
    },
    getTagComponentAttrs(tag) {
      if (!this.userContextReady) {
        return {}
      }

      return {
        to: this.getTagLink(tag)
      }
    },
    isLatestSelectedItem(item) {
      return item.id === this.latestSelectedId
    },
    hasRenameAction(item) {
      return this.renameActions.filter((menuItem) =>
        menuItem.isEnabled({ space: this.space, resources: [item] })
      ).length
    },
    openRenameDialog(item) {
      this.renameHandler({
        space: this.getMatchingSpace(item),
        resources: [item]
      })
    },
    openTagsSidebar() {
      eventBus.publish(SideBarEventTopics.open)
    },
    openSharingSidebar(file: Resource) {
      let panelToOpen
      if (file.type === 'space') {
        panelToOpen = 'space-share'
      } else if (file.share?.shareType === ShareTypes.link.value) {
        panelToOpen = 'sharing#linkShares'
      } else {
        panelToOpen = 'sharing#peopleShares'
      }
      eventBus.publish(SideBarEventTopics.openWithPanel, panelToOpen)
    },
    async fileDragged(file: Resource, event) {
      if (!this.dragDrop) {
        return
      }

      await this.setDragItem(file, event)

      this.addSelectedResource(file)
    },
    fileDropped(selector: HTMLElement, event) {
      if (!this.dragDrop) {
        return
      }
      const hasFilePayload = (event.dataTransfer.types || []).some((e) => e === 'Files')
      if (hasFilePayload) {
        return
      }
      this.dragItem = null
      const dropTarget = event.target
      const dropTargetTr = dropTarget.closest('tr')
      const dropItemId = dropTargetTr.dataset.itemId
      this.dropRowStyling(selector, true, event)

      this.$emit(EVENT_FILE_DROPPED, dropItemId)
    },
    async setDragItem(item: Resource, event) {
      this.dragItem = item
      await this.$nextTick()
      this.ghostElement.$el.ariaHidden = 'true'
      this.ghostElement.$el.style.left = '-99999px'
      this.ghostElement.$el.style.top = '-99999px'
      event.dataTransfer.setDragImage(this.ghostElement.$el, 0, 0)
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
    },
    dropRowStyling(selector: HTMLElement, leaving: boolean, event) {
      const hasFilePayload = (event.dataTransfer?.types || []).some((e) => e === 'Files')
      if (hasFilePayload) {
        return
      }
      if (event.currentTarget?.contains(event.relatedTarget)) {
        return
      }

      const classList = document.getElementsByClassName(`oc-tbody-tr-${selector}`)[0].classList
      const className = 'highlightedDropTarget'
      leaving ? classList.remove(className) : classList.add(className)
    },
    sort(opts) {
      this.$emit('sort', opts)
    },
    addSelectedResource(file) {
      const isSelected = this.isResourceSelected(file)
      if (isSelected) {
        return
      }
      this.toggleFileSelection(file)
    },
    showContextMenuOnBtnClick(data, item) {
      if (this.isResourceDisabled(item)) {
        return false
      }

      const { dropdown, event } = data
      if (dropdown?.tippy === undefined) {
        return
      }
      if (!this.isResourceSelected(item)) {
        this.emitSelect([item.id])
      }
      displayPositionedDropdown(dropdown.tippy, event, this.$refs.contextMenuButton)
    },
    showContextMenu(row, event, item) {
      event.preventDefault()

      if (this.isResourceDisabled(item)) {
        return false
      }

      const instance = row.$el.getElementsByClassName('resource-table-btn-action-dropdown')[0]
      if (instance === undefined) {
        return
      }
      if (!this.isResourceSelected(item)) {
        this.emitSelect([item.id])
      }
      displayPositionedDropdown(instance._tippy, event, this.$refs.contextMenuButton)
    },
    rowMounted(resource, component) {
      /**
       * Triggered whenever a row is mounted
       * @property {object} resource The resource which was mounted as table row
       * @property {object} component The table row component
       */
      this.$emit('rowMounted', resource, component, this.constants.ImageDimension.Thumbnail)
    },
    fileClicked(data) {
      /**
       * Triggered when the file row is clicked
       * @property {object} resource The resource for which the event is triggered
       */
      const resource = data[0]

      if (this.isResourceDisabled(resource)) {
        return
      }

      const eventData = data[1]
      const skipTargetSelection = data[2] ?? false

      const isCheckboxClicked = eventData?.target.getAttribute('type') === 'checkbox'
      const contextActionClicked = eventData?.target?.closest('div')?.id === 'oc-files-context-menu'
      if (contextActionClicked) {
        return
      }
      if (eventData && eventData.metaKey) {
        return eventBus.publish('app.files.list.clicked.meta', resource)
      }
      if (eventData && eventData.shiftKey) {
        return eventBus.publish('app.files.list.clicked.shift', { resource, skipTargetSelection })
      }
      if (isCheckboxClicked) {
        return
      }
      return this.emitSelect([resource.id])
    },
    formatDate(date) {
      return formatDateFromJSDate(new Date(date), this.$language.current)
    },
    formatDateRelative(date) {
      return formatRelativeDateFromJSDate(new Date(date), this.$language.current)
    },
    setSelection(selected, resource) {
      if (selected) {
        this.emitSelect([...this.selectedIds, resource.id])
      } else {
        this.emitSelect(this.selectedIds.filter((id) => id !== resource.id))
      }
    },
    emitSelect(selectedIds) {
      eventBus.publish('app.files.list.clicked')
      this.$emit('update:selectedIds', selectedIds)
    },
    toggleSelectionAll() {
      if (this.areAllResourcesSelected) {
        return this.emitSelect([])
      }
      this.emitSelect(
        this.resources
          .filter((resource) => !this.disabledResources.includes(resource.id))
          .map((resource) => resource.id)
      )
    },
    emitFileClick(resource) {
      const space = this.getMatchingSpace(resource)

      /**
       * Triggered when a default action is triggered on a file
       * @property {object} resource resource for which the event is triggered
       */
      this.$emit('fileClick', { space, resources: [resource] })
    },
    isResourceClickable({ id, status }: Resource) {
      if (!this.areResourcesClickable) {
        return false
      }

      // TODO: remove as soon as pending & declined shares are accessible
      if (status === ShareStatus.pending || status === ShareStatus.declined) {
        return false
      }

      return !this.disabledResources.includes(id)
    },
    getResourceCheckboxLabel(resource) {
      if (resource.type === 'folder') {
        return this.$gettext('Select folder')
      }
      return this.$gettext('Select file')
    },
    getSharedWithAvatarDescription(resource) {
      const resourceType =
        resource.type === 'folder' ? this.$gettext('folder') : this.$gettext('file')
      const shareCount = resource.sharedWith.filter((u) => !u.link).length
      const linkCount = resource.sharedWith.filter((u) => !!u.link).length
      const shareText =
        shareCount > 0
          ? this.$ngettext(
              'This %{ resourceType } is shared via %{ shareCount } invite',
              'This %{ resourceType } is shared via %{ shareCount } invites',
              shareCount
            )
          : ''
      const linkText =
        linkCount > 0
          ? this.$ngettext(
              'This %{ resourceType } is shared via %{ linkCount } link',
              'This %{ resourceType } is shared via %{ linkCount } links',
              linkCount
            )
          : ''
      const description = [shareText, linkText].join(' ')
      return this.$gettext(description, {
        resourceType,
        shareCount,
        linkCount
      })
    },
    getOwnerAvatarDescription(resource: Resource) {
      const resourceType =
        resource.type === 'folder' ? this.$gettext('folder') : this.$gettext('file')
      return this.$gettext('This %{ resourceType } is owned by %{ ownerName }', {
        resourceType,
        ownerName: resource.owner[0].displayName
      })
    }
  }
})
</script>
<style lang="scss">
.oc-table.condensed > tbody > tr {
  height: 0 !important;
}

.resource-table {
  &-resource-cut {
    opacity: 0.6;
  }

  &-resource-wrapper {
    display: flex;
    align-items: center;

    &-limit-max-width {
      max-width: calc(100% - var(--oc-space-medium));
    }

    &:hover > .resource-table-edit-name {
      svg {
        fill: var(--oc-color-text-default);
      }
    }
  }

  &-tag {
    max-width: 80px;
  }

  &-tag-more {
    cursor: pointer;
    border: 0 !important;
    vertical-align: text-bottom;
  }

  &-edit-name {
    display: inline-flex;
    margin-left: var(--oc-space-xsmall);

    svg {
      fill: var(--oc-color-text-muted);
    }
  }

  &-people {
    position: absolute;
    right: var(--oc-space-xsmall);
    top: 50%;
    transform: translateY(-50%);
  }

  &-actions {
    align-items: center;
    display: flex;
    flex-flow: row nowrap;
    gap: var(--oc-space-xsmall);
    justify-content: flex-end;
  }

  &-select-all {
    align-items: center;
    display: flex;
    justify-content: center;
  }
}

.hoverable-quick-actions.files-table {
  @media (pointer: fine) {
    tr:not([class*='oc-table-highlighted']) {
      .resource-table-edit-name,
      .resource-table-actions div:first-child {
        visibility: hidden;
      }
    }
    tr:not([class*='oc-table-highlighted']):hover {
      .resource-table-edit-name,
      .resource-table-actions div:first-child {
        visibility: visible;
      }
    }
  }
}

.spaces-table {
  .oc-table-header-cell-mdate,
  .oc-table-data-cell-mdate,
  .oc-table-header-cell-manager,
  .oc-table-data-cell-manager,
  .oc-table-header-cell-remainingQuota,
  .oc-table-data-cell-remainingQuota {
    display: none;

    @media only screen and (min-width: 960px) {
      display: table-cell;
    }
  }

  .oc-table-header-cell-totalQuota,
  .oc-table-data-cell-totalQuota,
  .oc-table-header-cell-usedQuota,
  .oc-table-data-cell-usedQuota {
    display: none;

    @media only screen and (min-width: 1200px) {
      display: table-cell;
    }
  }

  &-squashed {
    /**
     * squashed = right sidebar is open.
     * same media queries as above but +440px width of the right sidebar
     * (because the right sidebar steals 440px from the file list)
     */
    .oc-table-header-cell-status,
    .oc-table-data-cell-status,
    .oc-table-header-cell-manager,
    .oc-table-data-cell-manager,
    .oc-table-header-cell-totalQuota,
    .oc-table-data-cell-totalQuota,
    .oc-table-header-cell-usedQuota,
    .oc-table-data-cell-usedQuota {
      display: none;

      @media only screen and (min-width: 1400px) {
        display: table-cell;
      }
    }

    .oc-table-header-cell-mdate,
    .oc-table-data-cell-mdate,
    .oc-table-header-cell-remainingQuota,
    .oc-table-data-cell-remainingQuota,
    .oc-table-header-cell-mdate,
    .oc-table-data-cell-mdate {
      display: none;

      @media only screen and (min-width: 1600px) {
        display: table-cell;
      }
    }
  }
}

// Hide files table columns
.files-table {
  .oc-table-header-cell-size,
  .oc-table-data-cell-size,
  .oc-table-header-cell-sharedWith,
  .oc-table-data-cell-sharedWith,
  .oc-table-header-cell-owner,
  .oc-table-data-cell-owner,
  .oc-table-header-cell-status,
  .oc-table-data-cell-status {
    display: none;

    @media only screen and (min-width: 640px) {
      display: table-cell;
    }
  }

  .oc-table-header-cell-mdate,
  .oc-table-data-cell-mdate,
  .oc-table-header-cell-sdate,
  .oc-table-data-cell-sdate,
  .oc-table-header-cell-ddate,
  .oc-table-data-cell-ddate {
    display: none;

    @media only screen and (min-width: 960px) {
      display: table-cell;
    }
  }

  .oc-table-header-cell-owner,
  .oc-table-data-cell-owner,
  .oc-table-header-cell-tags,
  .oc-table-data-cell-tags,
  .oc-table-header-cell-indicators,
  .oc-table-data-cell-indicators {
    display: none;

    @media only screen and (min-width: 1200px) {
      display: table-cell;
    }
  }

  &-squashed {
    /**
     * squashed = right sidebar is open.
     * same media queries as above but +440px width of the right sidebar
     * (because the right sidebar steals 440px from the file list)
     */
    .oc-table-header-cell-size,
    .oc-table-data-cell-size,
    .oc-table-header-cell-sharedWith,
    .oc-table-data-cell-sharedWith,
    .oc-table-header-cell-owner,
    .oc-table-data-cell-owner,
    .oc-table-header-cell-status,
    .oc-table-data-cell-status {
      display: none;

      @media only screen and (min-width: 1080px) {
        display: table-cell;
      }
    }

    .oc-table-header-cell-mdate,
    .oc-table-data-cell-mdate,
    .oc-table-header-cell-sdate,
    .oc-table-data-cell-sdate,
    .oc-table-header-cell-ddate,
    .oc-table-data-cell-ddate {
      display: none;

      @media only screen and (min-width: 1400px) {
        display: table-cell;
      }
    }

    .oc-table-header-cell-owner,
    .oc-table-data-cell-owner,
    .oc-table-header-cell-tags,
    .oc-table-data-cell-tags,
    .oc-table-header-cell-indicators,
    .oc-table-data-cell-indicators {
      display: none;

      @media only screen and (min-width: 1640px) {
        display: table-cell;
      }
    }
  }
}

// shared with me: on tablets hide shared with column and display owner column instead
#files-shared-with-me-pending-section .files-table .oc-table-header-cell-owner,
#files-shared-with-me-pending-section .files-table .oc-table-data-cell-owner,
#files-shared-with-me-accepted-section .files-table .oc-table-header-cell-owner,
#files-shared-with-me-accepted-section .files-table .oc-table-data-cell-owner,
#files-shared-with-me-declined-section .files-table .oc-table-header-cell-owner,
#files-shared-with-me-declined-section .files-table .oc-table-data-cell-owner {
  @media only screen and (min-width: 640px) {
    display: table-cell;
  }
}

#files-shared-with-me-pending-section .files-table .oc-table-header-cell-sharedWith,
#files-shared-with-me-pending-section .files-table .oc-table-data-cell-sharedWith,
#files-shared-with-me-accepted-section .files-table .oc-table-header-cell-sharedWith,
#files-shared-with-me-accepted-section .files-table .oc-table-data-cell-sharedWith,
#files-shared-with-me-declined-section .files-table .oc-table-header-cell-sharedWith,
#files-shared-with-me-declined-section .files-table .oc-table-data-cell-sharedWith {
  @media only screen and (max-width: 1199px) {
    display: none;
  }
}

.oc-resource-icon-status-badge,
.oc-resource-thumbnail-status-badge {
  .oc-icon {
    margin-top: -2px;
    margin-left: -1.5px;

    svg {
      fill: var(--oc-color-background-default) !important;
    }
  }

  .oc-spinner {
    margin-left: -2px;
    margin-top: -2px;
    color: var(--oc-color-background-default) !important;
  }
}

// reduce the bottom spacing of the status badge in condensed mode
.condensed {
  .oc-resource-icon-status-badge {
    bottom: 2px !important;
  }
}

// on table row hover change the status badge background color
.oc-tbody-tr:hover .oc-resource-icon-status-badge {
  background: var(--oc-color-background-hover) !important;

  .oc-icon {
    svg {
      fill: var(--oc-color-background-hover) !important;
    }
  }

  .oc-spinner {
    color: var(--oc-color-background-hover) !important;
  }
}

// on table row highlight change the status badge background color
.oc-table-highlighted .oc-resource-icon-status-badge {
  background: var(--oc-color-background-highlight) !important;

  .oc-icon {
    svg {
      fill: var(--oc-color-background-highlight) !important;
    }
  }

  .oc-spinner {
    color: var(--oc-color-background-highlight) !important;
  }
}
</style>
