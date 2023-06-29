<template>
  <div>
    <oc-filter-chip
      :is-toggle="false"
      :is-toggle-active="false"
      :filter-label="currentSelection.title"
      :selected-item-names="[]"
      raw
      close-on-click
    >
      <template #default>
        <oc-button
          appearance="raw"
          size="medium"
          v-for="(option, index) in options"
          justify-content="space-between"
          class="search-bar-filter-item oc-flex oc-flex-middle oc-width-1-1 oc-py-xs oc-px-s"
          :class="{ 'oc-mt-s': parseInt(index) > 0 }"
          :key="index"
          @click="onOptionSelected(option)"
          :disabled="!option.enabled"
        >
          <span>{{ option.title }}</span>
          <div class="oc-flex" v-if="option.id === currentSelection.id">
            <oc-icon name="check" />
          </div>
        </oc-button> </template
    ></oc-filter-chip>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import 'vue-select/dist/vue-select.css'

export default defineComponent({
  name: 'OcSearchBarFilter',
  props: {
    options: {
      type: Object,
      required: false,
      default: []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const currentSelection = ref(props.options.find((option) => option.default))

    watch(
      () => props.options,
      () => {
        currentSelection.value =
          props.options.find((option) => option.enabled && option.default) ||
          props.options.find((option) => option.enabled)
        emit('update:modelValue', { value: currentSelection.value, userEvent: false })
      },
      { immediate: true, deep: true }
    )

    return { currentSelection }
  },
  methods: {
    onOptionSelected(option: string) {
      this.currentSelection = option
      this.$emit('update:modelValue', { value: option, userEvent: true })
    }
  }
})
</script>

<style lang="scss">
.search-bar-filter-item {
  &:hover {
    background-color: var(--oc-color-background-hover) !important;
  }
}
</style>
