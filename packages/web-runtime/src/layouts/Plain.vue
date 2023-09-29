<template>
  <div
    class="oc-login oc-height-viewport"
    :style="{ backgroundImage: 'url(' + backgroundImg + ')' }"
  >
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <router-view />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { useRouteMeta, useStore } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'PlainLayout',
  setup() {
    const store = useStore()
    const { $gettext } = useGettext()
    const title = useRouteMeta('title')

    const pageTitle = computed(() => {
      return $gettext(unref(title) || '')
    })
    const backgroundImg = computed(() => {
      return store.getters.configuration?.currentTheme?.loginPage?.backgroundImg
    })

    return {
      pageTitle,
      backgroundImg
    }
  }
})
</script>
