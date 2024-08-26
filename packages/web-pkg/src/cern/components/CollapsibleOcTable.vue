<template>
  <div>
    <div v-if="groupingAllowed && groupingSettings.showGroupingOptions" class="oc-pb-m">
      <div class="oc-docs-width-small grouping-label">
        <label class="oc-mx-s" v-text="$gettext('Group By:')"></label>
      </div>
      <div class="oc-docs-width-medium grouping-oc-select">
        <oc-select
          v-model="selectedGroupingOption"
          :label="$gettext('Group by')"
          :label-hidden="true"
          :options="[
            ...Object.keys(groupingSettings.groupingFunctions),
            ...(!Object.keys(groupingSettings.groupingFunctions).includes('None') ? ['None'] : [])
          ]"
          :clearable="false"
          :searchable="false"
        />
      </div>
    </div>
    <table v-bind="extractTableProps()">
      <oc-thead v-if="hasHeader">
        <oc-tr class="oc-table-header-row">
          <oc-th
            v-for="(field, index) in fields"
            :key="`oc-thead-${field.name}`"
            v-bind="extractThProps(field, index)"
            @click="handleTrClick(field)"
          >
            <span v-if="field.headerType === 'slot'" class="oc-table-thead-content">
              <slot :name="field.name + 'Header'" />
            </span>
            <!-- TODO: Vue warning "v-if/else branches must use unique keys." -->
            <span
              v-else
              class="oc-table-thead-content header-text"
              v-text="extractFieldTitle(field)"
            />
            <oc-button
              v-if="field.sortable"
              :aria-label="getSortLabel(field.name)"
              :class="{ 'oc-invisible-sr': sortBy !== field.name }"
              class="oc-button-sort"
              variation="passive"
              appearance="raw"
              @click.stop="handleTrClick(field)"
            >
              <oc-icon
                :name="sortDir === 'asc' ? 'arrow-down' : 'arrow-up'"
                fill-type="line"
                size="small"
                variation="passive"
              />
            </oc-button>
          </oc-th>
        </oc-tr>
      </oc-thead>
      <oc-tbody
        v-if="selectedGroupingOption === 'None' || !selectedGroupingOption"
        class="has-item-context-menu"
      >
        <oc-tr
          v-for="(item, trIndex) in data"
          :key="`oc-tbody-tr-${itemDomSelector(item) || trIndex}`"
          :ref="`row-${trIndex}`"
          v-bind="extractTbodyTrProps(item, trIndex)"
          :data-item-id="item[idKey as keyof Item]"
          :draggable="dragDrop"
          @click="$emit(constants.EVENT_TROW_CLICKED, [item, $event])"
          @contextmenu="
            $emit(
              constants.EVENT_TROW_CONTEXTMENU,
              ($refs[`row-${trIndex}`] as HTMLElement[])[0],
              $event,
              item
            )
          "
          @vue:mounted="
            $emit(constants.EVENT_TROW_MOUNTED, item, ($refs[`row-${trIndex}`] as HTMLElement[])[0])
          "
          @dragstart="dragStart(item, $event)"
          @drop="dropRowEvent(itemDomSelector(item), $event)"
          @dragenter.prevent="dropRowStyling(itemDomSelector(item), false, $event)"
          @dragleave.prevent="dropRowStyling(itemDomSelector(item), true, $event)"
          @mouseleave="dropRowStyling(itemDomSelector(item), true, $event)"
          @dragover="dragOver($event)"
        >
          <oc-td
            v-for="(field, tdIndex) in fields"
            :key="'oc-tbody-td-' + cellKey(field, tdIndex, item)"
            v-bind="extractTdProps(field, tdIndex, item)"
          >
            <slot v-if="isFieldTypeSlot(field)" :name="field.name" :item="item" />
            <template v-else-if="isFieldTypeCallback(field)">
              {{ field.callback(item[field.name as keyof Item]) }}
            </template>
            <template v-else>
              {{ item[field.name as keyof Item] }}
            </template>
          </oc-td>
        </oc-tr>
      </oc-tbody>

      <!-- Collapsibles -->

      <oc-tbody
        v-for="(group, index) in groupedData"
        v-else-if="groupingAllowed && selectedGroupingOption !== 'None' && copyGroupedData.length"
        :key="`${group.name + index}`"
        class="has-item-context-menu"
      >
        <oc-tr :class="['oc-tbody-tr', 'oc-tbody-tr-accordion']" @click="toggleGroup(index)">
          <oc-td :colspan="fields.length - 1" class="oc-pl-s"> {{ group.name }}</oc-td>
          <!-- Column with collapsible buttons -->
          <oc-td class="oc-table-cell-align-right">
            <span class="oc-ml-xs oc-icon-l" :class="[!itemOpen(index) && 'oc-hidden']">
              <oc-icon name="arrow-down-s" size="medium" />
            </span>
            <span class="oc-ml-xs oc-icon-l" :class="[itemOpen(index) && 'oc-hidden']">
              <oc-icon name="arrow-up-s" size="medium" /> </span
          ></oc-td>
        </oc-tr>
        <!-- Data for the group -->
        <template v-if="itemOpen(index)">
          <oc-tr
            v-for="(item, trIndex) in group['data']"
            :key="`oc-tbody-tr-${itemDomSelector(item) || trIndex}`"
            :ref="`row-${trIndex}`"
            v-bind="extractTbodyTrProps(item, trIndex)"
            :data-item-id="item[idKey]"
            :draggable="dragDrop"
            @click="$emit(constants.EVENT_TROW_CLICKED, [item, $event])"
            @contextmenu="
              $emit(
                constants.EVENT_TROW_CONTEXTMENU,
                ($refs[`row-${trIndex}`] as HTMLElement[])[0],
                $event,
                item
              )
            "
            @vue:mounted="
              $emit(
                constants.EVENT_TROW_MOUNTED,
                item,
                ($refs[`row-${trIndex}`] as HTMLElement[])[0]
              )
            "
            @dragstart="dragStart(item, $event)"
            @drop="dropRowEvent(itemDomSelector(item), $event)"
            @dragenter.prevent="dropRowStyling(itemDomSelector(item), false, $event)"
            @dragleave.prevent="dropRowStyling(itemDomSelector(item), true, $event)"
            @mouseleave="dropRowStyling(itemDomSelector(item), true, $event)"
            @dragover="dragOver($event)"
          >
            <oc-td
              v-for="(field, tdIndex) in fields"
              :key="'oc-tbody-td-' + cellKey(field, tdIndex, item)"
              v-bind="extractTdProps(field, tdIndex, item)"
            >
              <slot v-if="isFieldTypeSlot(field)" :name="field.name" :item="item" />
              <template v-else-if="isFieldTypeCallback(field)">
                {{ field.callback(item[field.name]) }}
              </template>
              <template v-else>{{ item[field.name] }}</template>
            </oc-td>
          </oc-tr>
        </template>
      </oc-tbody>
      <tfoot v-if="$slots.footer" class="oc-table-footer">
        <tr class="oc-table-footer-row">
          <td :colspan="fullColspan" class="oc-table-footer-cell">
            <!-- @slot Footer of the table -->
            <slot name="footer" />
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { getSizeClass } from 'design-system/src/utils/sizeClasses'
import {
  EVENT_THEAD_CLICKED,
  EVENT_TROW_CLICKED,
  EVENT_TROW_MOUNTED,
  EVENT_TROW_CONTEXTMENU,
  EVENT_ITEM_DROPPED,
  EVENT_ITEM_DRAGGED,
  EVENT_SORT
} from 'design-system/src/helpers/constants'
import { RemoteItem } from '@ownclouders/web-client/graph/generated'
const SORT_DIRECTION_ASC = 'asc' as const
const SORT_DIRECTION_DESC = 'desc' as const
export type FieldType = {
  name: string
  title?: string
  headerType?: string
  type?: string
  callback?: any
  alignH?: string
  alignV?: string
  width?: string
  wrap?: string
  thClass?: string
  tdClass?: string
  sortable?: boolean
  sortDir?: string
  accessibleLabelCallback?: (...args: unknown[]) => string
}

