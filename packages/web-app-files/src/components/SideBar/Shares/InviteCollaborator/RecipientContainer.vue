<template>
  <oc-recipient
    :data-testid="`recipient-container-${formattedRecipient.name}`"
    class="files-share-invite-recipient"
    :recipient="formattedRecipient"
  >
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
import { avatarUrl } from '../../../../helpers/user'
import { ShareTypes } from '../../../../helpers/share'

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
        hasAvatar:
          this.recipient.value.shareType === ShareTypes.user.value ||
          this.recipient.value.shareType === ShareTypes.space.value,
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
    if (this.capabilities.files_sharing.user.profile_picture && this.hasAvatar) {
      try {
        this.formattedRecipient.avatar = await avatarUrl({
          server: this.configuration.server,
          username: this.recipient.value.shareWith,
          token: this.getToken
        })
      } catch (error) {
        console.error(error)
      }
    }

    this.formattedRecipient.isLoadingAvatar = false
  },

  methods: {
    getRecipientIcon() {
      switch (this.recipient.value.shareType) {
        case ShareTypes.group.value:
          return {
            name: 'group',
            label: this.$gettext('Group')
          }

        case ShareTypes.guest.value:
          return {
            name: 'user_remote',
            label: this.$gettext('Guest user')
          }

        case ShareTypes.remote.value:
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

<style lang="scss" scoped>
.files-share-invite-recipient {
  margin: 4px 2px 0;
  padding: 0 0.25em;
}
</style>
