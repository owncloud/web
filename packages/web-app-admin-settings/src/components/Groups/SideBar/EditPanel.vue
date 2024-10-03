<template>
  <div id="group-edit-panel" class="oc-mt-xl">
    <group-info-box :group="group" />
    <form id="group-edit-form" class="oc-background-highlight oc-p-m" autocomplete="off">
      <oc-text-input
        id="displayName-input"
        v-model="editGroup.displayName"
        class="oc-mb-s"
        :label="$gettext('Group name')"
        :error-message="formData.displayName.errorMessage"
        :fix-message-line="true"
        @update:model-value="validateDisplayName"
      />
      <compare-save-dialog
        class="edit-compare-save-dialog oc-mb-l"
        :original-object="group"
        :compare-object="editGroup"
        :confirm-button-disabled="invalidFormData"
        @revert="revertChanges"
        @confirm="onEditGroup(editGroup)"
      ></compare-save-dialog>
    </form>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { Group } from '@ownclouders/web-client/graph/generated'
import { CompareSaveDialog, eventBus, useMessages } from '@ownclouders/web-pkg'
import { MaybeRef, useClientService } from '@ownclouders/web-pkg'
import GroupInfoBox from './GroupInfoBox.vue'
import { useGroupSettingsStore } from '../../../composables'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'EditPanel',
  components: {
    GroupInfoBox,
    CompareSaveDialog
  },
  props: {
    group: {
      type: Object as PropType<Group>,
      required: true,
      default: null
    }
  },
  emits: ['confirm'],
  setup() {
    const clientService = useClientService()
    const { showErrorMessage } = useMessages()
    const groupSettingsStore = useGroupSettingsStore()
    const { $gettext } = useGettext()

    const editGroup: MaybeRef<Group> = ref({})
    const formData = ref({
      displayName: {
        errorMessage: '',
        valid: true
      }
    })

    const onEditGroup = async (editGroup: Group) => {
      try {
        const client = clientService.graphAuthenticated
        await client.groups.editGroup(editGroup.id, editGroup)
        const updatedGroup = await client.groups.getGroup(editGroup.id)
        groupSettingsStore.upsertGroup(updatedGroup)

        eventBus.publish('sidebar.entity.saved')

        return updatedGroup
      } catch (error) {
        console.error(error)
        showErrorMessage({
          title: $gettext('Failed to edit group'),
          errors: [error]
        })
      }
    }

    return {
      clientService,
      editGroup,
      formData,
      onEditGroup
    }
  },
  computed: {
    invalidFormData() {
      return Object.values(this.formData)
        .map((v: any) => !!v.valid)
        .includes(false)
    }
  },
  watch: {
    group: {
      handler: function () {
        this.editGroup = { ...this.group }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.editGroup.displayName.trim() === '') {
        this.formData.displayName.errorMessage = this.$gettext('Group name cannot be empty')
        return false
      }

      if (this.editGroup.displayName.length > 255) {
        this.formData.displayName.errorMessage = this.$gettext(
          'Group name cannot exceed 255 characters'
        )
        return false
      }

      if (this.group.displayName !== this.editGroup.displayName) {
        try {
          const client = this.clientService.graphAuthenticated
          await client.groups.getGroup(this.editGroup.displayName)
          this.formData.displayName.errorMessage = this.$gettext(
            'Group "%{groupName}" already exists',
            {
              groupName: this.editGroup.displayName
            }
          )
          return false
        } catch {}
      }

      this.formData.displayName.errorMessage = ''
      this.formData.displayName.valid = true
      return true
    },
    revertChanges() {
      this.editGroup = { ...this.group }
      Object.values(this.formData).forEach((formDataValue: any) => {
        formDataValue.valid = true
        formDataValue.errorMessage = ''
      })
    }
  }
})
</script>
<style lang="scss">
#group-edit-panel {
  #group-edit-form {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .edit-compare-save-dialog {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .group-info {
    align-items: center;
    flex-direction: column;
  }

  .group-info-display-name {
    font-size: 1.5rem;
  }
}
</style>
