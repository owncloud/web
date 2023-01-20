<template>
  <oc-modal
    :title="$gettext('Create group')"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Create')"
    :button-confirm-disabled="isFormInvalid"
    focus-trap-initial="#create-group-input-display-name"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm', group)"
  >
    <template #content>
      <form autocomplete="off" @submit.prevent="onFormSubmit">
        <oc-text-input
          id="create-group-input-display-name"
          v-model="group.displayName"
          class="oc-mb-s"
          :label="$gettext('Group name') + '*'"
          :error-message="formData.displayName.errorMessage"
          :fix-message-line="true"
          @input="validateDisplayName"
        />
        <input type="submit" class="oc-hidden" />
      </form>
    </template>
  </oc-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
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
  emits: ['cancel', 'confirm'],
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
    isFormInvalid() {
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
    },
    onFormSubmit() {
      if (this.isFormInvalid) {
        return
      }
      this.$emit('confirm', this.group)
    }
  }
})
</script>
