<template>
  <div>
    <oc-modal
      icon="info"
      :title="$gettext('Create user')"
      :button-cancel-text="$gettext('Cancel')"
      :button-confirm-text="$gettext('Create')"
      @cancel="$emit('cancel')"
    >
    </oc-modal>
  </div>
</template>

<script>
export default {
  name: 'CreateUserModal'
}
</script>
