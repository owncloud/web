<template>
  <oc-modal
    icon="alarm-warning"
    :title="title"
    :message="message"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Delete')"
    variation="danger"
    @confirm="$emit('confirm', users)"
    @cancel="$emit('cancel')"
  >
  </oc-modal>
</template>

<script>
export default {
  name: 'DeleteUserModal',
  props: {
    users: {
      type: Array,
      required: true
    }
  },
  computed: {
    title() {
      return this.$gettextInterpolate(
        this.$ngettext(
          'Delete user %{user}?',
          'Delete %{userCount} selected users?',
          this.users.length
        ),
        {
          userCount: this.users.length,
          user: this.users[0].onPremisesSamAccountName
        }
      )
    },
    message() {
      return this.$ngettext(
        'Are you sure you want to delete this user?',
        'Are you sure you want to delete all selected users?',
        this.users.length
      )
    }
  }
}
</script>
