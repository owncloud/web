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
          v-for="(option, index) in locationOptions"
          :key="index"
          appearance="raw"
          size="medium"
          justify-content="space-between"
          class="search-bar-filter-item oc-flex oc-flex-middle oc-width-1-1 oc-py-xs oc-px-s"
          :class="{ 'oc-mt-s': isIndexGreaterZero(index) }"
          :disabled="!option.enabled"
          @click="onOptionSelected(option)"
        >
          <span>{{ option.title }}</span>
          <div v-if="option.id === currentSelection.id" class="oc-flex">
            <oc-icon name="check" />
          </div>
        </oc-button> </template
    ></oc-filter-chip>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'OcSearchBarFilter',
  props: {
    locationOptions: {
      type: Array<any>,
      required: false,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const currentSelection = ref(props.locationOptions.find((option) => option.default))
    const userSelected = ref(null)
    const isIndexGreaterZero = (index): boolean => {
      return parseInt(index) > 0
    }

    watch(
      () => props.locationOptions,
      () => {
        if (userSelected.value) {
          const item = props.locationOptions.find((option) => option.id === userSelected.value)
          if (item.enabled) {
            currentSelection.value = item
            emit('update:modelValue', { value: currentSelection.value })
            return
          }
          currentSelection.value = props.locationOptions.find((option) => option.enabled)
          emit('update:modelValue', { value: currentSelection.value })
          return
        }
        currentSelection.value =
          props.locationOptions.find((option) => option.enabled && option.default) ||
          props.locationOptions.find((option) => option.enabled)
        emit('update:modelValue', { value: currentSelection.value })
      },
      { immediate: true, deep: true }
    )

    const onOptionSelected = (option) => {
      userSelected.value = option.id
      currentSelection.value = option
      emit('update:modelValue', { value: option })
    }

    return { currentSelection, isIndexGreaterZero, userSelected, onOptionSelected }
  },
  methods: {}
})
</script>

<style lang="scss">
.search-bar-filter-item {
  &:hover {
    background-color: var(--oc-color-background-hover) !important;
  }
}
</style>
