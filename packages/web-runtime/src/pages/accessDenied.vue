<template>
  <div class="oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle">
    <div class="oc-login-card">
      <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
      <div class="oc-login-card-body oc-width-medium">
        <h2 class="oc-login-card-title" v-text="cardTitle" />
        <p v-text="cardHint" />
        <oc-button
          v-if="accessDeniedHelpUrl"
          type="a"
          appearance="raw"
          :href="accessDeniedHelpUrl"
          target="_blank"
          ><span v-text="$gettext('Read more')"
        /></oc-button>
      </div>
      <div class="oc-login-card-footer oc-pt-rm">
        <p>
          {{ footerSlogan }}
        </p>
      </div>
    </div>
    <oc-button
      id="exitAnchor"
      class="oc-mt-m oc-width-medium"
      v-bind:="logoutButtonsAttrs"
      size="large"
      appearance="filled"
      variation="primary"
      v-text="navigateToLoginText"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, unref } from 'vue'
import { useClientService, useConfigurationManager, useRoute, useStore } from 'web-pkg'
import { useGettext } from 'vue3-gettext'
import { urlJoin } from 'web-client/src/utils'

export default defineComponent({
  name: 'AccessDeniedPage',
  setup() {
    const webfingerIssuer = ref(null)
    const store = useStore()
    const route = useRoute()
    const { $gettext } = useGettext()
    const { httpUnAuthenticated } = useClientService()
    const configurationManager = useConfigurationManager()

    const logoImg = computed(() => {
      return store.getters.configuration.currentTheme.logo.login
    })
    const extractWebfingerIssuer = async () => {
      const url =
        urlJoin(configurationManager.serverUrl, '.well-known', 'webfinger') +
        `?resource=${encodeURI(configurationManager.serverUrl)}`
      const response = (await httpUnAuthenticated.get(url)).data
      return response.links[0].href
    }

    onMounted(async () => {
      try {
        webfingerIssuer.value = await extractWebfingerIssuer()
      } catch (_) {}
    })

    const accessDeniedHelpUrl = computed(() => {
      return (
        store.getters.configuration.commonTheme.accessDeniedHelpUrl ||
        store.getters.configuration.options.accessDeniedHelpUrl
      )
    })
    const cardTitle = computed(() => {
      return $gettext('Not logged in')
    })
    const cardHint = computed(() => {
      return $gettext(
        'This could be because of a routine safety log out, or because your account is either inactive or not yet authorized for use. Please try logging in after a while or seek help from your Administrator.'
      )
    })
    const footerSlogan = computed(() => {
      return store.getters.configuration.currentTheme.general.slogan
    })
    const navigateToLoginText = computed(() => {
      return $gettext('Log in again')
    })
    const logoutButtonsAttrs = computed(() => {
      const redirectUrl = unref(route).query?.redirectUrl as string

      if (unref(webfingerIssuer)) {
        const webfingerIssuerURL = new URL(encodeURI(unref(webfingerIssuer)))

        if (redirectUrl) {
          webfingerIssuerURL.searchParams.append('redirectUrl', encodeURIComponent(redirectUrl))
        }

        return {
          type: 'a',
          href: webfingerIssuerURL.toString()
        }
      }
      return {
        type: 'router-link',
        to: {
          name: 'login',
          query: {
            ...(redirectUrl && { redirectUrl })
          }
        }
      }
    })

    return {
      logoImg,
      cardTitle,
      cardHint,
      footerSlogan,
      navigateToLoginText,
      accessDeniedHelpUrl,
      logoutButtonsAttrs
    }
  }
})
</script>
