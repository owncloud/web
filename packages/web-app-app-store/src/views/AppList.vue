<template>
  <div class="app-list oc-px">
    <h2 v-text="$gettext('App Store')" />
    <div class="oc-flex oc-flex-middle">
      <oc-text-input
        id="apps-filter"
        v-model.trim="filterTerm"
        :label="$gettext('Search')"
        :clear-button-enabled="true"
        autocomplete="off"
      />
    </div>
    <oc-list class="app-tiles">
      <app-tile
        v-for="app in filteredApps"
        :key="`app-${app.repository.name}-${app.id}`"
        :app="app"
        class="oc-my-m"
        @search="setFilterTerm"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, unref, watch } from 'vue'
import Mark from 'mark.js'
import Fuse from 'fuse.js'
import { useAppsStore } from '../piniaStores'
import AppTile from '../components/AppTile.vue'
import { storeToRefs } from 'pinia'
import { App } from '../types'
import { defaultFuseOptions } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'AppList',
  components: { AppTile },
  setup() {
    const appsStore = useAppsStore()
    const { apps } = storeToRefs(appsStore)

    const filterTerm = ref('')
    const setFilterTerm = (term: string) => {
      filterTerm.value = term.trim()
    }
    const filter = (apps: App[], filterTerm: string) => {
      if (!(filterTerm || '').trim()) {
        return apps
      }
      const searchEngine = new Fuse(apps, {
        ...defaultFuseOptions,
        keys: ['name', 'subtitle', 'tags']
      })
      return searchEngine.search(filterTerm).map((r) => r.item)
    }
    const filteredApps = computed(() => {
      // TODO: debounce the filtering by 100-300ms
      return filter(unref(apps), unref(filterTerm)).sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      )
    })

    const markInstance = ref(null)
    onMounted(async () => {
      await nextTick()
      markInstance.value = new Mark('.mark-element')
    })
    watch(filterTerm, () => {
      unref(markInstance)?.unmark()
      if (unref(filterTerm)) {
        unref(markInstance)?.mark(unref(filterTerm), {
          element: 'span',
          className: 'mark-highlight'
        })
      }
    })

    return {
      filteredApps,
      filterTerm,
      setFilterTerm
    }
  }
})
</script>

<style lang="scss">
.app-list {
  overflow: auto;

  .app-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }
}
</style>
