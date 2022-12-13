<template>
  <component
    :is="table"
    :class="[
      hoverableQuickActions && 'hoverable-quick-actions',
      { condensed: viewMode === ViewModeConstants.condensedTable.name }
    ]"
    :data="resources"
    :fields="fields"
    :highlighted="selectedIds"
    :disabled="disabled"
    :sticky="true"
    :grouping-settings="groupingSettings"
    :header-position="headerPosition"
    :drag-drop="dragDrop"
    :hover="hover"
    :item-dom-selector="resourceDomSelector"
    :selection="selectedResources"
    :sort-by="sortBy"
    :sort-dir="sortDir"
    :lazy="lazyLoading"
    padding-x="medium"
    @highlight="fileClicked"
    @row-mounted="rowMounted"
    @contextmenu-clicked="showContextMenu"
    @item-dropped="fileDropped"
    @item-dragged="fileDragged"
    @sort="sort"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #selectHeader>
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
    <template #select="{ item }">
      <oc-checkbox
        :id="`resource-table-select-${resourceDomSelector(item)}`"
        :label="getResourceCheckboxLabel(item)"
        :hide-label="true"
        size="large"
        :model-value="isResourceSelected(item)"
        :outline="isLatestSelectedItem(item)"
        @update:model-value="setSelection($event, item)"
        @click.stop
      />
    </template>
    <template #name="{ item }">
      <div
        class="resource-table-resource-wrapper"
        :class="[{ 'resource-table-resource-wrapper-limit-max-width': hasRenameAction(item) }]"
      >
        <oc-resource
          :key="`${item.path}-${resourceDomSelector(item)}-${item.thumbnail}`"
          :resource="item"
          :is-path-displayed="getArePathsDisplayed(item)"
          :parent-folder-name-default="getDefaultParentFolderName(item)"
          :is-thumbnail-displayed="shouldDisplayThumbnails(item)"
          :is-extension-displayed="areFileExtensionsShown"
          :is-resource-clickable="isResourceClickable(item.id)"
          :folder-link="folderLink(item)"
          :parent-folder-link="parentFolderLink(item)"
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
    </template>
    <template #status="{ item }">
      <!-- @slot Status column -->
      <slot name="status" :resource="item" />
    </template>
    <template #size="{ item }">
      <oc-resource-size :size="item.size || Number.NaN" />
    </template>
    <template #tags="{ item }">
      <component
        :is="isUserContext ? 'router-link' : 'span'"
        v-for="tag in item.tags.slice(0, 2)"
        :key="tag"
        v-bind="getTagComponentAttrs(tag)"
        class="resource-table-tag-wrapper"
      >
        <oc-tag class="resource-table-tag oc-ml-xs" :rounded="true" size="small">
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
      <oc-button appearance="raw" variation="inverse" @click="openSharingSidebar(item)">
        <oc-avatars
          class="resource-table-people"
          :items="item.owner"
          :is-tooltip-displayed="true"
          :accessible-description="getOwnerAvatarDescription(item)"
        />
      </oc-button>
    </template>
    <template #sharedWith="{ item }">
      <oc-button appearance="raw" variation="inverse" @click="openSharingSidebar(item)">
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
  </component>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { mapGetters, mapActions, mapState } from 'vuex'
import { basename, dirname } from 'path'
import { useWindowSize } from '@vueuse/core'
import { Resource } from 'web-client'
import { buildShareSpaceResource, extractDomSelector, SpaceResource } from 'web-client/src/helpers'
import { ShareTypes } from 'web-client/src/helpers/share'

import {
  useCapabilityFilesTags,
  useCapabilityProjectSpacesEnabled,
  useCapabilityShareJailEnabled,
  useStore,
  useUserContext
} from 'web-pkg/src/composables'
import { EVENT_TROW_MOUNTED, EVENT_FILE_DROPPED, ImageDimension } from 'web-pkg/src/constants'
import { eventBus } from 'web-pkg/src/services/eventBus'
import {
  displayPositionedDropdown,
  formatDateFromJSDate,
  formatRelativeDateFromJSDate
} from 'web-pkg/src/helpers'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { configurationManager } from 'web-pkg/src/configuration'
import ContextMenuQuickAction from 'web-pkg/src/components/ContextActions/ContextMenuQuickAction.vue'
import AdvancedTable from 'web-pocs/src/components/OcTable/OcTable.vue'
import { components } from '@ownclouders/design-system'

