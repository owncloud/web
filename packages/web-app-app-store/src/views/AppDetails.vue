<template>
  <div class="app-details oc-p-m">
    <div class="back-to-list">
      <router-link :to="{ name: `${APPID}-list` }" class="oc-flex oc-flex-middle">
        <oc-icon name="arrow-left-s" fill-type="line" />
        <span v-text="$gettext('Back to list')" />
      </router-link>
    </div>
    <app-cover :app="app" />
    <div class="app-content">
      <div class="oc-flex oc-flex-middle">
        <h2 class="oc-my-s oc-text-truncate">{{ app.name }}</h2>
        <span class="oc-ml-s oc-text-muted oc-text-small">
          v{{ app.mostRecentVersion.version }}
        </span>
      </div>
      <p class="oc-my-rm">{{ app.subtitle }}</p>
    </div>
    <div v-if="app.description">
      <h3>{{ $gettext('Details') }}</h3>
      <p class="oc-my-s">{{ app.description }}</p>
    </div>
    <div v-if="app.tags">
      <h3>{{ $gettext('Tags') }}</h3>
      <app-tags :app="app" />
    </div>
    <div v-if="app.versions">
      <h3>{{ $gettext('Version History') }}</h3>
      <app-versions :app="app" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { App } from '../types'
import { APPID } from '../appid'
import { useRouteParam } from '@ownclouders/web-pkg'
import { useAppsStore } from '../piniaStores'
import AppCover from '../components/AppCover.vue'
import AppTags from '../components/AppTags.vue'
import AppVersions from '../components/AppVersions.vue'

export default defineComponent({
  components: { AppVersions, AppTags, AppCover },
  setup() {
    const appIdRouteParam = useRouteParam('appId')
    const appId = computed(() => {
      return decodeURIComponent(unref(appIdRouteParam))
    })
    const appsStore = useAppsStore()

    const app = computed<App>(() => {
      return appsStore.getById(unref(appId))
    })

    return {
      app,
      APPID
    }
  }
})
</script>

<style lang="scss">
.app-details {
  overflow: auto;
  max-width: 600px;
  margin: 0 auto;

  display: flex;
  flex-flow: column;
  gap: 1rem;

  .back-to-list {
    border-bottom: 1px solid var(--oc-color-border);
    margin-bottom: var(--oc-space-medium);
  }
}
</style>
