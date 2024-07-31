<template>
  <div class="app-list oc-px">
    <h2 v-text="$gettext('App Store')" />
    <oc-list class="app-tiles">
      <app-tile
        v-for="app in sortedApps"
        :key="`app-${app.repository.name}-${app.id}`"
        :app="app"
        class="oc-my-m"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { useAppsStore } from '../piniaStores'
import AppTile from '../components/AppTile.vue'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'AppList',
  components: { AppTile },
  setup() {
    const appsStore = useAppsStore()
    const { apps } = storeToRefs(appsStore)

    const sortedApps = computed(() => {
      return unref(apps).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    })

    return {
      sortedApps
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
