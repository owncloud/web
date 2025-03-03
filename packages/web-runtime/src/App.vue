<template>
  <maintenance-banner v-show="maintenanceMode" ref="maintenance-banner" />
  <portal-target name="app.app-banner" multiple />
  <div
    id="web"
    :style="{ '--web-runtime-maintenance-banner-height': maintenanceBannerHeight + 'px' }"
  >
    <oc-hidden-announcer :announcement="announcement" level="polite" />
    <skip-to target="web-content-main">
      <span v-text="$gettext('Skip to main')" />
    </skip-to>
    <component :is="layout"></component>
    <modal-wrapper />
  </div>
</template>
<script lang="ts">
import SkipTo from './components/SkipTo.vue'
import ModalWrapper from './components/ModalWrapper.vue'
import { useLayout } from './composables/layout'
import { computed, defineComponent, unref, watch } from 'vue'
import { additionalTranslations } from './helpers/additionalTranslations' // eslint-disable-line
import {
  eventBus,
  useConfigStore,
  useResourcesStore,
  useRouter,
  useThemeStore
} from '@ownclouders/web-pkg'
import { useHead } from './composables/head'
import { RouteLocation } from 'vue-router'
import { storeToRefs } from 'pinia'
import { isEqual } from 'lodash-es'
import { MaintenanceBanner } from './components/MaintenanceBanner'
import { useTemplateRef } from 'vue'
import { MaybeElement, useElementSize } from '@vueuse/core'

export default defineComponent({
  components: {
    SkipTo,
    ModalWrapper,
    MaintenanceBanner
  },
  setup() {
    const resourcesStore = useResourcesStore()
    const themeStore = useThemeStore()
    const { currentTheme } = storeToRefs(themeStore)

    const configStore = useConfigStore()
    const { maintenanceMode } = storeToRefs(configStore)

    const router = useRouter()
    useHead()

    const activeRoute = computed(() => router.resolve(unref(router.currentRoute)))

    const { layout, layoutType } = useLayout({ router })

    const maintenanceBannerElement = useTemplateRef('maintenance-banner')
    const { height: maintenanceBannerHeight } = useElementSize(
      maintenanceBannerElement as unknown as MaybeElement
    )

    watch(
      () => unref(activeRoute),
      (newRoute, oldRoute) => {
        /**
         * Hide global loading spinner. It usually gets hidden after all apps
         * have been loaded, but in some scenarios (plain layouts) we never load them.
         */
        if (unref(layoutType) !== 'application') {
          const loader = document.getElementById('splash-loading')
          if (!loader?.classList.contains('splash-hide')) {
            loader.classList.add('splash-hide')
          }
        }

        const getAppContextFromRoute = (route: RouteLocation): string[] => {
          return route?.path?.split('/').slice(1, 4)
        }

        const oldAppContext = getAppContextFromRoute(oldRoute)
        const newAppContext = getAppContextFromRoute(newRoute)

        if (isEqual(oldAppContext, newAppContext)) {
          return
        }

        if ('driveAliasAndItem' in newRoute.params) {
          return
        }

        /*
         * If app context has been changed and no file context is set, we will reset current folder.
         */
        resourcesStore.setCurrentFolder(null)
      }
    )

    return {
      layout,
      currentTheme,
      maintenanceMode,
      maintenanceBannerElement,
      maintenanceBannerHeight
    }
  },
  data() {
    return {
      windowWidth: 0,
      announcement: '',
      activeBlobStyle: {}
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler: function (to) {
        const extracted = this.extractPageTitleFromRoute(to)
        if (!extracted) {
          return
        }
        const { shortDocumentTitle, fullDocumentTitle } = extracted
        this.announceRouteChange(shortDocumentTitle)
        document.title = fullDocumentTitle
      }
    }
  },
  mounted() {
    eventBus.subscribe(
      'runtime.documentTitle.changed',
      ({
        shortDocumentTitle,
        fullDocumentTitle
      }: {
        shortDocumentTitle: string
        fullDocumentTitle: string
      }) => {
        document.title = fullDocumentTitle
        this.announceRouteChange(shortDocumentTitle)
      }
    )
  },
  methods: {
    announceRouteChange(pageTitle: string) {
      this.announcement = this.$gettext('Navigated to %{ pageTitle }', { pageTitle })
    },

    extractPageTitleFromRoute(route: RouteLocation) {
      const routeTitle = route.meta.title ? this.$gettext(route.meta.title.toString()) : undefined
      if (!routeTitle) {
        return
      }
      const glue = ' - '
      const titleSegments = [routeTitle]
      return {
        shortDocumentTitle: titleSegments.join(glue),
        fullDocumentTitle: [...titleSegments, this.currentTheme.common.name].join(glue)
      }
    }
  }
})
</script>
<style lang="scss">
body {
  margin: 0;
}

#web {
  background-color: var(--oc-color-swatch-brand-default);
  height: calc(100vh - var(--web-runtime-maintenance-banner-height));
  max-height: 100vh;
  overflow-y: hidden;

  .mark-highlight {
    font-weight: 600;
  }
}

iframe {
  border: 0;
}
</style>