// FIXME: ideally the id should not be optional, but some generated types (e.g. User and Group) need this
type Item = {
  id?: string
}

/**
 * A collapsible table component with dynamic layout and data.
 */
export default defineComponent({
  name: 'CollapsibleOcTable',
  status: 'prototype',
  release: 'unreleased',
  props: {
    /**
     * Grouping settings for the table. Following settings are possible:<br />
     * -**groupingFunctions**: Object with keys as grouping options names and as values functions that get a table data row and return a group name for that row. The names of the functions are used as grouping options.<br />
     * -**sortGroups**: Object with keys as grouping options names and as values functions that get an array of groups and return a sorted array of groups.
     * -**groupingBy**: must be either one of the keys in groupingFunctions or 'None'. If not set, default grouping will be 'None'.<br />
     * -**ShowGroupingOptions**:  boolean value for showing or hinding the select element with grouping options above the table. <br />
     */
    groupingSettings: {
      type: Object as PropType<{
        groupingFunctions: Record<string, (...args: unknown[]) => any>
        groupingBy?: string
        sortGroups?: Record<string, any>
        showGroupingOptions?: boolean
      }>,
      required: false,
      default: null
    },
    /**
     * The data for the table. Each array item will be rendered as one table row. Each array item needs to have a
     * unique identifier. By default we expect this to be an `id` field. If your field has a different name, please
     * specify it in the `id-key` property of oc-table.
     */
    data: {
      type: Array as PropType<Item[]>,
      required: true
    },
    /**
     * Name of the id property of your data items. See `data` for details on how to use it. The [idKey] is a required field
     * within your data items if you want to have working highlighting. For data representation it is not needed.
     */
    idKey: {
      type: String,
      default: 'id'
    },
    /**
     * Closure function to mutate the item id into a valid DOM selector
     */
    itemDomSelector: {
      type: Function,
      required: false,
      default(item: Item) {
        return item[(this as any).idKey as keyof Item]
      }
    },
    /**
     * The column layout of the table.
     *
     * Each field can have the following data:<br />
     * - **name**: values need to be keys of your data items. Required.<br />
     * - **title**: title as displayed in the table header. Optional, falls back to the value of name.<br />
     * - **headerType**: the header field type, can be `slot`, entirely absent or unknown. If absent or unknown, the data will be rendered into a plain table cell.<br />
     * - **type**: the field type, can be `slot`, `callback`, entirely absent or unknown. If absent or unknown, the data will be rendered into a plain table cell.<br />
     * - **callback**: if `type="callback"` the return value of field.callback will be rendered into a plain table cell.<br />
     * - **alignH**: horizontal cell content alignment, can be `left`, `center` or `right`. Defaults to `left`.<br />
     * - **alignV**: vertical cell content alignment, can be `top`, `middle` or `bottom`. Defaults to `middle`.<br />
     * - **width**: horizontal size of a cell, can be `auto`, `shrink` or `expand`. Defaults to `auto`.<br />
     * - **wrap**: text behaviour of a data cell, can be `truncate`, `overflow`, `nowrap`, `break`. Omitted if not set. Header cells are always fixed to `nowrap`.<br />
     * - **thClass**:additional classes on header cells, provided as a string, classes separated by spaces. Optional, falls back to an empty string.<br />
     * - **tdClass**: additional classes on data cells, provided as a string, classes separated by spaces. Optional, falls back to an empty string.<br />
     * - **sortable**: defines if the column is sortable, can be `true` or `false`.
     */
    fields: {
      type: Array as PropType<FieldType[]>,
      required: true
    },
    /**
     * Asserts whether the table has a header. The header markup is defined in the `fields` array.
     */
    hasHeader: {
      type: Boolean,
      default: true
    },
    /**
     * Asserts whether the header of the table is sticky.
     */
    sticky: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Asserts whether table rows should be highlighted when hovered.
     */
    hover: {
      type: Boolean,
      default: false
    },
    /**
     * The ids of highlighted data items. Null or an empty string/array for no highlighting.
     */
    highlighted: {
      type: [String, Array],
      default: null
    },
    /**
     * The ids of disabled data items. Null or an empty string/array for no disabled items.
     */
    disabled: {
      type: [String, Array],
      default: null
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
     * Sets the padding size for x axis
     * @values xsmall, small, medium, large, xlarge
     */
    paddingX: {
      type: String,
      required: false,
      default: 'small',
      validator: (size: string) => ['xsmall', 'small', 'medium', 'large', 'xlarge'].includes(size)
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
     * Array of items that should be selected by default.
     */
    selection: {
      type: Array as PropType<any[]>,
      required: false,
      default: () => []
    },
    /**
     * Determines if the table content should be loaded lazily.
     */
    lazy: {
      type: Boolean,
      default: false
    },
    /**
     * Show that the table is sorted ascendingly/descendingly (no actual sorting takes place)
     */
    sortDir: {
      type: String,
      required: false,
      default: undefined,
      validator: (value: string) => {
        return value === undefined || ['asc', 'desc'].includes(value)
      }
    },
    /**
     * Show that the table is sorted by this column (no actual sorting takes place)
     */
    sortBy: {
      type: String,
      required: false,
      default: undefined
    }
  },
  emits: [
    EVENT_ITEM_DROPPED,
    EVENT_ITEM_DRAGGED,
    EVENT_THEAD_CLICKED,
    EVENT_TROW_CLICKED,
    EVENT_TROW_MOUNTED,
    EVENT_TROW_CONTEXTMENU,
    EVENT_SORT,
    'dropRowStyling'
  ],
  setup() {
    const copyGroupedData = ref([])
    const constants = {
      EVENT_THEAD_CLICKED,
      EVENT_TROW_CLICKED,
      EVENT_TROW_MOUNTED,
      EVENT_TROW_CONTEXTMENU
    }
    return { copyGroupedData, constants }
  },
  data() {
    return {
      selectedGroupingOption: this.groupingSettings?.groupingBy || 'None'
    }
  },
  computed: {
    isSortable() {
      return this.fields.some((f) => f.sortable)
    },
    tableClasses() {
      const result = ['oc-table']
      if (this.hover) {
        result.push('oc-table-hover')
      }
      if (this.sticky) {
        result.push('oc-table-sticky')
      }
      return result
    },
    fullColspan() {
      return this.fields.length
    },
    groupingAllowed() {
      return !!(
        this.groupingSettings?.groupingFunctions &&
        Object.keys(this.groupingSettings.groupingFunctions).length > 0
      )
    },
    groupedData() {
      let result = this.createGroupedData(this.selectedGroupingOption, this.data)
      if (!result.length) return []
      // sort groups if there is a given sorting function in grouping settings
      if (this.groupingSettings?.sortGroups?.[this.selectedGroupingOption]) {
        result = this.groupingSettings.sortGroups[this.selectedGroupingOption](result)
      }
      return result
    }
  },
  created() {
    // create copy of grouped data to manipulate toggling
    if (this.groupingAllowed) {
      this.copyGroupedData = [...this.groupedData]
      // callback for selection of None by enabled groupingSettings
      this.$watch('selectedGroupingOption', () => {
        if (
          this.selectedGroupingOption === 'None' &&
          this.groupingSettings?.groupingFunctions?.None
        ) {
          ;(this.groupingSettings.groupingFunctions as any).None()
        } else {
          this.updateCopyGroupedData()
        }
      })
      // update the copy of grouped data on data change
      this.$watch('data', this.updateCopyGroupedData, { deep: true })
    }
  },
  methods: {
    dragOver(event: DragEvent) {
      event.preventDefault()
    },
    dragStart(item: RemoteItem, event: DragEvent) {
      this.$emit(EVENT_ITEM_DRAGGED, item, event)
    },
    dropRowEvent(selector: Item, event: DragEvent) {
      this.$emit(EVENT_ITEM_DROPPED, selector, event)
    },
    dropRowStyling(selector: Item, leaving: boolean, event: DragEvent) {
      this.$emit('dropRowStyling', selector, leaving, event)
    },
    isFieldTypeSlot(field: FieldType) {
      return field.type === 'slot'
    },
    isFieldTypeCallback(field: FieldType) {
      return ['callback', 'function'].indexOf(field.type) >= 0
    },
    extractFieldTitle(field: FieldType) {
      if (Object.prototype.hasOwnProperty.call(field, 'title')) {
        return field.title
      }
      return field.name
    },
    extractTableProps() {
      return {
        class: this.tableClasses
      }
    },
    extractThProps(field: FieldType, index: number) {
      const props = this.extractCellProps(field)
      props.class = `oc-table-header-cell oc-table-header-cell-${field.name}`
      if (Object.prototype.hasOwnProperty.call(field, 'thClass')) {
        props.class += ` ${field.thClass}`
      }
      if (this.sticky) {
        props.style = `top: ${this.headerPosition}px;`
      }
      if (index === 0) {
        props.class += ` oc-pl-${getSizeClass(this.paddingX)} `
      }
      if (index === this.fields.length - 1) {
        props.class += ` oc-pr-${getSizeClass(this.paddingX)}`
      }
      this.extractSortThProps(props, field)
      return props
    },
    extractTbodyTrProps(item: Item, index: number) {
      return {
        ...(this.lazy && { lazy: { colspan: this.fullColspan } }),
        class: [
          'oc-tbody-tr',
          `oc-tbody-tr-${this.itemDomSelector(item) || index}`,
          this.isHighlighted(item) ? 'oc-table-highlighted' : undefined,
          this.isDisabled(item) ? 'oc-table-disabled' : undefined
        ].filter(Boolean)
      }
    },
    extractTdProps(field: FieldType, index: number, item: Item) {
      const props = this.extractCellProps(field)
      props.class = `oc-table-data-cell oc-table-data-cell-${field.name}`
      if (Object.prototype.hasOwnProperty.call(field, 'tdClass')) {
        props.class += ` ${field.tdClass}`
      }
      if (Object.prototype.hasOwnProperty.call(field, 'wrap')) {
        props.wrap = field.wrap
      }
      if (index === 0) {
        props.class += ` oc-pl-${getSizeClass(this.paddingX)} `
      }
      if (index === this.fields.length - 1) {
        props.class += ` oc-pr-${getSizeClass(this.paddingX)}`
      }
      if (Object.prototype.hasOwnProperty.call(field, 'accessibleLabelCallback')) {
        props['aria-label'] = field.accessibleLabelCallback(item)
      }
      return props
    },
    extractCellProps(field: FieldType): Record<string, string> {
      return {
        ...(field?.alignH && { alignH: field.alignH }),
        ...(field?.alignV && { alignV: field.alignV }),
        ...(field?.width && { width: field.width }),
        class: undefined,
        wrap: undefined,
        style: undefined
      }
    },
    isHighlighted(item: Item) {
      if (!this.highlighted) {
        return false
      }
      if (Array.isArray(this.highlighted)) {
        return this.highlighted.indexOf(item[this.idKey as keyof Item]) > -1
      }
      return this.highlighted === item[this.idKey as keyof Item]
    },
    isDisabled(item: Item) {
      if (!this.disabled) {
        return false
      }
      if (Array.isArray(this.disabled)) {
        return this.disabled.indexOf(item[this.idKey as keyof Item]) > -1
      }
      return this.disabled === item[this.idKey as keyof Item]
    },
    cellKey(field: FieldType, index: number, item: Item) {
      const prefix = [item[this.idKey as keyof Item], index + 1].filter(Boolean)
      if (this.isFieldTypeSlot(field)) {
        return [...prefix, field.name].join('-')
      }
      if (this.isFieldTypeCallback(field)) {
        return [...prefix, field.callback(item[field.name as keyof Item])].join('-')
      }
      return [...prefix, item[field.name as keyof Item]].join('-')
    },
    getSortLabel(name: string) {
      return this.$gettext('Sort by %{ name }', { name })
    },
    handleTrClick(field: FieldType) {
      if (this.isSortable) {
        this.handleSort(field)
      }
    },
    extractSortThProps(props: Record<string, string>, field: FieldType) {
      if (!this.fieldIsSortable(field)) {
        return
      }
      let sort = 'none'
      if (this.sortBy === field.name) {
        sort = this.sortDir === SORT_DIRECTION_ASC ? 'ascending' : 'descending'
      }
      props['aria-sort'] = sort
    },
    fieldIsSortable({ sortable }: FieldType) {
      return !!sortable
    },
    handleSort(field: FieldType) {
      if (!this.fieldIsSortable(field)) {
        return
      }
      let sortDir = this.sortDir
      // toggle sortDir if already sorted by this column
      if (this.sortBy === field.name && this.sortDir !== undefined) {
        sortDir = this.sortDir === SORT_DIRECTION_DESC ? SORT_DIRECTION_ASC : SORT_DIRECTION_DESC
      }
      // set default sortDir of the field when sortDir not set or sortBy changed
      if (this.sortBy !== field.name || this.sortDir === undefined) {
        sortDir = field.sortDir || SORT_DIRECTION_DESC
      }
      /**
       * Triggers when table heads are clicked
       *
       * @property {string} sortBy requested column to sort by
       * @property {string} sortDir requested order to sort in (either asc or desc)
       */
      this.$emit('sort', {
        sortBy: field.name,
        sortDir
      })
    },
    updateCopyGroupedData() {
      const tempData = [...this.groupedData]
      tempData.forEach((e) => {
        const group = this.copyGroupedData.find((el) => el.name === e.name)
        if (group && group.open) {
          e.open = group.open
        }
        this.copyGroupedData = [...tempData]
      })
    },
    createGroupedData(col: string, data: Item[]) {
      const groups: Record<string, any> = {}
      const resultArray = []
      if (Object.keys(this.groupingSettings?.groupingFunctions).includes(col)) {
        data.forEach((row) => {
          groups[this.groupingSettings.groupingFunctions[col](row)]
            ? groups[this.groupingSettings.groupingFunctions[col](row)].push(row)
            : (groups[this.groupingSettings.groupingFunctions[col](row)] = [row])
        })
        for (const [key, value] of Object.entries(groups)) {
          resultArray.push({
            name: key.toUpperCase(),
            open: true,
            data: value
          })
        }
        return resultArray
      }
    },
    toggleGroup(index: number) {
      this.copyGroupedData[index].open = !this.copyGroupedData[index].open
    },
    itemOpen(index: number) {
      return this.copyGroupedData[index]?.open
    },
    clickedField(field: FieldType) {
      this.$emit(this.constants.EVENT_THEAD_CLICKED, field)
    }
  }
})
</script>
<style lang="scss">
.condensed > .oc-table > tbody > tr {
  height: 0 !important;
}
.grouping-settings {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.grouping-label {
  display: inline;
}
.grouping-oc-select {
  display: inline-block;
  width: 250px;
}
.oc-tbody-tr-accordion {
  cursor: pointer;
  background-color: var(--oc-color-input-bg);
}
.oc-table {
  border-collapse: collapse;
  border-spacing: 0;
  color: var(--oc-color-text-default);
  width: 100%;
  &-hover tr {
    transition: background-color $transition-duration-short ease-in-out;
  }
  &-hover tr:hover td:not(:last-child) span:not(.avatarInitials):not(button span) {
    color: var(--oc-color-swatch-brand-hover) !important;
  }
  tr {
    outline: none;
    height: var(--oc-size-height-table-row);
  }
  tr + tr {
    border-top: 1px solid var(--oc-color-border);
  }
  &-hover tr:not(&-footer-row):hover {
    background-color: var(--oc-color-background-hover);
  }
  &-highlighted {
    background-color: var(--oc-color-background-highlight) !important;
  }
  &-accentuated {
    background-color: var(--oc-color-background-accentuate);
  }
  &-disabled {
    background-color: var(--oc-color-background-muted);
    opacity: 0.8;
    pointer-events: none;
  }
  &-sticky {
    position: relative;
    .oc-table-header-cell {
      background-color: var(--oc-color-background-default);
      position: sticky;
      z-index: 1;
    }
  }
  .highlightedDropTarget {
    background-color: var(--oc-color-input-border);
  }
  &-thead-content {
    vertical-align: middle;
    display: inline-table;
    color: var(--oc-color-swatch-passive-default);
    &:hover {
      text-decoration: underline;
    }
  }
  &-footer {
    border-top: 1px solid var(--oc-color-border);
    &-cell {
      color: var(--oc-color-text-muted);
      font-size: 0.875rem;
      line-height: 1.4;
      padding: var(--oc-space-xsmall);
    }
  }
}
.oc-button-sort {
  display: inline-table;
  vertical-align: middle;
  .oc-icon {
    display: table-cell !important;
    vertical-align: middle !important;
    &:hover {
      background-color: var(--oc-color-background-hover);
    }
  }
}
</style>
