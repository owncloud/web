<template>
  <div class="item-filter oc-flex" :class="`item-filter-${filterName}`">
    <oc-filter-chip
      :is-toggle="true"
      :filter-label="filterLabel"
      :is-toggle-active="filterActive"
      @toggle-filter="toggleFilter"
      @clear-filter="toggleFilter"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, unref } from 'vue'
import omit from 'lodash-es/omit'
import { useRoute, useRouteQuery, useRouter, queryItemAsString } from '../composables'

export default defineComponent({
  name: 'ItemFilterToggle',
  props: {
    filterLabel: {
      type: String,
      required: true
    },
    filterName: {
      type: String,
      required: true
    }
  },
  emits: ['toggleFilter'],
  setup: function (props, { emit }) {
    const router = useRouter()
    const currentRoute = useRoute()
    const filterActive = ref<boolean>(false)

    const queryParam = `q_${props.filterName}`
    const currentRouteQuery = useRouteQuery(queryParam)
    const setRouteQuery = () => {
      return router.push({
        query: {
          ...omit(unref(currentRoute).query, [queryParam]),
          [queryParam]: unref(filterActive).toString()
        }
      })
    }

    const toggleFilter = async () => {
      filterActive.value = !unref(filterActive)
      await setRouteQuery()
      emit('toggleFilter', unref(filterActive))
    }

    onMounted(() => {
      const queryStr = queryItemAsString(unref(currentRouteQuery))
      if (queryStr === 'true') {
        filterActive.value = true
      }
    })

    return {
      queryParam,
      filterActive,
      toggleFilter
    }
  }
})
</script>