import { SortDir } from 'web-app-files/src/composables'
import { useResourceRouteResolver } from 'web-app-files/src/composables/filesList/useResourceRouteResolver'
import { ViewModeConstants } from 'web-app-files/src/composables/viewMode'
import { ClipboardActions } from 'web-app-files/src/helpers/clipboardActions'
import { isResourceTxtFileAlmostEmpty } from 'web-app-files/src/helpers/resources'
import { determineSortFields } from 'web-app-files/src/helpers/ui/resourceTable'
import Rename from 'web-app-files/src/mixins/actions/rename'
import { createLocationShares, createLocationCommon } from 'web-app-files/src/router'
import { ref } from 'vue'

const TAGS_MINIMUM_SCREEN_WIDTH = 850

export default defineComponent({
  components: {
    ContextMenuQuickAction,
    AdvancedTable
  },
  mixins: [Rename],
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
     * Grouping settings for the table. Following settings are possible:<br />
     * -**groupingFunctions**: Object with keys as grouping options names and functions that get a table data row and return a group name for that row. The names of the functions are used as grouping options.
     * -**groupingBy**: must be either one of the keys in groupingFunctions or 'None'. If not set, default grouping will be 'None'.<br />
     * -**ShowGroupingOptions**:  boolean value for showing or hinding the select element with grouping options above the table. <br />
     * -**PreviewAmount**: Integer value that is used to show only the first n data rows of the table.
     */
    groupingSettings: {
      type: Object,
      required: false,
      default: null
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
     * The ids of disabled resources. Null or an empty string/array for no disabled resources.
     */
    disabled: {
      type: [String, Array],
      required: false,
      default: null
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
    viewMode: {
      type: String,
      default: ViewModeConstants.defaultModeName
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
    const store = useStore()
    const spaces = computed(() => {
      return store.getters['runtime/spaces/spaces']
    })
    const { width } = useWindowSize()
    const hasTags = computed(
      () => useCapabilityFilesTags().value && width.value >= TAGS_MINIMUM_SCREEN_WIDTH
    )

    const resourceRouteResolver = useResourceRouteResolver(
      {
        space: ref(props.space),
        spaces,
        targetRouteCallback: computed(() => props.targetRouteCallback)
      },
      context
    )

    return {
      resourceRouteResolver,
      ViewModeConstants,
      hasTags,
      hasShareJail: useCapabilityShareJailEnabled(),
      hasProjectSpaces: useCapabilityProjectSpacesEnabled(),
      isUserContext: useUserContext({ store })
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
    ...mapState('runtime/spaces', ['spaces']),
    table() {
      const { OcTable } = components
      return this.configuration?.options?.enableAdvancedTable ? AdvancedTable : OcTable
    },
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
            name: 'indicators',
            title: this.$gettext('Shares'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap'
          },
          {
            name: 'size',
            title: this.$gettext('Size'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap'
          },
          {
            name: 'status',
            title: this.$gettext('Status'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap'
          },
          this.hasTags
            ? {
                name: 'tags',
                title: this.$gettext('Tags'),
                type: 'slot',
                alignH: 'right',
                wrap: 'nowrap'
              }
            : {},
          {
            name: 'owner',
            title: this.$gettext('Shared by'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap'
          },
          {
            name: 'sharedWith',
            title: this.$gettext('Shared with'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap'
          },
          {
            name: 'mdate',
            title: this.$gettext('Modified'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            accessibleLabelCallback: (item) =>
              this.formatDateRelative(item.mdate) + ' (' + this.formatDate(item.mdate) + ')'
          },
          {
            name: 'sdate',
            title: this.$gettext('Shared on'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            accessibleLabelCallback: (item) =>
              this.formatDateRelative(item.sdate) + ' (' + this.formatDate(item.sdate) + ')'
          },
          {
            name: 'ddate',
            title: this.$gettext('Deleted'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap',
            accessibleLabelCallback: (item) =>
              this.formatDateRelative(item.ddate) + ' (' + this.formatDate(item.ddate) + ')'
          }
        ]
          .filter((field) => {
            const hasField = Object.prototype.hasOwnProperty.call(firstResource, field.name)
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
          wrap: 'nowrap'
        })
      }

      return fields
    },
    lazyLoading() {
      return this.configuration?.options?.displayResourcesLazy
    },
    areAllResourcesSelected() {
      return this.selectedIds.length === this.resources.length
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
    getTagLink(tag) {
      return createLocationCommon('files-common-search', {
        query: { term: `Tags:${tag}`, provider: 'files.sdk' }
      })
    },
    getTagComponentAttrs(tag) {
      if (!this.isUserContext) {
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
      return this.$_rename_items.filter((menuItem) => menuItem.isEnabled({ resources: [item] }))
        .length
    },
    openRenameDialog(item) {
      this.$_rename_trigger(
        { resources: [item] },
        this.resourceRouteResolver.getMatchingSpace(item)
      )
    },
    openTagsSidebar() {
      eventBus.publish(SideBarEventTopics.open)
    },
    openSharingSidebar(file) {
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
    folderLink(file) {
      return this.resourceRouteResolver.createFolderLink({
        path: file.path,
        fileId: file.fileId,
        resource: file
      })
    },
    parentFolderLink(file) {
      if (file.shareId && file.path === '/') {
        return createLocationShares('files-shares-with-me')
      }

      return this.resourceRouteResolver.createFolderLink({
        path: dirname(file.path),
        ...(file.parentFolderId && { fileId: file.parentFolderId }),
        resource: file
      })
    },
    fileDragged(file) {
      this.addSelectedResource(file)
    },
    fileDropped(fileId) {
      this.$emit(EVENT_FILE_DROPPED, fileId)
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
      const eventData = data[1]
      if (eventData && eventData.metaKey) {
        return eventBus.publish('app.files.list.clicked.meta', resource)
      }
      if (eventData && eventData.shiftKey) {
        return eventBus.publish('app.files.list.clicked.shift', resource)
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
      this.emitSelect(this.resources.map((resource) => resource.id))
    },
    emitFileClick(resource) {
      let space = this.resourceRouteResolver.getMatchingSpace(resource)
      if (!space) {
        space = buildShareSpaceResource({
          shareId: resource.shareId,
          shareName: resource.name,
          serverUrl: configurationManager.serverUrl
        })
      }

      /**
       * Triggered when a default action is triggered on a file
       * @property {object} resource resource for which the event is triggered
       */
      this.$emit('fileClick', { space, resources: [resource] })
    },
    isResourceClickable(resourceId) {
      if (!this.areResourcesClickable) {
        return false
      }
      return Array.isArray(this.disabled)
        ? !this.disabled.includes(resourceId)
        : this.disabled !== resourceId
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
      return this.$gettextInterpolate(description, {
        resourceType,
        shareCount,
        linkCount
      })
    },
    getOwnerAvatarDescription(resource) {
      const translated = this.$gettext('This %{ resourceType } is owned by %{ ownerName }')
      const resourceType =
        resource.type === 'folder' ? this.$gettext('folder') : this.$gettext('file')
      return this.$gettextInterpolate(translated, {
        resourceType,
        ownerName: resource.owner[0].displayName
      })
    },
    getDefaultParentFolderName(resource) {
      if (this.hasProjectSpaces) {
        const matchingSpace = this.resourceRouteResolver.getMatchingSpace(resource)
        if (matchingSpace?.driveType === 'project') {
          return matchingSpace.name
        }
      }

      if (!this.hasShareJail) {
        return this.$gettext('All files and folders')
      }

      if (resource.shareId) {
        return resource.path === '/'
          ? this.$gettext('Shared with me')
          : basename(resource.shareRoot)
      }

      if (!this.resourceRouteResolver.getInternalSpace(resource.storageId)) {
        return this.$gettext('Shared with me')
      }

      return this.$gettext('Personal')
    },
    getArePathsDisplayed(resource) {
      return this.arePathsDisplayed && resource.type !== 'space'
    }
  }
})
</script>
<style lang="scss">
.condensed > .oc-table > tbody > tr {
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
    flex-flow: row wrap;
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

// Hide files table columns
.files-table {
  .oc-table-header-cell-mdate,
  .oc-table-data-cell-mdate,
  .oc-table-header-cell-sdate,
  .oc-table-data-cell-sdate,
  .oc-table-header-cell-ddate,
  .oc-table-data-cell-ddate,
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

  .oc-table-header-cell-owner,
  .oc-table-data-cell-owner {
    display: none;

    @media only screen and (min-width: 960px) {
      display: table-cell;
    }
  }

  &-squashed {
    .oc-table-header-cell-mdate,
    .oc-table-data-cell-mdate,
    .oc-table-header-cell-sdate,
    .oc-table-data-cell-sdate,
    .oc-table-header-cell-ddate,
    .oc-table-data-cell-ddate,
    .oc-table-header-cell-size,
    .oc-table-data-cell-size,
    .oc-table-header-cell-sharedWith,
    .oc-table-data-cell-sharedWith,
    .oc-table-header-cell-owner,
    .oc-table-data-cell-owner,
    .oc-table-header-cell-status,
    .oc-table-data-cell-status {
      display: none;

      @media only screen and (min-width: 1600px) {
        display: table-cell;
      }
    }
  }

  &-squashed {
    .resource-table-actions div:first-child {
      display: none;

      @media only screen and (min-width: 1200px) {
        display: inherit;
      }
    }

    .oc-table-header-cell-indicators,
    .oc-table-data-cell-indicators {
      display: none;

      @media only screen and (min-width: 1200px) {
        display: table-cell;
      }
    }
  }
}
</style>
