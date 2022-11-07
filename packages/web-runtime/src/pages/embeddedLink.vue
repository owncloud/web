<template>
  <div
    class="oc-link-embedded oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle"
  >
    <iframe v-if="iframeSrc" :src="iframeSrc" />
    <template v-else>
      <div class="oc-card oc-text-center oc-width-large">
        <div class="oc-card-header oc-link-resolve-error-title">
          <h2 key="embedded-link-error">
            <translate>External link error</translate>
          </h2>
        </div>
        <div class="oc-card-body oc-link-embedded-error-message">
          <p class="oc-text-xlarge">
            <translate>This external link does not exist.</translate>
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
import { getLinkIdentifier } from '../mixins/navigationMixin'

export default defineComponent({
  name: 'ExternalLink',
  setup() {
    const store = useStore()
    const linkId = useRouteParam('linkId')

    const footerSlogan = computed(() => {
      return store.getters.configuration.currentTheme.general.slogan
    })

    const iframeSrc = computed(() => {
      const link = (store.getters.configuration.applications as LinkConfig[]).find((app) => {
        return getLinkIdentifier(app) === unref(linkId)
      })
      if (!link) {
        return
      }

      return link.url
    })

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
