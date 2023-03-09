<template>
  <div id="incomiing" class="sciencemesh-app">
    <div>
      <div class="oc-flex oc-flex-middle oc-px-m oc-py-s">
        <oc-icon name="user-received" />
        <h2 class="oc-px-s">Accept invitations</h2>
        <oc-contextual-helper class="oc-pl-xs" v-bind="helperContent" />
      </div>
      <br />
      <br />

      <div class="oc-flex oc-flex-column oc-flex-middle oc-flex-center">
        <div class="oc-width-1-2">
          <oc-text-input
            ref="tokenInput"
            v-model="token"
            label="Enter invite token"
            :clear-button-enabled="true"
          />
          <br />
          <oc-select
            v-model="provider"
            label="Select institution of inviter"
            :options="providers"
            class="oc-mb-m"
            :loading="loading"
          >
            <template #option="{ full_name, domain }">
              <span class="option">
                <strong v-text="full_name" />
              </span>
              <span class="option" v-text="domain" />
            </template>
            <template #no-options> No institutions found with this name </template>
            <template #selected-option="{ full_name, domain }">
              <strong class="oc-mr-s" v-text="full_name" />
              <small v-text="domain.length > 17 ? domain.slice(0, 20) + '...' : domain" />
            </template>
          </oc-select>
          <div v-if="providerError" class="oc-text-input-message">
            <span class="oc-text-input-danger">{{ providerErrorMessage }}</span>
          </div>
        </div>
        <br />
        <br />
        <oc-button size="small" :disabled="acceptInvitationButtonDisabled" @click="acceptInvite">
          <oc-icon name="add" />
          Accept invitation
        </oc-button>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

export default defineComponent({
  emits: ['highlightNewConnections'],
  setup() {
    return {}
  },
  data: () => {
    return {
      token: undefined,
      provider: undefined,
      providers: [],
      loading: true,
      providerError: false
    }
  },

  computed: {
    helperContent() {
      return {
        text: 'Once you accept invitation, the inviter will be added to your connections.'
      }
    },
    acceptInvitationButtonDisabled() {
      return !this.token || !this.provider || this.provider.full_name === 'Unknown provider'
    },
    providerErrorMessage() {
      return this.isMyProviderSelectedProvider(this.provider)
        ? 'You cannot select your institution'
        : 'Unknown insitution. Check invitation url or select from list'
    }
  },

  async mounted() {
    await this.listProviders()
    if (this.$route.query.token) {
      this.token = this.$route.query.token
      this.$refs.tokenInput.focus()

      this.scrollToForm()
    }

    if (this.$route.query.providerDomain) {
      let matchedProvider = this.providers?.find(
        (p) => p.domain === this.$route.query.providerDomain
      )
      if (matchedProvider) {
        this.provider = matchedProvider
        this.providerError = false
      } else {
        this.provider = { full_name: 'Unknown provider', domain: this.$route.query.providerDomain }
        this.providerError = true
        this.$watch('provider', (newValue, oldValue) => {
          if (this.providers?.find((p) => p.domain === newValue.domain)) this.providerError = false
        })
      }
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    errorPopup(err) {
      this.showMessage({
        title: 'An error occurred',
        desc: err,
        status: 'danger'
      })
    },
    async acceptInvite() {
      const url = '/sciencemesh/accept-invite'

      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + accessToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')
      headers.append('Content-type', 'application/json')

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token: this.token, providerDomain: this.provider.domain })
      })
      if (!response.ok) {
        const err = await response.json()
        this.errorPopup(err.message)
      } else {
        const connectionInfo = { providerDomain: 'ddd' } //await response.json()
        this.token = undefined
        this.provider = undefined

        this.$emit('highlightNewConnections')
      }
    },
    async listProviders() {
      const url = '/sciencemesh/list-providers'

      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + accessToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')
      headers.append('Content-type', 'application/json')

      // this.providers = [
      //   { full_name: 'fullname', domain: 'domain' },
      //   { full_name: 'fullname2', domain: 'domain2' }
      // ]

      this.loading = false
      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      if (!response.ok) {
        const err = await response.json()
        this.errorPopup(err.message && err.message)
      } else {
        const allProviders = await response.json()
        this.providers = allProviders.filter((p) => !this.isMyProviderSelectedProvider(p))
      }
    },
    scrollToForm() {
      const el = document.getElementById('sciencemesh-accept-invites')

      if (el) {
        el.scrollIntoView()
      }
    },
    isMyProviderSelectedProvider(p) {
      return p.domain === window.location.host
    }
  }
})
</script>
  
  <style lang="scss" scoped>
.sciencemesh-app {
}
.option {
  display: block;
}
</style>