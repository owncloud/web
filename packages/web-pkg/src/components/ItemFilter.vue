<template>
  <div class="item-filter oc-flex">
    <oc-filter-chip
      :displayed-text="selectedItemString"
      :filter-active="!!selectedItems.length"
      @clear-filter="clearFilter"
      @show-drop="setDisplayedItems(items)"
    >
      <template #default>
        <oc-text-input
          v-if="showFilter"
          v-model="filterTerm"
          class="item-filter-input oc-mb-m"
          autocomplete="off"
          :placeholder="$gettext('Filter')"
        />
        <oc-list class="item-filter-list">
          <li v-for="item in displayedItems" :key="item.key" class="oc-mt-s">
            <component
              :is="isSelectionAllowed(item) ? 'oc-button' : 'div'"
              class="item-filter-list-item oc-flex oc-flex-left oc-flex-middle oc-width-1-1"
              justify-content="left"
              appearance="raw"
              @click="toggleItem(item)"
            >
              <div>
                <oc-checkbox
                  size="large"
                  class="item-filter-checkbox"
                  :label="$gettext('Toggle selection')"
                  :model-value="isItemSelected(item)"
                  :disabled="!isSelectionAllowed(item)"
                  hide-label
                  @update:model-value="toggleItem(item)"
                  @click.stop
                />
              </div>
              <div>
                <slot name="image" :item="item" />
              </div>
              <div>
                <slot name="item" :item="item" />
              </div>
            </component>
          </li>
        </oc-list>
      </template>
    </oc-filter-chip>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, unref, watch } from 'vue'
import Fuse from 'fuse.js'

export default defineComponent({
  name: 'ItemFilter',
  props: {
    filterName: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    showFilter: {
      type: Boolean,
      required: false,
      default: false
    },
    allowMultiple: {
      type: Boolean,
      required: false,
      default: false
    },
    displayNameAttribute: {
      type: String,
      required: false,
      default: 'name'
    }
  },
  setup: function (props) {
    const selectedItems = ref([])

    const selectedItemString = computed(() => {
      if (!unref(selectedItems).length) {
        return props.filterName
      }
      if (unref(selectedItems).length === 1) {
        return unref(selectedItems)[0][props.displayNameAttribute]
      }
      return `${unref(selectedItems)[0][props.displayNameAttribute]}, +${
        unref(selectedItems).length - 1
      }`
    })

    const clearFilter = () => {
      selectedItems.value = []
    }
    const isItemSelected = (item) => {
      return !!unref(selectedItems).find((s) => s.id === item.id)
    }
    const isSelectionAllowed = (item) => {
      return props.allowMultiple || !unref(selectedItems).length || isItemSelected(item)
    }
    const toggleItem = (item) => {
      if (!isSelectionAllowed(item)) {
        return
      }
      if (isItemSelected(item)) {
        selectedItems.value = unref(selectedItems).filter((s) => s.id !== item.id)
        return
      }
      selectedItems.value.push(item)
    }

    const sortItems = (items) => {
      const selectedItemIds = unref(selectedItems).map((i) => i.id)
      return items.sort(
        (a: any, b: any) =>
          (selectedItemIds.includes(b.id) as any) - (selectedItemIds.includes(a.id) as any) ||
          a[props.displayNameAttribute].localeCompare(b[props.displayNameAttribute])
      )
    }

    const displayedItems = ref(props.items)
    const filterTerm = ref()

    const filter = (users, filterTerm) => {
      if (!(filterTerm || '').trim()) {
        return users
      }
      const usersSearchEngine = new Fuse(users, {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
        keys: [props.displayNameAttribute]
      })

      return usersSearchEngine.search(filterTerm).map((r) => r.item)
    }
    const setDisplayedItems = (items) => {
      displayedItems.value = sortItems(items)
    }

    watch(filterTerm, () => {
      setDisplayedItems(filter(props.items, unref(filterTerm)))
    })

    return {
      selectedItems,
      selectedItemString,
      clearFilter,
      toggleItem,
      isItemSelected,
      displayedItems,
      filterTerm,
      isSelectionAllowed,
      setDisplayedItems
    }
  }
})
</script>

<style lang="scss">
.item-filter {
  &-list-item {
    line-height: 1.5;
    gap: 8px;

    &:hover {
      background-color: var(--oc-color-background-hover) !important;
    }
  }
  &-input input {
    border: 1px solid var(--oc-color-swatch-inverse-muted);
  }
  &-checkbox input {
    border: 2px solid var(--oc-color-swatch-inverse-muted);
  }
}
</style>

