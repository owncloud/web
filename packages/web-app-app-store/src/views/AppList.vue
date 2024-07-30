<template>
  <div class="app-list oc-px">
    <h2 v-text="$gettext('Apps')" />
    <oc-list>
      <app-list-item
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
import AppListItem from '../components/AppListItem.vue'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'AppList',
  components: { AppListItem },
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
}
</style>
