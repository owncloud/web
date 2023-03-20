<template>
  <div id="group-edit-panel" class="oc-mt-xl">
    <div class="oc-flex group-info oc-mb-l">
      <avatar-image class="oc-mb-m" :width="80" :userid="group.id" :user-name="group.displayName" />
      <span class="oc-text-muted group-info-display-name" v-text="group.displayName"></span>
    </div>
    <form id="group-edit-form" class="oc-background-highlight oc-p-m" autocomplete="off">
      <oc-text-input
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
        @confirm="$emit('confirm', editGroup)"
      ></compare-save-dialog>
    </form>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Group } from 'web-client/src/generated'
import CompareSaveDialog from 'web-pkg/src/components/sideBar/CompareSaveDialog.vue'

export default defineComponent({
  name: 'EditPanel',
  components: {
    CompareSaveDialog
  },
  props: {
    groups: {
      type: Array,
      required: true
    }
  },
  emits: ['confirm'],
  data() {
    return {
      editGroup: {} as Group,
      formData: {
        displayName: {
          errorMessage: '',
          valid: true
        }
      }
    }
  },
  computed: {
    group() {
      return this.groups.length === 1 ? this.groups[0] : null
    },
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
    validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.editGroup.displayName.trim() === '') {
        this.formData.displayName.errorMessage = this.$gettext('Name cannot be empty')
        return false
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
