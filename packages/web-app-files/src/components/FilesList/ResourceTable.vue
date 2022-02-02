<template>
  <oc-table
    :data="resources"
    :grouping-settings="groupingSettings"
    :fields="fields"
    :highlighted="selectedIds"
    :disabled="disabled"
    :sticky="true"
    :header-position="headerPosition"
    :drag-drop="dragDrop"
    :hover="hover"
    :item-dom-selector="resourceDomSelector"
    :selection="selection"
    :sort-by="sortBy"
    :sort-dir="sortDir"
    @highlight="fileClicked"
    @rowMounted="rowMounted"
    @contextmenuClicked="showContextMenu"
    @itemDropped="fileDropped"
    @itemDragged="fileDragged"
    @sort="sort"
  >
    <template #selectHeader>
      <div class="resource-table-select-all">
        <oc-checkbox
          id="resource-table-select-all"
          :label="allResourcesCheckboxLabel"
          :hide-label="true"
          :value="areAllResourcesSelected"
          @input="toggleSelectionAll"
        />
      </div>
    </template>
    <template #select="{ item }">
      <oc-checkbox
        :id="`resource-table-select-${resourceDomSelector(item)}`"
        :label="getResourceCheckboxLabel(item)"
        :hide-label="true"
        size="large"
        :value="selection"
        :option="item"
        @input="emitSelect"
        @click.native.stop
      />
    </template>
    <template #name="{ item }">
      <oc-resource
        :key="`${item.path}-${resourceDomSelector(item)}-${item.thumbnail}`"
        :resource="item"
        :is-path-displayed="arePathsDisplayed"
        :is-thumbnail-displayed="areThumbnailsDisplayed"
        :target-route="targetRoute"
        :is-resource-clickable="isResourceClickable(item.id)"
        @click="emitFileClick(item)"
      />
    </template>
    <template #status="{ item }">
      <!-- @slot Status column -->
      <slot name="status" :resource="item" />
    </template>
    <template #sharedWith="{ item }">
      <oc-avatars
        class="resource-table-people"
        :items="item.sharedWith"
        :stacked="true"
        :max-displayed="3"
        :is-tooltip-displayed="true"
        :accessible-description="getSharedWithAvatarDescription(item)"
      />
    </template>
    <template #size="{ item }">
      <oc-resource-size :size="item.size || Number.NaN" />
    </template>
    <template #mdate="{ item }">
      <span
        v-oc-tooltip="formatDate(item.mdate)"
        tabindex="0"
        v-text="formatDateRelative(item.mdate)"
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
      <oc-avatars
        class="resource-table-people"
        :items="item.owner"
        :is-tooltip-displayed="true"
        :accessible-description="getOwnerAvatarDescription(item)"
      />
    </template>
    <template #actions="{ item }">
      <div class="resource-table-actions">
        <!-- @slot Add quick actions before the `context-menu / three dot` button in the actions column -->
        <slot name="quickActions" :resource="item" />
        <oc-button
          :id="`context-menu-trigger-${resourceDomSelector(item)}`"
          v-oc-tooltip="contextMenuLabel"
          :aria-label="contextMenuLabel"
          class="resource-table-btn-action-dropdown"
          appearance="raw"
          @click.stop.prevent="
            resetDropPosition(`context-menu-drop-ref-${resourceDomSelector(item)}`, $event, item)
          "
        >
          <oc-icon name="more-2" />
        </oc-button>
        <oc-drop
          :ref="`context-menu-drop-ref-${resourceDomSelector(item)}`"
          :drop-id="`context-menu-drop-${resourceDomSelector(item)}`"
          :toggle="`#context-menu-trigger-${resourceDomSelector(item)}`"
          :popper-options="popperOptions"
          mode="click"
          close-on-click
          padding-size="remove"
          @click.native.stop.prevent
        >
          <!-- @slot Add context actions that open in a dropdown when clicking on the "three dots" button -->
          <slot name="contextMenu" :resource="item" />
        </oc-drop>
      </div>
    </template>
    <template v-if="$slots.footer" #footer>
      <!-- @slot Footer of the files table -->
      <slot name="footer" />
    </template>
  </oc-table>
</template>

<script>
import { DateTime } from 'luxon'
import maxSize from 'popper-max-size-modifier'
import { mapGetters } from 'vuex'
import { EVENT_TROW_MOUNTED, EVENT_FILE_DROPPED } from '../../constants'
import { SortDir } from '../../composables'

const dateSortValue = (date) => {
  return DateTime.fromRFC2822(date).toUTC().valueOf()
}

export const determineSortFields = (firstResource) => {
  if (!firstResource) {
    return []
  }

  return [
    {
      name: 'name',
      sortable: true,
      sortDir: SortDir.Asc
    },
    {
      name: 'size',
      sortable: true,
      sortDir: SortDir.Desc
    },
    {
      name: 'sharedWith',
      sortable: (sharedWith) => {
        if (sharedWith.length > 0) {
          return sharedWith[0].displayName
        }
        return false
      },
      sortDir: SortDir.Asc
    },
    {
      name: 'owner',
      sortable: 'displayName',
      sortDir: SortDir.Asc
    },
    {
      name: 'mdate',
      sortable: (date) => dateSortValue(date),
      sortDir: SortDir.Desc
    },
    {
      name: 'sdate',
      sortable: (date) => dateSortValue(date),
      sortDir: SortDir.Desc
    },
    {
      name: 'ddate',
      sortable: (date) => dateSortValue(date),
      sortDir: SortDir.Desc
    }
  ].filter((field) => Object.prototype.hasOwnProperty.call(firstResource, field.name))
}

