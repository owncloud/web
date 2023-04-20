<template>
  <div class="oc-filter-chip oc-flex">
    <oc-button
      :id="id"
      class="oc-filter-chip-button oc-pill"
      :class="{ 'oc-filter-chip-button-selected': filterActive }"
      appearance="raw"
    >
      <oc-icon v-if="filterActive" name="check" size="small" color="var(--oc-color-text-inverse)" />
      <span
        class="oc-text-truncate oc-filter-chip-label"
        v-text="!!selectedItemNames.length ? selectedItemNames[0] : filterLabel"
      />
      <span v-if="selectedItemNames.length > 1" v-text="` +${selectedItemNames.length - 1}`" />
      <oc-icon v-if="!filterActive" name="arrow-down-s" size="small" />
    </oc-button>
    <oc-drop
      :toggle="'#' + id"
      class="oc-filter-chip-drop"
      mode="click"
      padding-size="small"
      @hide-drop="$emit('hideDrop')"
      @show-drop="$emit('showDrop')"
    >
      <slot />
    </oc-drop>
    <oc-button
      v-if="filterActive"
      v-oc-tooltip="$gettext('Clear filter')"
      class="oc-filter-chip-clear oc-px-xs"
      appearance="raw"
      @click="$emit('clearFilter')"
    >
      <oc-icon name="close" size="small" color="var(--oc-color-text-inverse)" />
    </oc-button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import uniqueId from '../../utils/uniqueId'

export default defineComponent({
  name: 'OcFilterChip',
  status: 'ready',
  release: '15.0.0',
  props: {
    id: {
      type: String,
      required: false,
      default: () => uniqueId('oc-filter-chip-')
    },
    filterLabel: {
      type: String,
      required: true
    },
    selectedItemNames: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  emits: ['clearFilter', 'hideDrop', 'showDrop'],
  setup(props) {
    const filterActive = computed(() => {
      return !!props.selectedItemNames.length
    })
    return { filterActive }
  }
})
</script>

<style lang="scss">
.oc-filter-chip {
  &-button {
    align-items: center;
    background-color: var(--oc-color-background-default) !important;
    color: var(--oc-color-text-muted) !important;
    border: 1px solid var(--oc-color-text-muted);
    box-sizing: border-box;
    display: inline-flex;
    gap: var(--oc-space-xsmall);
    text-decoration: none;
    font-size: var(--oc-font-size-xsmall);
    line-height: 1rem;
    max-width: 120px;
    padding: var(--oc-space-xsmall) var(--oc-space-small) !important;

    &-selected,
    &-selected:hover {
      background-color: var(--oc-color-swatch-primary-default) !important;
      color: var(--oc-color-text-inverse) !important;
      border-top-left-radius: 99px !important;
      border-bottom-left-radius: 99px !important;
      border-top-right-radius: 0px !important;
      border-bottom-right-radius: 0px !important;
    }
  }
  &-clear,
  &-clear:hover {
    margin-left: 1px;
    background-color: var(--oc-color-swatch-primary-default) !important;
    color: var(--oc-color-text-inverse) !important;
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-top-right-radius: 99px !important;
    border-bottom-right-radius: 99px !important;
  }
}
</style>

