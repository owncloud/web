<template>
  <main
    class="external-redirect oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle"
  >
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <div class="oc-card oc-card-body oc-text-center oc-width-large">
      <h2 key="external-redirect-loading">
        <span v-text="$gettext('One moment please…')" />
      </h2>
      <p v-text="$gettext('You are being redirected.')" />
    </div>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, unref, watch } from 'vue'
import { queryItemAsString, useRouteMeta, useRouteParam, useRouteQuery } from '@ownclouders/web-pkg'
import { useRouter } from 'vue-router'
import { omit } from 'lodash-es'
import { useGettext } from 'vue3-gettext'
import { useApplicationReadyStore } from './piniaStores'
import { storeToRefs } from 'pinia'

export default defineComponent({
  setup() {
    const { $gettext } = useGettext()

    const appNameQuery = useRouteQuery('app')
    const appNameParam = useRouteParam('appCatchAll')
    const appName = computed(() => {
      if (unref(appNameParam)) {
        return unref(appNameParam)
      }
      return queryItemAsString(unref(appNameQuery))
    })
    const router = useRouter()
    const { isReady } = storeToRefs(useApplicationReadyStore())

    watch(
      isReady,
      (ready) => {
        if (!ready) {
          return
        }

        router.replace({
          name: `external-${unref(appName).toLowerCase()}-apps`,
          query: omit(unref(router.currentRoute).query, 'app')
        })
      },
      { immediate: true }
    )

    const title = useRouteMeta('title')
    const pageTitle = computed(() => {
      return $gettext(unref(title))
    })

    return {
      pageTitle
    }
  }
})
</script>

<style lang="scss">
.external-redirect {
  .oc-card {
    background: var(--oc-color-background-highlight);
    border-radius: 15px;

    &-body {
      h2 {
        margin-top: 0;
      }
      p {
        font-size: var(--oc-font-size-large);
      }
    }
  }
}
</style>
