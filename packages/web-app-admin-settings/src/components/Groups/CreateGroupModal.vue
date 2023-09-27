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
          @update:model-value="validateDisplayName"
        />
        <input type="submit" class="oc-hidden" />
      </form>
    </template>
  </oc-modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Group } from 'web-client/src/generated'
import { MaybeRef, useClientService } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'CreateGroupModal',
  emits: ['cancel', 'confirm'],
  setup() {
    const clientService = useClientService()

    const group: MaybeRef<Group> = ref({ displayName: '' })
    const formData = ref({
      displayName: {
        errorMessage: '',
        valid: false
      }
    })

    return {
      clientService,
      group,
      formData
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
    async validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.group.displayName.trim() === '') {
        this.formData.displayName.errorMessage = this.$gettext('Group name cannot be empty')
        return false
      }

      if (this.group.displayName.length > 255) {
        this.formData.displayName.errorMessage = this.$gettext(
          'Group name cannot exceed 255 characters'
        )
        return false
      }

      try {
        const client = this.clientService.graphAuthenticated
        await client.groups.getGroup(this.group.displayName)
        this.formData.displayName.errorMessage = this.$gettext(
          'Group "%{groupName}" already exists',
          {
            groupName: this.group.displayName
          }
        )
        return false
      } catch (e) {}

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
