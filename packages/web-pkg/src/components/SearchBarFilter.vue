<template>
  <div class="oc-location-search oc-position-small oc-position-center-right oc-mt-rm" @click.stop>
    <div v-if="currentSelection">
      <oc-filter-chip
        :is-toggle="false"
        :is-toggle-active="false"
        :filter-label="currentSelectionTitle"
        :selected-item-names="[]"
        class="oc-search-bar-filter"
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
            :data-test-id="option.id"
            @click="onOptionSelected(option)"
          >
            <span>{{ option.title }}</span>
            <div v-if="option.id === currentSelection.id" class="oc-flex">
              <oc-icon name="check" />
            </div>
          </oc-button> </template
      ></oc-filter-chip>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref, unref, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import { SearchLocationFilterConstants, useRouteQuery } from '../composables'

type LocationOption = {
  id: string
  title: string
  enabled: Ref<boolean> | boolean
}

export default defineComponent({
  name: 'SearchBarFilter',
  props: {
    currentFolderAvailable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const useScopeQueryValue = useRouteQuery('useScope')

    const currentSelection = ref<LocationOption>()
    const userSelection = ref<LocationOption>()
    const currentSelectionTitle = computed(() => $gettext(currentSelection.value?.title))
    const locationOptions = computed<LocationOption[]>(() => [
      {
        id: SearchLocationFilterConstants.currentFolder,
        title: $gettext('Current folder'),
        enabled: props.currentFolderAvailable
      },
      {
        id: SearchLocationFilterConstants.allFiles,
        title: $gettext('All files'),
        enabled: true
      }
    ])

    const isIndexGreaterZero = (index: number): boolean => {
      return index > 0
    }

    watch(
      () => props.currentFolderAvailable,
      () => {
        if (unref(useScopeQueryValue)) {
          const useScope = unref(useScopeQueryValue).toString() === 'true'
          if (useScope) {
            currentSelection.value = unref(locationOptions).find(
              ({ id }) => id === SearchLocationFilterConstants.currentFolder
            )
            return
          }
          currentSelection.value = unref(locationOptions).find(
            ({ id }) => id === SearchLocationFilterConstants.allFiles
          )
          return
        }

        if (!props.currentFolderAvailable) {
          currentSelection.value = unref(locationOptions).find(
            ({ id }) => id === SearchLocationFilterConstants.allFiles
          )
          return
        }

        if (unref(userSelection)) {
          currentSelection.value = unref(locationOptions).find(
            ({ id }) => id === unref(userSelection).id
          )
          return
        }

        currentSelection.value = unref(locationOptions).find(
          ({ id }) => id === SearchLocationFilterConstants.allFiles
        )
      },
      { immediate: true }
    )

    const onOptionSelected = (option: LocationOption) => {
      userSelection.value = option
      currentSelection.value = option
      emit('update:modelValue', { value: option })
    }

    return {
      currentSelection,
      currentSelectionTitle,
      isIndexGreaterZero,
      onOptionSelected,
      locationOptions
    }
  }
})
</script>

<style lang="scss">
.oc-location-search {
  z-index: 9999;
  margin-right: 34px !important;
  float: right;
  .oc-drop {
    width: 180px;
  }
}
.search-bar-filter-item {
  &:hover {
    background-color: var(--oc-color-surfaceContainerHigh) !important;
  }
}
</style>
