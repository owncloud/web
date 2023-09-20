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
      size="large"
      appearance="filled"
      variation="primary"
      v-bind="logoutButtonsAttrs"
      v-text="navigateToLoginText"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { queryItemAsString, useConfigurationManager, useRouteQuery, useStore } from 'web-pkg'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'AccessDeniedPage',
  setup() {
    const store = useStore()
    const configurationManager = useConfigurationManager()
    const redirectUrlQuery = useRouteQuery('redirectUrl')

    const { $gettext } = useGettext()

    const logoImg = computed(() => {
      return store.getters.configuration.currentTheme.logo.login
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
      const redirectUrl = queryItemAsString(unref(redirectUrlQuery))

      if (configurationManager.options.loginUrl) {
        const configLoginURL = new URL(encodeURI(configurationManager.options.loginUrl))
        if (redirectUrl) {
          configLoginURL.searchParams.append('redirectUrl', redirectUrl)
        }
        return {
          type: 'a',
          href: configLoginURL.toString()
        }
      }

      return {
        name: 'login',
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
