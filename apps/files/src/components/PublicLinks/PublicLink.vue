<template>
    <div class="oc-login" uk-height-viewport>
    <div class="oc-login-card uk-position-center">
      <h1 class="oc-login-logo" v-translate>
        ownCloud
      </h1>
      <div class="oc-login-card-body" v-if="loading">
        <h3 class="oc-login-card-title"><translate>Loading public link…</translate></h3>
        <oc-spinner></oc-spinner>
      </div>
      <div class="oc-login-card-body" v-if="errorMessage">
        <h3 class="oc-login-card-title"><translate>An error occurred while loading the public link</translate></h3>
        <span>{{ errorMessage }}</span>
      </div>
      <div class="oc-login-card-body" v-if="passwordRequired">
        <h2 class="oc-login-card-title"><translate>This resource is password-protected.</translate></h2>

        <oc-text-input type="password" v-model="password" :placeholder="passwordPlaceholder" class="uk-margin-small-bottom"></oc-text-input>
        <oc-button variation="primary" class="oc-login-authorize-button" @click.native="resolvePublicLink()">
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
  mixins: [
    Mixins
  ],
  data () {
    return {
      loading: true,
      errorMessage: null,
      passwordRequired: false,
      password: null
    }
  },
  mounted () {
    this.resolvePublicLink()
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['davProperties']),
    passwordPlaceholder () {
      return this.$gettext('Enter password')
    }
  },
  methods: {
    ...mapActions('Files', ['setPublicLinkPassword']),
    resolvePublicLink () {
      this.loading = true
      const properties = this.davProperties.concat([
        this.$client.publicFiles.PUBLIC_LINK_ITEM_TYPE,
        this.$client.publicFiles.PUBLIC_LINK_PERMISSION,
        this.$client.publicFiles.PUBLIC_LINK_EXPIRATION,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_DATETIME,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_OWNER
      ]
      )
      this.$client.publicFiles.list(this.$route.params.token, this.password, properties, '0').then(files => {
        this.passwordRequired = false
        this.setPublicLinkPassword(this.password)
        if (files[0].getProperty(this.$client.publicFiles.PUBLIC_LINK_PERMISSION) === '4') {
          this.$router.push({
            name: 'public-files-drop',
            params: {
              token: this.$route.params.token
            }
          })
          return
        }
        this.$router.push({
          name: 'public-files',
          params: {
            token: this.$route.params.token
          }
        })
      }).catch(error => {
        if (error.statusCode === 401) {
          this.passwordRequired = true
        } else {
          this.errorMessage = error
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
