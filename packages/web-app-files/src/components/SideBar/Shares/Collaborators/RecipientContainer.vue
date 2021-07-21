<template>
  <oc-recipient class="files-share-invite-recipient" :recipient="formattedRecipient">
    <template #append>
      <oc-button
        appearance="raw"
        :aria-label="btnDeselectRecipientLabel"
        @click.stop="deselect(recipient)"
      >
        <oc-icon name="close" size="small" />
      </oc-button>
    </template>
  </oc-recipient>
</template>

<script>
import { mapGetters } from 'vuex'

import { shareTypes } from '../../../../helpers/shareTypes'

export default {
  props: {
    recipient: {
      type: Object,
      required: true
    },
    deselect: {
      type: Function,
      required: false,
      default: null
    }
  },

  data() {
    return {
      formattedRecipient: {
        name: this.recipient.label,
        icon: this.getRecipientIcon(),
        hasAvatar: this.recipient.value.shareType === shareTypes.user,
        isLoadingAvatar: true
      }
    }
  },

  computed: {
    ...mapGetters(['configuration']),

    btnDeselectRecipientLabel() {
      const translated = this.$gettext('Deselect %{name}')

      return this.$gettextInterpolate(translated, { name: this.recipient.label })
    }
  },

  created() {
    if (this.recipient.value.shareType === shareTypes.user) {
      this.fetchRecipientAvatar()
    }
  },

  methods: {
    async fetchRecipientAvatar() {
      try {
        const headers = new Headers()
        const instance = this.configuration.server || window.location.origin
        const url =
          instance + 'remote.php/dav/avatars/' + this.recipient.value.shareWith + '/128.png'

        headers.append('Authorization', 'Bearer ' + this.getToken)
        headers.append('X-Requested-With', 'XMLHttpRequest')

        const res = await fetch(url, { method: 'HEAD', headers })

        if (res.status === 200) {
          const signedUrl = await this.$client.signUrl(url)

          this.formattedRecipient.avatar = signedUrl
        }
      } catch (error) {
        console.error(error)
      }

      this.formattedRecipient.isLoadingAvatar = false
    },

    getRecipientIcon() {
      switch (this.recipient.value.shareType) {
        case shareTypes.group:
          return {
            name: 'group',
            label: this.$gettext('Group')
          }

        case shareTypes.guest:
          return {
            name: 'user_remote',
            label: this.$gettext('Guest user')
          }

        case shareTypes.remote:
          return {
            name: 'user_remote',
            label: this.$gettext('Remote user')
          }

        default:
          return {
            name: 'person',
            label: this.$gettext('User')
          }
      }
    }
  }
}
</script>
