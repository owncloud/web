<template>
  <div class="sciencemesh-app">
    <div>
      <div class="oc-flex oc-flex-middle oc-px-m oc-py-s">
        <oc-icon name="user-shared" />
        <h2 class="oc-px-s">Invite users</h2>
        <oc-contextual-helper class="oc-pl-xs" v-bind="helperContent" />
      </div>
      <div class="oc-flex oc-flex-middle oc-flex-center">
        <oc-button
          v-oc-tooltip="'Generate new invitation'"
          :aria-label="'Generate invitation link that can be shared with one or more invitees'"
          @click="openInviteModal"
        >
          <oc-icon name="add" />
          Generate invitation
        </oc-button>
      </div>

      <br />
      <oc-modal
        v-if="showInviteModal"
        title="Generate new invitation"
        button-cancel-text="Cancel"
        button-confirm-text="Generate"
        :button-confirm-disabled="descriptionErrorMessage"
        focus-trap-initial="#invite_token_description"
        @cancel="resetGenerateInviteToken"
        @confirm="generateToken(group)"
      >
        <template #content>
          <form autocomplete="off" @submit.prevent="onFormSubmit">
            <oc-text-input
              id="invite_token_description"
              v-model="group.description"
              class="oc-mb-s"
              :error-message="descriptionErrorMessage"
              label="Add a description (optional)"
              :clear-button-enabled="true"
              :description-message="!descriptionErrorMessage && `${group.description.length}/${50}`"
            />
            <br />
            <oc-text-input
              id="invite_token_recipient"
              ref="inputForFocusEmail"
              v-model="group.recipient"
              class="oc-mb-s"
              type="email"
              :clear-button-enabled="true"
              :error-message="emailErrorMessage"
              label="Email to send the invitation (optional)"
            />
            <!-- <oc-text-input label="Add an recipient to sent the token (optional)"/> -->
            <input type="submit" class="oc-hidden" />
          </form> </template
      ></oc-modal>
      <br />

      <app-loading-spinner v-if="loading" />
      <template v-else>
        <no-content-message
          v-if="!sortedTokens.length"
          id="invite-tokens-empty"
          class="files-empty"
          icon="user-shared"
        >
          <template #message>
            <span v-translate>You have no valid invitation links</span>
          </template>
        </no-content-message>
        <oc-table v-else :fields="fields" :data="sortedTokens" :highlighted="lastCreatedToken">
          <template #token="rowData">
            <span>{{ rowData.item.token.slice(0, 5) + '...' }}</span>
            <oc-button
              id="oc-sciencemesh-copy-token"
              v-oc-tooltip="'Copy invite token'"
              :aria-label="'Copy invite token'"
              appearance="raw"
              @click="copyToken(rowData)"
            >
              <oc-icon name="file-copy" />
            </oc-button>
          </template>
          <template #link="rowData">
            <a :href="rowData.item.link">link</a>
            <oc-button
              id="oc-sciencemesh-copy-token"
              v-oc-tooltip="'Copy invitation link'"
              :aria-label="'Copy invitation link'"
              appearance="raw"
              @click="copyLink(rowData)"
            >
              <oc-icon name="file-copy" />
            </oc-button>
          </template>
        </oc-table>
      </template>
    </div>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'

