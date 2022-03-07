<template>
  <div class="oc-height-1-1 oc-link-resolve">
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-card oc-border oc-rounded oc-position-center oc-text-center oc-width-large">
      <template v-if="loading">
        <div class="oc-card-header">
          <h2 key="public-link-loading">
            <translate>Loading public link…</translate>
          </h2>
        </div>
        <div class="oc-card-body">
          <oc-spinner :aria-hidden="true" />
        </div>
      </template>
      <template v-else-if="errorMessage">
        <div class="oc-card-header oc-link-resolve-error-title">
          <h2 key="public-link-error">
            <translate>An error occurred while loading the public link</translate>
          </h2>
        </div>
        <div class="oc-card-body oc-link-resolve-error-message">
          <p class="oc-text-lead">{{ errorMessage }}</p>
        </div>
      </template>
      <template v-else-if="passwordRequired">
        <form @submit.prevent="resolvePublicLink">
          <div class="oc-card-header">
            <h2>
              <translate>This resource is password-protected</translate>
            </h2>
          </div>
          <div class="oc-card-body">
            <oc-text-input
              ref="passwordInput"
              v-model="password"
              :error-message="inputErrorMessage"
              :label="passwordFieldLabel"
              type="password"
              class="oc-mb-s"
            />
            <oc-button
              variation="primary"
              appearance="filled"
              class="oc-login-authorize-button"
              :disabled="!password"
              submit="submit"
            >
              <translate>Continue</translate>
            </oc-button>
          </div>
        </form>
      </template>
      <div class="oc-card-footer">
        <p>
          {{ configuration.currentTheme.general.slogan }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../mixins'
import { DavProperties } from 'web-pkg/src/constants'
import { createLocationPublic } from '../router'

export default {
  mixins: [Mixins],
  data() {
    return {
      loading: true,
      errorMessage: null,
      firstTime: true,
      passwordRequired: false,
      password: null,
      inputErrorMessage: null
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['publicLinkPassword']),

    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },

    passwordFieldLabel() {
      return this.$gettext('Enter password for public link')
    }
  },
  created() {
    this.resolvePublicLink()
  },
  methods: {
    ...mapActions('Files', ['setPublicLinkPassword']),
    resolvePublicLink() {
      const password = this.password || this.publicLinkPassword
      this.loading = true
      this.inputErrorMessage = null
      this.$client.publicFiles
        .list(this.$route.params.token, password, DavProperties.PublicLink, '0')
        .then((files) => {
          this.passwordRequired = false
          this.setPublicLinkPassword(password)
          const publicOperationName =
            files[0].getProperty(this.$client.publicFiles.PUBLIC_LINK_PERMISSION) === '4'
              ? 'files-public-drop'
              : 'files-public-files'

          this.$router.push(
            createLocationPublic(publicOperationName, {
              params: {
                item: this.$route.params.token
              }
            })
          )
        })
        .catch((error) => {
          if (error.statusCode === 401) {
            this.passwordRequired = true
            if (!this.firstTime) {
              this.inputErrorMessage = this.$gettext('Incorrect password')
            }
            this.firstTime = false
            // somehow needed here for the focus call to work correctly,
            // otherwise the element is not rendered yet
            this.loading = false
            this.$nextTick(() => {
              this.$refs.passwordInput.focus()
            })
          } else {
            this.errorMessage = error
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss">
.oc-link-resolve {
  .oc-text-input-message {
    justify-content: center;
  }

  .oc-card-header h2,
  .oc-card-footer p {
    margin: 0;
  }
}
</style>
