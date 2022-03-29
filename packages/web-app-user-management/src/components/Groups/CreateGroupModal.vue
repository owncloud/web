<template>
  <oc-modal
    :title="$gettext('Create group')"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Create')"
    :button-confirm-disabled="buttonConfirmDisabled"
    focus-trap-initial="#input-display-name"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm', group)"
  >
    <template #content>
      <oc-text-input
        id="input-display-name"
        v-model="group.displayName"
        class="oc-mb-s"
        :label="$gettext('Group name') + '*'"
        :error-message="formData.displayName.errorMessage"
        :fix-message-line="true"
        @input="validateDisplayName"
      />
    </template>
  </oc-modal>
</template>

<script>
export default {
  name: 'CreateGroupModal',
  props: {
    existingGroups: {
      type: Array,
      required: false,
      default: () => {
        return []
      }
    }
  },
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
      return Object.keys(this.formData)
        .map((k) => !!this.formData[k].valid)
        .includes(false)
    }
  },
  methods: {
    validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.group.displayName.trim() === '') {
        this.formData.displayName.errorMessage = this.$gettext('Group name cannot be empty')
        return false
      }

      if (
        this.existingGroups.find(
          (existingGroup) => existingGroup.displayName === this.group.displayName
        )
      ) {
        this.formData.displayName.errorMessage = this.$gettextInterpolate(
          this.$gettext('Group "%{groupName}" already exists'),
          { groupName: this.group.displayName }
        )
        return false
      }

      this.formData.displayName.errorMessage = ''
      this.formData.displayName.valid = true
      return true
    }
  }
}
</script>
