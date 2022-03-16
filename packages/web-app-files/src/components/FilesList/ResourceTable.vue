<template>
  <oc-table
    :data="resources"
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
    padding-x="medium"
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
          size="large"
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
        :is-resource-clickable="isResourceClickable(item.id)"
        :folder-link="folderLink(item)"
        :parent-folder-link="parentFolderLink(item)"
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
    <template #shareTypes="{ item }">
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
          padding-size="small"
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
<script lang="ts">
import { DateTime } from 'luxon'
import maxSize from 'popper-max-size-modifier'
import { mapGetters } from 'vuex'
import { EVENT_FILE_DROPPED } from '../../constants'
import { SortDir } from '../../composables'
import * as path from 'path'
import { determineSortFields } from '../../helpers/ui/resourceTable'
import { Vue, Component, Watch, ModelSync, Prop } from 'vue-property-decorator'

@Component({
  name: "ResourceTable",
  extends: Vue,
  computed: {
    ...mapGetters(['configuration']),
  }
})
export default class ResourceTable extends Vue{
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
  @Prop({ required: true })
  readonly resources!: Array<any>
 
  @ModelSync(
    'selection', 'select', { type: Array, default: [] }
  ) // v-model for the selection
  readonly selectionValue!: Array<any>

  readonly resourceDomSelector = (resource) => {
    resource.id.replace(/[^A-Za-z0-9\-_]/g, '')
  } // Closure function to mutate the resource id into a valid DOM selector.

  @Prop({ default: false }) // Asserts whether resources path should be shown in the resource name
  readonly arePathsDisplayed!: boolean

  @Prop({ default: true }) // Asserts whether icons should be replaced with thumbnails for resources which provide them
  readonly areThumbnailsDisplayed!: boolean

  @Prop({ default: true }) // Asserts whether actions are available
  readonly hasActions!: boolean 

  @Prop({ default: null }) // Target route path used to build the link when navigating into a resource
  readonly targetRoute!: any 

  @Prop({ default: true }) // Asserts whether clicking on the resource name triggers any action
  readonly areResourcesClickable!: boolean 

  @Prop({ default: 0 }) // Top position of header used when the header is sticky in pixels
  readonly headerPosition!: number 

  @Prop({ default: true }) // Asserts whether resources in the table can be selected
  readonly isSelectable!: boolean 

  @Prop({ default: null }) // The ids of disabled resources. Null or an empty string/array for no disabled resources.
  readonly disabled!: [string, Array<any>]  

  @Prop({ 
    default: 'small',
    validator: (size) => /(xsmall|small|medium|large|xlarge)/.test(size)
  }) // Sets the padding size for x axis @values xsmall, small, medium, large, xlarge
  readonly paddingX!: string

  @Prop({ default: false })  // Enable Drag & Drop events
  readonly dragDrop!: boolean 

  @Prop({ default: false }) // Enable hover effect
  readonly hover!: boolean 

  @Prop({ default: undefined }) // Show that the table is sorted by this column (no actual sorting takes place)
  readonly sortBy!: string 
  
  @Prop({ 
    default: undefined,
    validator: (value) => {
      return value === undefined || [SortDir.Asc, SortDir.Desc].includes(value)
    }
  }) // Show that the table is sorted ascendingly/descendingly (no actual sorting takes place)
  readonly sortDir!: string 

  get popperOptions() {
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
  }
  get fields() {
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
          name: 'shareTypes',
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
  }
  get areAllResourcesSelected() {
      return this.selection.length === this.resources.length
  }
  get selectedIds() {
    return this.selection.map((r) => r.id)
  }
  get allResourcesCheckboxLabel() {
    return this.$gettext('Select all resources')
  }
  get contextMenuLabel() {
    return this.$gettext('Show context menu')
  }
  get currentLanguage() {
    return (this.$language?.current || '').split('_')[0]
  }

  folderLink(file) {
    return this.createFolderLink(file.path, file.storageId)
  }
  parentFolderLink(file) {
    return this.createFolderLink(path.dirname(file.path), file.storageId)
  }
  createFolderLink(path, storageId) {
    if (this.targetRoute === null) {
      return {}
    }
    return {
      name: this.targetRoute.name,
      query: this.targetRoute.query,
      params: {
        item: path.replace(/^\//, ''),
        ...this.targetRoute.params,
        ...(storageId && { storageId })
      }
    }
  }
  fileDragged(file) {
    this.addSelectedResource(file)
  }
  fileDropped(fileId) {
    this.$emit(EVENT_FILE_DROPPED, fileId)
  }
  sort(opts) {
    this.$emit('sort', opts)
  }
  addSelectedResource(file) {
    const isSelected = this.selection.some((e) => e.id === file.id)
    if (!isSelected) {
      this.$emit('select', this.selection.concat([file]))
    } else {
      this.$emit('select', this.selection)
    }
  }
  resetDropPosition(id, event, item) {
    const instance = (this.$refs[id] as any).tippy
    if (instance === undefined) return
    if (!this.selection.includes(item)) {
      this.emitSelect([item])
    }
    this.displayPositionedDropdown(instance, event)
  }
  showContextMenu(row, event, item) {
    event.preventDefault()
    const instance = row.$el.getElementsByClassName('resource-table-btn-action-dropdown')[0]
    if (instance === undefined) return
    if (!this.selection.includes(item)) {
      this.emitSelect([item])
    }
    this.displayPositionedDropdown(instance._tippy, event)
  }
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
  }
  rowMounted(resource, component) {
    /**
     * Triggered whenever a row is mounted
     * @property {object} resource The resource which was mounted as table row
     * @property {object} component The table row component
     */
    this.$emit('rowMounted', resource, component)
  }
  fileClicked(resource) {
    /**
     * Triggered when the file row is clicked
     * @property {object} resource The resource for which the event is triggered
     */
    this.emitSelect([resource])
  }
  formatDate(date) {
    return DateTime.fromJSDate(new Date(date))
      .setLocale(this.currentLanguage)
      .toLocaleString(DateTime.DATETIME_FULL)
  }
  formatDateRelative(date) {
    return DateTime.fromJSDate(new Date(date)).setLocale(this.currentLanguage).toRelative()
  }
  emitSelect(resources) {
    /**
     * Triggered when a checkbox for selecting a resource or the checkbox for selecting all resources is clicked
     * @property {array} resources The selected resources
     */
    this.$emit('select', resources)
  }
  toggleSelectionAll() {
    if (this.areAllResourcesSelected) {
      return this.emitSelect([])
    }
    this.emitSelect(this.resources)
  }
  emitFileClick(resource) {
    /**
     * Triggered when a default action is triggered on a file
     * @property {object} resource resource for which the event is triggered
     */
    this.$emit('fileClick', resource)
  }
  isResourceClickable(resourceId) {
    if (!this.areResourcesClickable) {
      return false
    }
    return Array.isArray(this.disabled)
      ? !this.disabled.includes(resourceId)
      : this.disabled !== resourceId
  }
  getResourceCheckboxLabel(resource) {
    if (resource.type === 'folder') {
      return this.$gettext('Select folder')
    }
    return this.$gettext('Select file')
  }
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
  }
  getOwnerAvatarDescription(resource) {
    const translated = this.$gettext('This %{ resourceType } is owned by %{ ownerName }')
    const resourceType =
      resource.type === 'folder' ? this.$gettext('folder') : this.$gettext('file')
    return this.$gettextInterpolate(translated, {
      resourceType,
      ownerName: resource.owner[0].displayName
    })
  }
}
</script>
<style lang="scss">
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