export default {
  model: {
    prop: 'selection',
    event: 'select'
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
      type: Array,
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
    },
    /**
     * Closure function to mutate the resource id into a valid DOM selector.
     */
    resourceDomSelector: {
      type: Function,
      required: false,
      default: (resource) => resource.id.replace(/[^A-Za-z0-9\-_]/g, '')
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
    selection: {
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
     * Target route path used to build the link when navigating into a resource
     */
    targetRoute: {
      type: Object,
      required: false,
      default: null
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
      validator: (size) => /(xsmall|small|medium|large|xlarge)/.test(size)
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
     * Enable hover effect
     */
    hover: {
      type: Boolean,
      required: false,
      default: false
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
     * Show that the table is sorted ascendingly/descendingly (no actual sorting takes place)
     */
    sortDir: {
      type: String,
      required: false,
      default: undefined,
      validator: (value) => {
        return value === undefined || [SortDir.Asc, SortDir.Desc].includes(value)
      }
    }
  },
  data() {
    return {
      constants: {
        EVENT_TROW_MOUNTED
      }
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    popperOptions() {
      return {
        modifiers: [
          maxSize,
          {
            name: 'applyMaxSize',
            enabled: true,
            phase: 'beforeWrite',
            requires: ['maxSize'],
            fn({ state }) {
              const { height } = state.modifiersData.maxSize
              state.styles.popper.overflowY = `auto`
              state.styles.popper.maxHeight = `${height - 5}px`
            }
          }
        ]
      }
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
            title: this.$gettext('Name'), // How do we get the translations here?
            type: 'slot',
            width: 'expand',
            wrap: 'truncate'
          },
          {
            name: 'size',
            title: this.$gettext('Size'),
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
            name: 'status',
            title: this.$gettext('Status'),
            type: 'slot',
            alignH: 'right',
            wrap: 'nowrap'
          },
          {
            name: 'owner',
            title: this.$gettext('Share owner'),
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
          .filter((field) => Object.prototype.hasOwnProperty.call(firstResource, field.name))
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

      if (this.configuration?.options?.displayResourcesLazy) {
        fields.forEach((field) =>
          Object.assign(field, {
            lazy: {
              delay: 250
            }
          })
        )
      }

      return fields
    },
    areAllResourcesSelected() {
      return this.selection.length === this.resources.length
    },
    selectedIds() {
      return this.selection.map((r) => r.id)
    },
    allResourcesCheckboxLabel() {
      return this.$gettext('Select all resources')
    },
    contextMenuLabel() {
      return this.$gettext('Show context menu')
    },
    currentLanguage() {
      return (this.$language?.current || '').split('_')[0]
    }
  },
  methods: {
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
      const isSelected = this.selection.some((e) => e.id === file.id)
      if (!isSelected) {
        this.$emit('select', this.selection.concat([file]))
      } else {
        this.$emit('select', this.selection)
      }
    },
    resetDropPosition(id, event, item) {
      const instance = this.$refs[id].tippy
      if (instance === undefined) return
      if (!this.selection.includes(item)) {
        this.emitSelect([item])
      }
      this.displayPositionedDropdown(instance, event)
    },
    showContextMenu(row, event, item) {
      event.preventDefault()
      const instance = row.$el.getElementsByClassName('resource-table-btn-action-dropdown')[0]
      if (instance === undefined) return
      if (!this.selection.includes(item)) {
        this.emitSelect([item])
      }
      this.displayPositionedDropdown(instance._tippy, event)
    },
    displayPositionedDropdown(dropdown, event) {
      dropdown.setProps({
        getReferenceClientRect: () => ({
          width: 0,
          height: 0,
          top: event.clientY,
          bottom: event.clientY,
          left: event.clientX,
          right: event.clientX
        })
      })
      dropdown.show()
    },
    rowMounted(resource, component) {
      /**
       * Triggered whenever a row is mounted
       * @property {object} resource The resource which was mounted as table row
       * @property {object} component The table row component
       */
      this.$emit('rowMounted', resource, component)
    },
    fileClicked(resource) {
      /**
       * Triggered when the file row is clicked
       * @property {object} resource The resource for which the event is triggered
       */
      this.emitSelect([resource])
    },
    formatDate(date) {
      return DateTime.fromJSDate(new Date(date))
        .setLocale(this.currentLanguage)
        .toLocaleString(DateTime.DATETIME_FULL)
    },
    formatDateRelative(date) {
      return DateTime.fromJSDate(new Date(date)).setLocale(this.currentLanguage).toRelative()
    },
    emitSelect(resources) {
      /**
       * Triggered when a checkbox for selecting a resource or the checkbox for selecting all resources is clicked
       * @property {array} resources The selected resources
       */
      this.$emit('select', resources)
    },
    toggleSelectionAll() {
      if (this.areAllResourcesSelected) {
        return this.emitSelect([])
      }
      this.emitSelect(this.resources)
    },
    emitFileClick(resource) {
      /**
       * Triggered when a default action is triggered on a file
       * @property {object} resource resource for which the event is triggered
       */
      this.$emit('fileClick', resource)
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
      const translated = this.$gettextInterpolate(description, {
        resourceType,
        shareCount,
        linkCount
      })
      return translated
    },
    getOwnerAvatarDescription(resource) {
      const translated = this.$gettext('This %{ resourceType } is owned by %{ ownerName }')
      const resourceType =
        resource.type === 'folder' ? this.$gettext('folder') : this.$gettext('file')
      const description = this.$gettextInterpolate(translated, {
        resourceType,
        ownerName: resource.owner[0].displayName
      })
      return description
    }
  }
}
</script>
<style lang="scss">
// To be backported to ODS probably
.oc-table-sticky .oc-table-header-cell {
  transition: all 0.35s cubic-bezier(0.34, 0.11, 0, 1.12);
}

.resource-table {
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
</style>
