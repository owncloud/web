<template>
  <div
    class="oc-login"
    uk-height-viewport
    :style="{ backgroundImage: 'url(' + backgroundImg + ')' }"
  >
    <div class="oc-login-card uk-position-center">
      <img class="oc-login-logo" :src="logoImg" :alt="configuration.theme.general.name" />
      <div v-if="loading" class="oc-login-card-body">
        <h3 class="oc-login-card-title" :aria-hidden="true">{{ $_loadingPublicLinkTitle }}</h3>
        <oc-spinner :aria-label="$_loadingPublicLinkTitle" />
      </div>
      <div v-if="errorMessage" class="oc-login-card-body">
        <h3 class="oc-login-card-title">
          <translate>An error occurred while loading the public link</translate>
        </h3>
        <span>{{ errorMessage }}</span>
      </div>
      <div v-if="passwordRequired && !loading" class="oc-login-card-body">
        <form @submit.prevent="resolvePublicLink">
          <h2 class="oc-login-card-title">
            <translate>This resource is password-protected.</translate>
          </h2>
          <oc-text-input
            ref="passwordInput"
            v-model="password"
            :error-message="inputErrorMessage"
            :label="passwordFieldLabel"
            type="password"
            :placeholder="passwordPlaceholder"
            class="oc-mb-s"
          ></oc-text-input>
          <oc-button variation="primary" class="oc-login-authorize-button" :disabled="!password">
            <translate>Continue</translate>
          </oc-button>
        </form>
      </div>
      <div class="oc-login-card-footer">
        <p>
          {{ configuration.theme.general.slogan }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../mixins'

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
    ...mapGetters('Files', ['davProperties', 'publicLinkPassword']),
    passwordFieldLabel() {
      return this.$gettext('Enter password for public link')
    },
    passwordPlaceholder() {
      return this.$gettext('Enter password')
    },
    $_loadingPublicLinkTitle() {
      return this.$gettext('Loading public link…')
    },

    backgroundImg() {
      return this.configuration.theme.loginPage.backgroundImg
    },

    logoImg() {
      return this.configuration.theme.logo.login
    }
  },
  mounted() {
    this.resolvePublicLink()
  },
  methods: {
    ...mapActions('Files', ['setPublicLinkPassword']),
    resolvePublicLink() {
      const password = this.password || this.publicLinkPassword
      this.loading = true
      this.inputErrorMessage = null
      const properties = this.davProperties.concat([
        this.$client.publicFiles.PUBLIC_LINK_ITEM_TYPE,
        this.$client.publicFiles.PUBLIC_LINK_PERMISSION,
        this.$client.publicFiles.PUBLIC_LINK_EXPIRATION,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_DATETIME,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_OWNER
      ])
      this.$client.publicFiles
        .list(this.$route.params.token, password, properties, '0')
        .then(files => {
          this.passwordRequired = false
          this.setPublicLinkPassword(password)
          if (files[0].getProperty(this.$client.publicFiles.PUBLIC_LINK_PERMISSION) === '4') {
            this.$router.push({
              name: 'files-public-drop',
              params: {
                item: this.$route.params.token
              }
            })

            return
          }
          this.$router.push({
            name: 'public-list',
            params: {
              item: this.$route.params.token
            }
          })
        })
        .catch(error => {
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
