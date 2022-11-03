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
import { computed, defineComponent, unref } from '@vue/composition-api'
import { useRouteMeta, useStore, useTranslations } from 'web-pkg'

export default defineComponent({
  name: 'PlainLayout',
  setup() {
    const store = useStore()
    const { $gettext } = useTranslations()
    const title = useRouteMeta('title')

    const pageTitle = computed(() => {
      return $gettext(unref(title))
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
