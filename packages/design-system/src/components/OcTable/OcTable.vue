<template>
  <table v-bind="extractTableProps()">
    <oc-thead v-if="hasHeader">
      <oc-tr class="oc-table-header-row">
        <oc-th
          v-for="(field, index) in fields"
          :key="`oc-thead-${field.name}`"
          v-bind="extractThProps(field, index)"
          @click.native="$emit(constants.EVENT_THEAD_CLICKED, field)"
        >
          <span
            v-if="field.headerType === 'slot'"
            :key="field.name + 'Header'"
            class="oc-table-thead-content"
          >
            <slot :name="field.name + 'Header'" />
          </span>
          <!-- TODO: Vue warning "v-if/else branches must use unique keys." -->
          <span
            v-else
            :key="field.name + 'Header'"
            class="oc-table-thead-content header-text"
            v-text="extractFieldTitle(field)"
          />
          <oc-button
            v-if="field.sortable"
            :aria-label="getSortLabel(field.name)"
            :class="{ 'oc-invisible': sortBy !== field.name }"
            class="oc-button-sort"
            variation="passive"
            appearance="raw"
            @click.stop="$emit(constants.EVENT_THEAD_CLICKED, field)"
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
    <oc-tbody>
      <oc-tr
        v-for="(item, trIndex) in data"
        :key="`oc-tbody-tr-${itemDomSelector(item) || trIndex}`"
        :ref="`row-${trIndex}`"
        v-bind="extractTbodyTrProps(item, trIndex)"
        :data-item-id="item[idKey]"
        :draggable="dragDrop"
        @click.native="$emit(constants.EVENT_TROW_CLICKED, [item, $event])"
        @contextmenu.native="
          $emit(constants.EVENT_TROW_CONTEXTMENU, $refs[`row-${trIndex}`][0], $event, item)
        "
        @hook:mounted="$emit(constants.EVENT_TROW_MOUNTED, item, $refs[`row-${trIndex}`][0])"
        @dragstart.native="dragStart(item, $event)"
        @drop.native="dropRowEvent(itemDomSelector(item), $event)"
        @dragenter.native.prevent="dropRowStyling(itemDomSelector(item), false, $event)"
        @dragleave.native.prevent="dropRowStyling(itemDomSelector(item), true, $event)"
        @mouseleave="dropRowStyling(itemDomSelector(item), true, $event)"
        @dragover.native="dragOver($event)"
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
          <template v-else>
            {{ item[field.name] }}
          </template>
        </oc-td>
      </oc-tr>
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
</template>
<script>
import Vue from 'vue'
import OcThead from '../_OcTableHeader/_OcTableHeader.vue'
import OcTbody from '../_OcTableBody/_OcTableBody.vue'
import OcTr from '../_OcTableRow/_OcTableRow.vue'
import OcTh from '../_OcTableCellHead/_OcTableCellHead.vue'
import OcTd from '../_OcTableCellData/_OcTableCellData.vue'
import OcGhostElement from '../_OcGhostElement/_OcGhostElement.vue'
import OcButton from '../OcButton/OcButton.vue'
import SortMixin from '../../mixins/sort'
import { getSizeClass } from '../../utils/sizeClasses'

import {
  EVENT_THEAD_CLICKED,
  EVENT_TROW_CLICKED,
  EVENT_TROW_MOUNTED,
  EVENT_TROW_CONTEXTMENU,
  EVENT_ITEM_DROPPED,
  EVENT_ITEM_DRAGGED
} from '../../helpers/constants'

/**
 * A table component with dynamic layout and data.
 */
