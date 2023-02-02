<template>
  <div class="oc-filter-chip oc-flex">
    <oc-button
      :id="id"
      class="oc-filter-chip-button"
      :class="{ 'oc-filter-chip-button-selected': filterActive }"
      appearance="raw"
    >
      <oc-icon v-if="filterActive" name="check" size="small" color="var(--oc-color-text-inverse)" />
      <span class="oc-text-truncate" v-text="displayedText" />
      <span v-if="itemCount > 1" v-text="` +${itemCount - 1}`" />
      <oc-icon v-if="!filterActive" name="arrow-down-s" size="small" />
    </oc-button>
    <oc-drop
      :toggle="'#' + id"
      class="oc-filter-chip-drop"
      mode="click"
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
import { defineComponent } from 'vue'
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
    displayedText: {
      type: String,
      required: true
    },
    itemCount: {
      type: Number,
      required: false,
      default: 0
    },
    filterActive: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['clearFilter', 'hideDrop', 'showDrop']
})
</script>

<style lang="scss">
.oc-filter-chip {
  &-button {
    align-items: center;
    background-color: var(--oc-color-background-default) !important;
    color: var(--oc-color-text-muted) !important;
    border: 1px solid var(--oc-color-text-muted);
    border-radius: 99px;
    box-sizing: border-box;
    display: inline-flex;
    gap: var(--oc-space-xsmall);
    text-decoration: none;
    font-size: 0.75rem;
    line-height: 16px;
    max-width: 120px;
    padding: var(--oc-space-xsmall) var(--oc-space-small);

    &-selected,
    &-selected:hover {
      background-color: var(--oc-color-swatch-primary-default) !important;
      color: var(--oc-color-text-inverse) !important;
      border-top-left-radius: 99px;
      border-bottom-left-radius: 99px;
      border-top-right-radius: 0px;
      border-bottom-right-radius: 0px;
    }
  }
  &-clear,
  &-clear:hover {
    margin-left: 1px;
    background-color: var(--oc-color-swatch-primary-default) !important;
    color: var(--oc-color-text-inverse) !important;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-top-right-radius: 99px;
    border-bottom-right-radius: 99px;
  }
}
</style>

