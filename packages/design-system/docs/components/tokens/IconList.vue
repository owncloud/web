<template>
  <div>
    <oc-search-bar
      v-model="query"
      :is-filter="true"
      :button-hidden="true"
      label="Filter icons by name"
      class="oc-mb"
    />
    <div class="oc-mb oc-px">
      <strong>Displaying {{ filteredIcons.length }} out of {{ icons.length }} icons</strong>
    </div>
    <oc-table :fields="fields" :data="filteredIcons" :lazy="true">
      <template #passive="{ item }">
        <oc-icon
          :name="item.filename"
          :fill-type="item.fillType"
          size="large"
          variation="passive"
        />
      </template>
      <template #primary="{ item }">
        <oc-icon
          :name="item.filename"
          :fill-type="item.fillType"
          size="large"
          variation="primary"
        />
      </template>
      <template #success="{ item }">
        <oc-icon
          :name="item.filename"
          :fill-type="item.fillType"
          size="large"
          variation="success"
        />
      </template>
      <template #warning="{ item }">
        <oc-icon
          :name="item.filename"
          :fill-type="item.fillType"
          size="large"
          variation="warning"
        />
      </template>
      <template #danger="{ item }">
        <oc-icon :name="item.filename" :fill-type="item.fillType" size="large" variation="danger" />
      </template>
      <template #inverse="{ item }">
        <span
          style="background-color: var(--oc-color-swatch-brand-default); display: inline-block"
          class="oc-icon-l"
        >
          <oc-icon
            :name="item.filename"
            :fill-type="item.fillType"
            size="large"
            variation="inverse"
          />
        </span>
      </template>
      <template #filename="{ item }">
        <highlighted-text :value="item.filename" :highlighted="query" />
      </template>
    </oc-table>
  </div>
</template>

<script>
import OcIcon from '../../../src/components/OcIcon/OcIcon.vue'
import OcTable from '../../../src/components/OcTable/OcTable.vue'
import OcSearchBar from '../../../src/components/OcSearchBar/OcSearchBar'
import HighlightedText from './_HighlightedText'
const req = require.context('../../../src/assets/icons/', true, /^\.\/.*\.svg$/)

/**
 * All known icons in the ownCloud Design System
 * <p>
 *  Icons made by <a href="https://remixicon.com/">Remixicon</a> and, in the case of the `resource-type-*` icons, <a href="https://fontawesome.com/">Font Awesome</a> (available under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) license).
 * </p>
 */
export default {
  name: 'IconList',
  components: { HighlightedText, OcSearchBar, OcIcon, OcTable },
  data() {
    return {
      query: '',
      icons: []
    }
  },
  computed: {
    filteredIcons() {
      return this.icons
        .filter((icon) => icon.includes(this.query))
        .map((icon) => ({
          filename: icon.replace('-fill', '').replace('-line', ''),
          fillType: icon.endsWith('-fill') ? 'fill' : icon.endsWith('-line') ? 'line' : 'none'
        }))
    },
    fields() {
      return [
        {
          name: 'passive',
          title: 'Passive',
          type: 'slot'
        },
        {
          name: 'primary',
          title: 'Primary',
          type: 'slot'
        },
        {
          name: 'success',
          title: 'Success',
          type: 'slot'
        },
        {
          name: 'warning',
          title: 'Warning',
          type: 'slot'
        },
        {
          name: 'danger',
          title: 'Danger',
          type: 'slot'
        },
        {
          name: 'inverse',
          title: 'Inverse',
          type: 'slot'
        },
        {
          name: 'fillType',
          title: 'Fill type'
        },
        {
          name: 'filename',
          title: 'Icon name',
          width: 'expand',
          type: 'slot'
        }
      ]
    }
  },
  mounted() {
    this.icons = req.keys().map((filename) => {
      return filename.split('.').slice(0, -1).join('.').substring(2)
    })
  }
}
</script>

<docs>
  ```
  <icon-list />
  ```
</docs>
