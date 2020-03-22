<template>
  <div class="oc-login" uk-height-viewport>
    <div class="oc-login-card uk-position-center">
      <h1 v-translate class="oc-login-logo">
        ownCloud
      </h1>
      <div v-if="loading" class="oc-login-card-body">
        <h3 class="oc-login-card-title" :aria-hidden="true">{{ $_loadingPublicLinkTitle }}</h3>
        <oc-spinner :aria-label="$_loadingPublicLinkTitle"></oc-spinner>
      </div>
      <div v-if="errorMessage" class="oc-login-card-body">
        <h3 class="oc-login-card-title">
          <translate>An error occurred while loading the public link</translate>
        </h3>
        <span>{{ errorMessage }}</span>
      </div>
      <div v-if="passwordRequired" class="oc-login-card-body">
        <h2 class="oc-login-card-title">
          <translate>This resource is password-protected.</translate>
        </h2>

        <oc-text-input
          v-model="password"
          type="password"
          :placeholder="passwordPlaceholder"
          class="uk-margin-small-bottom"
        ></oc-text-input>
        <oc-button
          variation="primary"
          class="oc-login-authorize-button"
          @click.native="resolvePublicLink()"
        >
          <translate>Continue</translate>
        </oc-button>
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
import Mixins from '../../mixins.js'

export default {
  mixins: [Mixins],
  data() {
    return {
      loading: true,
      errorMessage: null,
      passwordRequired: false,
      password: null
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['davProperties']),
    passwordPlaceholder() {
      return this.$gettext('Enter password')
    },
    $_loadingPublicLinkTitle() {
      return this.$gettext('Loading public link…')
    }
  },
  mounted() {
    this.resolvePublicLink()
  },
  methods: {
    ...mapActions('Files', ['setPublicLinkPassword']),
    resolvePublicLink() {
      this.loading = true
      const properties = this.davProperties.concat([
        this.$client.publicFiles.PUBLIC_LINK_ITEM_TYPE,
        this.$client.publicFiles.PUBLIC_LINK_PERMISSION,
        this.$client.publicFiles.PUBLIC_LINK_EXPIRATION,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_DATETIME,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_OWNER
      ])
      this.$client.publicFiles
        .list(this.$route.params.token, this.password, properties, '0')
        .then(files => {
          this.passwordRequired = false
          this.setPublicLinkPassword(this.password)
          if (files[0].getProperty(this.$client.publicFiles.PUBLIC_LINK_PERMISSION) === '4') {
            this.$router.push({
              name: 'public-files-drop',
              params: {
                item: this.$route.params.token
              }
            })
            return
          }
          this.$router.push({
            name: 'public-files',
            params: {
              item: this.$route.params.token
            }
          })
        })
        .catch(error => {
          if (error.statusCode === 401) {
            this.passwordRequired = true
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
