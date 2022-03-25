<template>
  <div>
    <oc-modal
      :title="$gettext('Create group')"
      :button-cancel-text="$gettext('Cancel')"
      :button-confirm-text="$gettext('Create')"
      :button-confirm-disabled="buttonConfirmDisabled"
      @cancel="$emit('cancel')"
      @confirm="$emit('confirm', group)"
    >
      <template #content>
        <oc-text-input
          v-model="group.displayName"
          class="oc-mb-s"
          :label="$gettext('Group name') + '*'"
          :error-message="formData.displayName.errorMessage"
          :fix-message-line="true"
          @input="validateDisplayName"
        />
      </template>
    </oc-modal>
  </div>
</template>

<script>
export default {
  name: 'CreateGroupModal',
  data: function () {
    return {
      formData: {
        displayName: {
          errorMessage: '',
          valid: false
        }
      },
      group: {
        displayName: ''
      }
    }
  },
  computed: {
    buttonConfirmDisabled() {
      let invalid = false
      Object.keys(this.formData).forEach((key) => {
        if (this.formData[key].valid === false) {
          invalid = true
        }
      })
      return invalid
    }
  },
  methods: {
    validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.group.displayName.trim() === '') {
        return (this.formData.displayName.errorMessage = this.$gettext(
          'Group name cannot be empty'
        ))
      }

      this.formData.displayName.errorMessage = ''
      this.formData.displayName.valid = true
    }
  }
}
</script>
