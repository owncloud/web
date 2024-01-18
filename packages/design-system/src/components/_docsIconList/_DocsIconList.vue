<template>
  <div>
    <oc-search-bar
      :value="query"
      :is-filter="true"
      :button-hidden="true"
      label="Filter icons by name"
      class="oc-mb"
      @input="updateQuery"
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
      <template #filename="{ item }">
        <highlighted-text :value="item.filename" :highlighted="query" />
      </template>
    </oc-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import OcIcon from '../OcIcon/OcIcon.vue'
import OcTable from '../OcTable/OcTable.vue'
import OcSearchBar from '../OcSearchBar/OcSearchBar.vue'
import HighlightedText from '../_DocsHighlightedText/_DocsHighlightedText.vue'
import { ref } from 'vue'
const req = (require as any).context('../../../src/assets/icons/', true, /^\.\/.*\.svg$/)

/**
 * All known icons in the ownCloud Design System
 * <p>
 *  Icons made by <a href="https://remixicon.com/">Remixicon</a> and, in the case of the `resource-type-*` icons, <a href="https://fontawesome.com/">Font Awesome</a> (available under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) license).
 * </p>
 */
export default defineComponent({
  name: 'DocsIconList',
  components: { HighlightedText, OcSearchBar, OcIcon, OcTable },

  setup() {
    const query = ref('')

    const updateQuery = (value) => {
      query.value = value
    }

    return { query, updateQuery }
  },
  data() {
    return {
      icons: []
    }
  },
  computed: {
    filteredIcons() {
      return this.icons
        .filter((icon) => icon.includes(this.query))
        .map((icon, index) => ({
          id: index,
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
})
</script>

<docs>
  ```
  <docs-icon-list />
  ```
</docs>
