<template>
  <div
    class="oc-link-embedded oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle"
  >
    <iframe v-if="iframeSrc" :src="iframeSrc" />
    <template v-else>
      <div class="oc-card oc-text-center oc-width-large">
        <div class="oc-card-header oc-link-resolve-error-title">
          <h2 key="embedded-link-error">
            <translate>Embedded link error</translate>
          </h2>
        </div>
        <div class="oc-card-body oc-link-embedded-error-message">
          <p class="oc-text-xlarge">
            <translate>This embedded link does not exist.</translate>
          </p>
        </div>
        <div class="oc-card-footer oc-pt-rm">
          <p>{{ footerSlogan }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from '@vue/composition-api'
import { useRouteParam, useStore } from 'web-pkg/src'
import { LinkConfig } from '../store/config'
import { getLinkIdentifier, getTranslatedTitle } from '../mixins/navigationMixin'
import { useDocumentTitle } from 'web-pkg/src/composables/appDefaults/useDocumentTitle'
import { useCurrentLanguage } from 'web-pkg/src/composables/translations'

export default defineComponent({
  name: 'EmbeddedLink',
  setup() {
    const store = useStore()
    const linkId = useRouteParam('linkId')
    const currentLanguage = useCurrentLanguage()

    const footerSlogan = computed(() => {
      return store.getters.configuration.currentTheme.general.slogan
    })

    const link = computed(() => {
      return (store.getters.configuration.applications as LinkConfig[]).find((app) => {
        return getLinkIdentifier(app) === unref(linkId)
      })
    })

    const iframeSrc = computed(() => {
      return unref(link)?.url
    })

    const titleSegments = computed(() => {
      return [getTranslatedTitle(unref(link), unref(currentLanguage))]
    })
    useDocumentTitle({ titleSegments })

    return {
      footerSlogan,
      iframeSrc
    }
  }
})
</script>

<style lang="scss">
.oc-link-embedded {
  iframe {
    width: 100%;
    height: 100%;
  }

  .oc-card {
    background: var(--oc-color-background-highlight);
    border-radius: 15px;
  }

  .oc-card-header h2,
  .oc-card-footer p {
    margin: 0;
  }
}
</style>
