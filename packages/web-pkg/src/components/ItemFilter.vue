<template>
  <div class="item-filter oc-flex">
    <oc-filter-chip
      :filter-label="filterName"
      :selected-item-names="selectedItems.map((i) => i[displayNameAttribute])"
      @clear-filter="clearFilter"
      @show-drop="showDrop"
    >
      <template #default>
        <oc-text-input
          v-if="showFilter && filterableAttributes.length"
          ref="filterInputRef"
          v-model="filterTerm"
          class="item-filter-input oc-mb-m oc-mt-s"
          autocomplete="off"
          :placeholder="$gettext('Filter')"
        />
        <oc-list class="item-filter-list">
          <li v-for="item in displayedItems" :key="item.key" class="oc-my-xs">
            <component
              :is="isSelectionAllowed(item) ? 'oc-button' : 'div'"
              class="item-filter-list-item oc-flex oc-flex-left oc-flex-middle oc-width-1-1 oc-p-xs"
              justify-content="left"
              appearance="raw"
              @click="toggleItemSelection(item)"
            >
              <div>
                <oc-checkbox
                  size="large"
                  class="item-filter-checkbox"
                  :label="$gettext('Toggle selection')"
                  :model-value="isItemSelected(item)"
                  :disabled="!isSelectionAllowed(item)"
                  hide-label
                  @update:model-value="toggleItemSelection(item)"
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
import { computed, defineComponent, nextTick, onMounted, ref, unref, watch } from 'vue'
import Fuse from 'fuse.js'
import omit from 'lodash-es/omit'
import { useRoute, useRouteQuery, useRouter } from 'web-pkg'
import { queryItemAsString } from 'web-pkg/src/composables/appDefaults'

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
    },
    filterableAttributes: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  emits: ['selectionChange'],
  setup: function (props, { emit }) {
    const router = useRouter()
    const currentRoute = useRoute()
    const filterInputRef = ref()
    const selectedItems = ref([])
    const displayedItems = ref(props.items)

    const queryParam = `q_${props.filterName.toLowerCase()}`
    const currentRouteQuery = useRouteQuery(queryParam)
    const getQueryStr = () => {
      let queryStr = ''
      for (const item of unref(selectedItems)) {
        queryStr += `${item[props.displayNameAttribute].toLowerCase()}+`
      }
      return queryStr.slice(0, -1)
    }
    const setRouteQuery = () => {
      router.push({
        query: {
          ...omit(unref(currentRoute).query, [queryParam]),
          ...(!!unref(selectedItems).length && { [queryParam]: getQueryStr() })
        }
      })
    }

    const selectedItemString = computed(() => {
      if (!unref(selectedItems).length) {
        return props.filterName
      }
      return unref(selectedItems)[0][props.displayNameAttribute]
    })

    const isItemSelected = (item) => {
      return !!unref(selectedItems).find((s) => s.id === item.id)
    }
    const isSelectionAllowed = (item) => {
      return props.allowMultiple || !unref(selectedItems).length || isItemSelected(item)
    }
    const toggleItemSelection = (item) => {
      if (!isSelectionAllowed(item)) {
        return
      }
      if (isItemSelected(item)) {
        selectedItems.value = unref(selectedItems).filter((s) => s.id !== item.id)
      } else {
        selectedItems.value.push(item)
      }
      emit('selectionChange', unref(selectedItems))
      setRouteQuery()
    }

    const sortItems = (items) => {
      const selectedItemIds = unref(selectedItems).map((i) => i.id)
      return items.sort(
        (a: any, b: any) =>
          (selectedItemIds.includes(b.id) as any) - (selectedItemIds.includes(a.id) as any) ||
          a[props.displayNameAttribute].localeCompare(b[props.displayNameAttribute])
      )
    }

    const filterTerm = ref()
    const filter = (items, filterTerm) => {
      if (!(filterTerm || '').trim()) {
        return items
      }
      const usersSearchEngine = new Fuse(items, {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
        keys: props.filterableAttributes as any
      })

      return usersSearchEngine.search(filterTerm).map((r) => r.item)
    }
    const clearFilter = () => {
      selectedItems.value = []
      emit('selectionChange', unref(selectedItems))
      setRouteQuery()
    }

    const setDisplayedItems = (items) => {
      displayedItems.value = sortItems(items)
    }

    const showDrop = async () => {
      setDisplayedItems(props.items)
      await nextTick()
      unref(filterInputRef).focus()
    }

    watch(filterTerm, () => {
      setDisplayedItems(filter(props.items, unref(filterTerm)))
    })

    onMounted(() => {
      const queryStr = queryItemAsString(unref(currentRouteQuery))
      if (queryStr) {
        const names = queryStr.split('+')
        selectedItems.value = props.items.filter((s) =>
          names.includes(s[props.displayNameAttribute].toLowerCase())
        )
      }
    })

    return {
      queryParam,
      filterInputRef,
      selectedItems,
      selectedItemString,
      clearFilter,
      toggleItemSelection,
      isItemSelected,
      displayedItems,
      filterTerm,
      isSelectionAllowed,
      setDisplayedItems,
      showDrop
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

