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
            >{{ option.title }}</oc-button
          >
        </div>
      </template></oc-filter-chip
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import 'vue-select/dist/vue-select.css'

/**
 * Select component with a trigger and dropdown based on [Vue Select](https://vue-select.org/)
 */
export default defineComponent({
  name: 'OcSearchBarFilter',
  props: {
    options: {
      type: Array<String>,
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
    const currentSelection = ref(props.options[0])
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
