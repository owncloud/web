<template>
  <div class="item-filter oc-flex" :class="`item-filter-${filterName}`">
    <oc-filter-chip
      :filter-label="filterLabel"
      :selected-item-names="selectedItems.map((i) => i[displayNameAttribute])"
      :close-on-click="closeOnClick"
      @clear-filter="clearFilter"
      @show-drop="showDrop"
    >
      <template #default>
        <oc-text-input
          v-if="showOptionFilter && filterableAttributes.length"
          ref="filterInputRef"
          v-model="filterTerm"
          class="item-filter-input oc-mb-m oc-mt-s"
          autocomplete="off"
          :label="optionFilterLabel === '' ? $gettext('Filter list') : optionFilterLabel"
        />
        <div ref="itemFilterListRef">
          <oc-list class="item-filter-list">
            <li v-for="(item, index) in displayedItems" :key="index" class="oc-my-xs">
              <oc-button
                class="item-filter-list-item oc-flex oc-flex-middle oc-width-1-1 oc-p-xs"
                :class="{
                  'item-filter-list-item-active': !allowMultiple && isItemSelected(item),
                  'oc-flex-left': allowMultiple,
                  'oc-flex-between': !allowMultiple
                }"
                justify-content="space-between"
                appearance="raw"
                :data-test-value="item[displayNameAttribute]"
                @click="toggleItemSelection(item)"
              >
                <div class="oc-flex oc-flex-middle oc-text-truncate">
                  <oc-checkbox
                    v-if="allowMultiple"
                    size="large"
                    class="item-filter-checkbox oc-mr-s"
                    :label="$gettext('Toggle selection')"
                    :model-value="isItemSelected(item)"
                    hide-label
                    @update:model-value="toggleItemSelection(item)"
                    @click.stop
                  />
                  <div>
                    <slot name="image" :item="item" />
                  </div>
                  <div class="oc-text-truncate oc-ml-s">
                    <slot name="item" :item="item" />
                  </div>
                </div>
                <div class="oc-flex">
                  <oc-icon v-if="!allowMultiple && isItemSelected(item)" name="check" />
                </div>
              </oc-button>
            </li>
          </oc-list>
        </div>
      </template>
    </oc-filter-chip>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref, unref, watch } from 'vue'
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import omit from 'lodash-es/omit'
import { defaultFuseOptions, useRoute, useRouteQuery, useRouter } from 'web-pkg'
import { queryItemAsString } from 'web-pkg/src/composables/appDefaults'

export default defineComponent({
  name: 'ItemFilter',
  props: {
    filterLabel: {
      type: String,
      required: true
    },
    filterName: {
      type: String,
      required: true
    },
    optionFilterLabel: {
      type: String,
      required: false,
      default: ''
    },
    showOptionFilter: {
      type: Boolean,
      required: false,
      default: false
    },
    items: {
      type: Array,
      required: true
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
    },
    closeOnClick: {
      type: Boolean,
      default: false
    }
  },
  emits: ['selectionChange'],
  setup: function (props, { emit, expose }) {
    const router = useRouter()
    const currentRoute = useRoute()
    const filterInputRef = ref()
    const selectedItems = ref([])
    const displayedItems = ref(props.items)
    const markInstance = ref(null)
    const itemFilterListRef = ref(null)

    const queryParam = `q_${props.filterName}`
    const currentRouteQuery = useRouteQuery(queryParam)
    const setRouteQuery = () => {
      return router.push({
        query: {
          ...omit(unref(currentRoute).query, [queryParam]),
          ...(!!unref(selectedItems).length && {
            [queryParam]: unref(selectedItems)
              .reduce((acc, item) => {
                acc += `${item.id}+`
                return acc
              }, '')
              .slice(0, -1)
          })
        }
      })
    }

    const isItemSelected = (item) => {
      return !!unref(selectedItems).find((s) => s.id === item.id)
    }

    const toggleItemSelection = async (item) => {
      if (isItemSelected(item)) {
        selectedItems.value = unref(selectedItems).filter((s) => s.id !== item.id)
      } else {
        if (!props.allowMultiple) {
          selectedItems.value = []
        }
        selectedItems.value.push(item)
      }
      await setRouteQuery()
      emit('selectionChange', unref(selectedItems))
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
        ...defaultFuseOptions,
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
      if (unref(itemFilterListRef)) {
        markInstance.value = new Mark(unref(itemFilterListRef))
        unref(markInstance).unmark()
        unref(markInstance).mark(unref(filterTerm), {
          element: 'span',
          className: 'highlight-mark'
        })
      }
    })

    const setSelectedItemsBasedOnQuery = () => {
      const queryStr = queryItemAsString(unref(currentRouteQuery))
      if (queryStr) {
        const ids = queryStr.split('+')
        selectedItems.value = props.items.filter((s: any) => ids.includes(s.id))
      }
    }

    expose({ setSelectedItemsBasedOnQuery })

    onMounted(() => {
      setSelectedItemsBasedOnQuery()
    })

    return {
      clearFilter,
      displayedItems,
      filterInputRef,
      filterTerm,
      isItemSelected,
      itemFilterListRef,
      queryParam,
      selectedItems,
      setDisplayedItems,
      showDrop,
      toggleItemSelection
    }
  }
})
</script>

<style lang="scss">
.item-filter {
  &-list {
    li {
      &:first-child {
        margin-top: 0 !important;
      }
      &:last-child {
        margin-bottom: 0 !important;
      }
    }

    &-item {
      line-height: 1.5;
      gap: 8px;

      &:hover,
      &-active {
        background-color: var(--oc-color-background-hover) !important;
      }
    }
  }
}
</style>
