<template>
  <div class="oc-page-size">
    <label
      class="oc-page-size-label"
      :for="selectId"
      data-testid="oc-page-size-label"
      v-text="label"
    />
    <oc-select
      :input-id="selectId"
      class="oc-page-size-select"
      data-testid="oc-page-size-select"
      :value="selected"
      :options="options"
      :clearable="false"
      :searchable="false"
      @input="emitChange"
    />
  </div>
</template>

<script>
import uniqueId from '../../utils/uniqueId'
import OcSelect from '../OcSelect/OcSelect.vue'

/**
 * Select how many items will be displayed per page
 */
export default {
  name: 'OcPageSize',
  status: 'ready',
  release: '8.0.0',

  components: { OcSelect },

  model: {
    prop: 'selected',
    event: 'change'
  },

  props: {
    /**
     * All possible sizes that the user can pick from
     */
    options: {
      type: Array,
      required: true
    },

    /**
     * Label of the select
     */
    label: {
      type: String,
      required: true
    },

    /**
     * Selected size
     * @model
     */
    selected: {
      type: [String, Number],
      required: true
    },

    /**
     * An ID of the select component.
     * Default value is a unique ID with prefix `oc-page-size`
     */
    selectId: {
      type: String,
      required: false,
      default: uniqueId('oc-page-size-')
    }
  },

  methods: {
    emitChange(value) {
      /**
       * Triggers when a value is selected
       *
       * @event change
       * @property {number|string} value selected value
       */
      this.$emit('change', value)
    }
  }
}
</script>

<style lang="scss">
.oc-page-size {
  align-items: center;
  display: flex;
  gap: var(--oc-space-xsmall);

  &-select,
  &-select .vs__dropdown-menu {
    min-width: var(--oc-size-width-xsmall);
  }
}
</style>

<docs>
```js
<template>
  <div>
    <oc-page-size v-model="selected" label="Items per page" :options="[100, 500, 1000, 'All']" />
    Selected: {{ selected }}
  </div>
</template>
<script>
  export default {
    data: () => ({
      selected: 100,
    })
  }
</script>
```
</docs>
