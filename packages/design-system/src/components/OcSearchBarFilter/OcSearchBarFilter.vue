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
        <div class="oc-p-xs">
          <oc-button
            appearance="raw"
            size="small"
            v-for="(option, index) in options"
            :class="{ 'oc-mt-s': index > 0 }"
            :key="index"
            @click="onOptionSelected(option)"
          >
            <span v-if="option.enabled">{{ option.title }}</span
            ><span v-else>D: {{ option.title }}</span></oc-button
          >
        </div>
      </template></oc-filter-chip
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, unref, watch } from 'vue'
import 'vue-select/dist/vue-select.css'

/**
 * Select component with a trigger and dropdown based on [Vue Select](https://vue-select.org/)
 */
export default defineComponent({
  name: 'OcSearchBarFilter',
  props: {
    options: {
      type: Object,
      required: false,
      default: []
    },
    modelValue: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props) {
    const currentSelection = ref(props.options.find((option) => option.default))

    watch(
      () => props.options,
      () => {
        currentSelection.value =
          props.options.find((option) => option.enabled && option.default) ||
          props.options.find((option) => option.enabled)
      },
      { immediate: true, deep: true }
    )

    return { currentSelection }
  },
  methods: {
    onOptionSelected(option: string) {
      this.currentSelection = option
      this.$emit('update:modelValue', option)
    }
  }
})
</script>

<style lang="scss"></style>