export default {
  name: 'OcTable',
  status: 'ready',
  release: '2.1.0',
  components: {
    OcThead,
    OcTbody,
    OcTr,
    OcTh,
    OcTd,
    OcButton
  },
  mixins: [SortMixin],
  props: {
    /**
     * The data for the table. Each array item will be rendered as one table row. Each array item needs to have a
     * unique identifier. By default we expect this to be an `id` field. If your field has a different name, please
     * specify it in the `id-key` property of oc-table.
     */
    data: {
      type: Array,
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
      default(item) {
        return item[this.idKey]
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
      type: Array,
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
     * Array of items that should be selected by default.
     */
    selection: {
      type: Array,
      required: false,
      default: () => []
    },
    /**
     * Determines if the table content should be loaded lazily.
     */
    lazy: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      constants: {
        EVENT_THEAD_CLICKED,
        EVENT_TROW_CLICKED,
        EVENT_TROW_MOUNTED,
        EVENT_TROW_CONTEXTMENU
      },
      ghostElement: null
    }
  },
  computed: {
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
    }
  },
  methods: {
    dragOver(event) {
      event.preventDefault()
    },
    setGhostElement(item, event) {
      const selection = [...this.selection]
      selection.splice(
        selection.findIndex((i) => i.id === item.id),
        1
      )
      const GhostElementComponent = Vue.extend(OcGhostElement)
      const ghostInstances = new GhostElementComponent({
        propsData: {
          previewItems: [item, ...selection]
        }
      })
      ghostInstances.$mount()
      this.ghostElement = document.body.appendChild(ghostInstances.$el)
      this.ghostElement.ariaHidden = 'true'
      this.ghostElement.style.left = '-99999px'
      this.ghostElement.style.top = '-99999px'
      event.dataTransfer.setDragImage(this.ghostElement, 0, 0)
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
    },
    dragStart(item, event) {
      if (!this.dragDrop) return
      this.setGhostElement(item, event)
      this.$emit(EVENT_ITEM_DRAGGED, item)
    },
    dropRowEvent(selector, event) {
      if (!this.dragDrop) return
      const hasFilePayload = (event.dataTransfer.types || []).some((e) => e === 'Files')
      if (hasFilePayload) return
      this.ghostElement.remove()
      const dropTarget = event.target
      const dropTargetTr = dropTarget.closest('tr')
      const dropItemId = dropTargetTr.dataset.itemId
      this.dropRowStyling(selector, true, event)
      this.$emit(EVENT_ITEM_DROPPED, dropItemId)
    },
    dropRowStyling(selector, leaving, event) {
      const hasFilePayload = (event.dataTransfer.types || []).some((e) => e === 'Files')
      if (hasFilePayload) return
      if (event.currentTarget?.contains(event.relatedTarget)) {
        return
      }

      const classList = document.getElementsByClassName(`oc-tbody-tr-${selector}`)[0].classList
      const className = 'highlightedDropTarget'
      leaving ? classList.remove(className) : classList.add(className)
    },
    isFieldTypeSlot(field) {
      return field.type === 'slot'
    },
    isFieldTypeCallback(field) {
      return ['callback', 'function'].indexOf(field.type) >= 0
    },
    extractFieldTitle(field) {
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
    extractThProps(field, index) {
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

      this.extractSortThProps(props, field, index)

      return props
    },
    extractTbodyTrProps(item, index) {
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
    extractTdProps(field, index, item) {
      const props = this.extractCellProps(field, index)
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
    extractCellProps(field) {
      const result = {}
      if (Object.prototype.hasOwnProperty.call(field, 'alignH')) {
        result.alignH = field.alignH
      }
      if (Object.prototype.hasOwnProperty.call(field, 'alignV')) {
        result.alignV = field.alignV
      }
      if (Object.prototype.hasOwnProperty.call(field, 'width')) {
        result.width = field.width
      }

      return result
    },
    isHighlighted(item) {
      if (!this.highlighted) {
        return false
      }

      if (Array.isArray(this.highlighted)) {
        return this.highlighted.indexOf(item[this.idKey]) > -1
      }

      return this.highlighted === item[this.idKey]
    },
    isDisabled(item) {
      if (!this.disabled) {
        return false
      }

      if (Array.isArray(this.disabled)) {
        return this.disabled.indexOf(item[this.idKey]) > -1
      }

      return this.disabled === item[this.idKey]
    },

    cellKey(field, index, item) {
      const prefix = [item[this.idKey], index + 1].filter(Boolean)

      if (this.isFieldTypeSlot(field)) {
        return [...prefix, field.name].join('-')
      }

      if (this.isFieldTypeCallback(field)) {
        return [...prefix, field.callback(item[field.name])].join('-')
      }

      return [...prefix, item[field.name]].join('-')
    },

    getSortLabel(name) {
      const label = this.$gettext('Sort by %{ name }')

      return this.$gettextInterpolate(label, { name })
    }
  }
}
</script>
<style lang="scss">
@import '../../styles/styles';

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
<docs>
```js
<template>
  <section>
    <h3 class="oc-heading-divider">
      A simple table with plain field types
    </h3>
    <oc-table :fields="fields" :data="data" highlighted="4b136c0a-5057-11eb-ac70-eba264112003"
      disabled="8468c9f0-5057-11eb-924b-934c6fd827a2" :sticky="true">
      <template #footer>
        3 resources
      </template>
    </oc-table>
  </section>
</template>
<script>
  export default {
    computed: {
      fields() {
        return [{
          name: "resource",
          title: "Resource",
          alignH: "left",
        }, {
          name: "last_modified",
          title: "Last modified",
          alignH: "right"
        }]
      },
      data() {
        return [{
          id: "4b136c0a-5057-11eb-ac70-eba264112003",
          resource: "hello-world.txt",
          last_modified: 1609962211
        }, {
          id: "8468c9f0-5057-11eb-924b-934c6fd827a2",
          resource: "I am a folder",
          last_modified: 1608887766
        }, {
          id: "9c4cf97e-5057-11eb-8044-b3d5df9caa21",
          resource: "this is fine.png",
          last_modified: 1599999999
        }]
      }
    }
  }
</script>
```
```js
<template>
  <section>
    <h3 class="oc-heading-divider">
      A sortable table with plain field types
    </h3>
    <oc-table @sort="handleSort" :sort-by="sortBy" :sort-dir="sortDir" :fields="fields" :data="data" highlighted="4b136c0a-5057-11eb-ac70-eba264112003"
      disabled="8468c9f0-5057-11eb-924b-934c6fd827a2" :sticky="true">
      <template #footer>
        3 resources
      </template>
    </oc-table>
  </section>
</template>
<script>
  const orderBy = (list, prop, desc) => {
    return [...list].sort((a, b) => {
      a = a[prop];
      b = b[prop];

      if (a == b) return 0;
      return (desc ? a > b : a < b) ? -1 : 1;
    });
  };

  export default {
    data() {
      return {
        sortBy: 'resource',
        sortDir: 'desc'
      }
    },
    methods: {
      handleSort(event) {
        this.sortBy = event.sortBy
        this.sortDir = event.sortDir

      }
    },
    computed: {
      fields() {
        return [{
          name: "resource",
          title: "Resource",
          alignH: "left",
          sortable: true,
        }, {
          name: "last_modified",
          title: "Last modified",
          alignH: "right",
          sortable: true,
        }]
      },
      data() {
        return orderBy([{
          id: "4b136c0a-5057-11eb-ac70-eba264112003",
          resource: "hello-world.txt",
          last_modified: 1609962211
        }, {
          id: "8468c9f0-5057-11eb-924b-934c6fd827a2",
          resource: "I am a folder",
          last_modified: 1608887766
        }, {
          id: "9c4cf97e-5057-11eb-8044-b3d5df9caa21",
          resource: "this is fine.png",
          last_modified: 1599999999
        }], this.sortBy, this.sortDir === 'desc')
      }
    }
  }
</script>
```
```js
<template>
  <section>
    <h3 class="oc-heading-divider">
      A simple table with all existing field types
    </h3>
    <oc-table :fields="fields" :data="data">
      <template v-slot:resourceHeader>
        <div class="oc-flex oc-flex-middle">
          <oc-icon name="folder" class="oc-mr-s" />
          Resource
        </div>
      </template>
      <template v-slot:resource="rowData">
        <oc-tag>
          <oc-icon :name="rowData.item.icon" />
          {{ rowData.item.resource }}
        </oc-tag>
      </template>
    </oc-table>
  </section>
</template>
<script>
  export default {
    computed: {
      fields() {
        return [{
          name: "resource",
          title: "Resource",
          headerType: "slot",
          type: "slot"
        }, {
          name: "last_modified",
          title: "Last modified",
          type: "callback",
          callback: function(timestamp) {
            const date = new Date(timestamp * 1000)
            const hours = date.getHours()
            const minutes = "0" + date.getMinutes()
            const seconds = "0" + date.getSeconds()
            return hours + ":" + minutes.slice(-2) + ":" + seconds.slice(-2)
          }
        }]
      },
      data() {
        return [{
          id: "4b136c0a-5057-11eb-ac70-eba264112003",
          resource: "hello-world.txt",
          icon: "file-list",
          last_modified: 1609962211
        }, {
          id: "8468c9f0-5057-11eb-924b-934c6fd827a2",
          resource: "I am a folder",
          icon: "folder",
          last_modified: 1608887766
        }, {
          id: "9c4cf97e-5057-11eb-8044-b3d5df9caa21",
          resource: "this is fine.png",
          icon: "image",
          last_modified: 1599999999
        }]
      }
    }
  }
</script>
```

```js
<template>
  <section>
    <h3 class="oc-heading-divider">
      A table with long text showing the different text wrapping mechanisms
    </h3>
    <oc-table :fields="fields" :data="data" :has-header="true" :hover="true" />
  </section>
</template>
<script>
  export default {
    computed: {
      fields() {
        return [
          {
            name: "truncate",
            title: "truncate",
            wrap: "truncate"
          },
          {
            name: "break",
            title: "break",
            wrap: "break"
          },
          {
            name: "nowrap",
            title: "nowrap",
            wrap: "nowrap"
          }
        ]
      },
      data() {
        return [
          {
            truncate: "This is very long text that will get truncated eventually. This is very long text that will get truncated eventually. This is very long text that will get truncated eventually. This is very long text that will get truncated eventually. This is very long text that will get truncated eventually. This is very long text that will get truncated eventually. This is very long text that will get truncated eventually.",
            break: "This text is supposed to break to new lines if it becomes too long. This text is supposed to break to new lines if it becomes too long. This text is supposed to break to new lines if it becomes too long. This text is supposed to break to new lines if it becomes too long.",
            nowrap: "This text stays on one line."
          }
        ]
      }
    }
  }
</script>
```
```js
<template>
  <section>
    <h3 class="oc-heading-divider">
      An interactive table showcasing different table features/properties
    </h3>
    <oc-table :fields="fields" :data="data" :has-header="hasHeader" :sticky="stickyHeader" :hover="hover">
      <template v-slot:action="rowData">
        <oc-button @click="toggle(rowData)" size="small">Toggle</oc-button>
      </template>
    </oc-table>
  </section>
</template>
<script>
  export default {
    data() {
      return {
        hasHeader: true,
        stickyHeader: false,
        hover: true
      }
    },
    computed: {
      fields() {
        return [
          {
            name: "property",
            title: "Property",
            sortable: true
          },
          {
            name: "description",
            title: "Description",
            width: "expand",
            sortable: true
          },
          {
            name: "state",
            title: "State",
            width: "shrink",
            sortable: true
          },
          {
            name: "action",
            title: "",
            type: "slot",
            width: "shrink"
          }
        ]
      },
      data() {
        return [
          {
            property: "has-header",
            description: "Whether or not the table header is visible",
            state: this.hasHeader,
            variable: "hasHeader"
          },
          {
            property: "sticky",
            description: "Whether or not the table header is sticky, causing it to float above the table content when scrolling",
            state: this.stickyHeader,
            variable: "stickyHeader"
          },
          {
            property: "hover",
            description: "Highlight table rows on mouseover",
            state: this.hover,
            variable: "hover"
          }
        ]
      }
    },
    methods: {
      toggle(rowData) {
        this[rowData.item.variable] = !this[rowData.item.variable];
      }
    },
  }
</script>
```
</docs>
