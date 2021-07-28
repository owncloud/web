<template>
  <oc-recipient class="files-share-invite-recipient" :recipient="formattedRecipient">
    <template #append>
      <oc-button
        class="files-share-invite-recipient-btn-remove"
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
import { avatarUrl } from '../../../../helpers/user/avatarUrl'

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
    ...mapGetters(['configuration', 'getToken', 'capabilities']),

    btnDeselectRecipientLabel() {
      const translated = this.$gettext('Deselect %{name}')

      return this.$gettextInterpolate(translated, { name: this.recipient.label })
    }
  },

  async created() {
    if (
      this.capabilities.files_sharing.user.profile_picture &&
      this.recipient.value.shareType === shareTypes.user
    ) {
      try {
        const avatar = await avatarUrl({
          server: this.configuration.server,
          username: this.recipient.value.shareWith,
          token: this.getToken
        })

        this.formattedRecipient.avatar = avatar
      } catch (error) {
        console.error(error)
      }
    }

    this.formattedRecipient.isLoadingAvatar = false
  },

  methods: {
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
