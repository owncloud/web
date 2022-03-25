<template>
  <oc-modal
    icon="alarm-warning"
    :title="title"
    :message="message"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Delete')"
    variation="danger"
    @confirm="$emit('confirm', groups)"
    @cancel="$emit('cancel')"
  >
  </oc-modal>
</template>

<script>
export default {
  name: 'DeleteGroupModal',
  props: {
    groups: {
      type: Array,
      required: true
    }
  },
  computed: {
    title() {
      return this.$gettextInterpolate(
        this.$ngettext(
          'Delete group %{group}?',
          'Delete %{groupCount} selected groups?',
          this.groups.length
        ),
        {
          group: this.groups[0].displayName,
          groupCount: this.groups.length
        }
      )
    },
    message() {
      return this.$ngettext(
        'Are you sure you want to delete this group?',
        'Are you sure you want to delete all selected groups?',
        this.groups.length
      )
    }
  }
}
</script>