export default defineComponent({
  components: {
    NoContentMessage,
    AppLoadingSpinner
  },
  data: () => {
    return {
      inputValue: 'Add a description to invite token',
      lastCreatedToken: '',
      showInviteModal: false,
      formData: {
        description: {
          errorMessage: '',
          valid: true
        },
        recipient: {
          errorMessage: '',
          valid: true
        }
      },
      group: {
        description: '',
        recipient: ''
      },
      form: {},
      tokens: [],
      loading: true,
      emailErrorMessage: null,
      descriptionErrorMessage: false
    }
  },

  computed: {
    fields() {
      return [
        {
          name: 'link',
          title: 'Invitation link',
          alignH: 'left',
          type: 'slot'
        },
        {
          name: 'token',
          title: 'Invitate token',
          alignH: 'right',
          type: 'slot'
        },
        {
          name: 'description',
          title: 'Description',
          alignH: 'right'
        },
        {
          name: 'expiration',
          title: 'Expires',
          alignH: 'right'
        }
      ]
    },
    sortedTokens() {
      return [...this.tokens].sort((a, b) => (a.expirationSeconds < b.expirationSeconds ? 1 : -1))
    },
    helperContent() {
      return {
        text: 'Create an invitation link and send it to the person you want to share with.'
      }
    }
  },
  mounted() {
    this.listTokens()
    this.$watch('group.description', (newValue, oldValue) => {
      if (newValue.length > 50)
        this.descriptionErrorMessage = 'Description longer than max. allowed'
      else this.descriptionErrorMessage = null
    })
  },
  methods: {
    ...mapActions(['showMessage']),
    copyLink(rowData) {
      navigator.clipboard.writeText(rowData.item.link)
      this.$store.dispatch('showMessage', {
        title: 'Invition link copied',
        desc: 'Invitation link has been copied to your clipboard.'
      })
    },
    copyToken(rowData) {
      navigator.clipboard.writeText(rowData.item.token)
      this.$store.dispatch('showMessage', {
        title: 'Invite token copied',
        desc: 'Invitate token has been copied to your clipboard.'
      })
    },
    errorPopup() {
      this.showMessage({
        title: 'Error',
        desc: 'An error occurred by generating the token',
        status: 'danger'
      })
    },
    toggle(rowData) {
      this[rowData.item.variable] = !this[rowData.item.variable]
    },
    openInviteModal() {
      this.showInviteModal = true
    },
    closeInviteModal() {
      this.showInviteModal = false
    },
    onFormSubmit(form) {
      if (this.isFormInvalid) {
        return
      }
      this.generateToken(form)
    },
    async generateToken(group) {
      if (group.recipient.length > 0 && !this.validateEmail(group.recipient)) {
        this.emailErrorMessage = 'Please enter a valid email adress!'
        this.$refs.inputForFocusEmail.focus()
        this.$watch('group.recipient', (newValue, oldValue) => {
          if (newValue.length === 0 || !newValue || this.validateEmail(newValue))
            this.emailErrorMessage = null
        })
        return
      }
      if (this.descriptionErrorMessage) return
      const url =
        `/sciencemesh/generate-invite?` +
        new URLSearchParams({
          ...(group.description && { description: group.description }),
          ...(group.recipient && { recipient: group.recipient })
        })

      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + accessToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      if (!response.ok) {
        this.resetGenerateInviteToken()
        this.lastCreatedToken = ''
        this.errorPopup()
      } else {
        const tokenInfo = await response.json()

        //local test
        // const tokenInfo = {
        //   link: 'lalala/lalala',
        //   token: 'f1f825bc-316e-40f0-a5d4-c37c1c3d560b',
        //   user_id: { idp: 'https://auth.cern.ch/auth/realms/cern', opaque_id: 'ragozina', type: 1 },
        //   expiration: { seconds: 1675971159 },
        //   description: this.group.description
        // }

        if (tokenInfo.token) {
          this.tokens.push({
            id: tokenInfo.token,
            link: `https://sciencemesh.cesnet.cz/iop/meshdir?token=${tokenInfo.token}&providerDomain=${window.location.host}`,
            token: tokenInfo.token,
            ...(tokenInfo.expiration?.seconds && {
              expiration: this.toDateTime(tokenInfo.expiration.seconds)
            }),
            ...(tokenInfo.expiration?.seconds && {
              expirationSeconds: tokenInfo.expiration.seconds
            }),
            ...(tokenInfo.description && { description: tokenInfo.description })
          })
          this.showMessage({
            title: 'Success!',
            status: 'success',
            desc: group.recipient
              ? `New invitation link has been created and sent to ${group.recipient}.`
              : `New invitation link has been created and copied to your clipboard. Send it to the invitee(s).`
          })
          this.lastCreatedToken = tokenInfo.token
          if (!group.recipient) navigator.clipboard.writeText(tokenInfo.link)
        }

        this.resetGenerateInviteToken()
      }
    },
    async listTokens() {
      const url = '/sciencemesh/list-invite'

      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + accessToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      //local test
      // const tokenInfo = {
      //   token: 'f1f825bc-316e-40f0-a5d4-c37c1c3d560b',
      //   user_id: { idp: 'https://auth.cern.ch/auth/realms/cern', opaque_id: 'ragozina', type: 1 },
      //   expiration: { seconds: 1675971159 },
      //   description: this.group.description
      // }
      this.loading = false

      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      if (!response.ok) {
        this.loading = false
      } else {
        const data = await response.json()

        data.forEach((t) => {
          this.tokens.push({
            id: t.token,
            token: t.token,
            ...(t.expiration?.seconds && {
              expiration: this.toDateTime(t.expiration.seconds)
            }),
            ...(t.expiration?.seconds && {
              expirationSeconds: t.expiration.seconds
            }),
            ...(t.description && { description: t.description })
          })
        })
      }
    },
    resetGenerateInviteToken() {
      this.showInviteModal = false
      this.group = {
        description: '',
        recipient: ''
      }
      this.form = {}
    },

    toDateTime(secs) {
      var d = new Date(Date.UTC(1970, 0, 1))
      d.setUTCSeconds(secs)
      return (
        ('0' + d.getDate()).slice(-2) +
        '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        '-' +
        d.getFullYear() +
        ' ' +
        ('0' + d.getHours()).slice(-2) +
        ':' +
        ('0' + d.getMinutes()).slice(-2)
      )
    },

    validateEmail(email) {
      var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/
      if (email.match(mailformat)) {
        return true
      } else {
        return false
      }
    }
  }
})
</script>
  
  <style lang="scss" scoped>
.sciencemesh-app {
}

#invite-tokens-empty {
  height: 10vh;
}
</style>

function validateEmail(inputText: any) {
  throw new Error('Function not implemented.')
}
  