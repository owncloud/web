<template>
  <div class="oc-mt-xl">
    <div class="oc-flex group-info oc-mb-l">
      <avatar-image class="oc-mb-m" :width="80" :userid="group.id" :user-name="group.displayName" />
      <span class="oc-text-muted group-info-display-name" v-text="group.displayName"></span>
    </div>
    <div v-if="editGroup" class="oc-background-highlight oc-p-m">
      <oc-text-input
        v-model="editGroup.displayName"
        class="oc-mb-s"
        :label="$gettext('Group name')"
        :error-message="formData.displayName.errorMessage"
        :fix-message-line="true"
        @input="validateDisplayName"
      />
    </div>
    <compare-save-dialog
      class="edit-compare-save-dialog"
      :original-object="group"
      :compare-object="editGroup"
      :confirm-button-disabled="invalidFormData"
      @revert="revertChanges"
      @confirm="$emit('confirm', editGroup)"
    ></compare-save-dialog>
  </div>
</template>
<script>
import CompareSaveDialog from '../../CompareSaveDialog.vue'

export default {
  name: 'EditPanel',
  components: {
    CompareSaveDialog
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editGroup: {},
      formData: {
        displayName: {
          errorMessage: '',
          valid: true
        }
      }
    }
  },
  computed: {
    invalidFormData() {
      return Object.keys(this.formData)
        .map((k) => !!this.formData[k].valid)
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
        this.formData.displayName.errorMessage = this.$gettext('Display name cannot be empty')
        return false
      }

      this.formData.displayName.errorMessage = ''
      this.formData.displayName.valid = true
      return true
    },

    revertChanges() {
      this.editGroup = { ...this.group }
      Object.keys(this.formData).forEach((formDataKey) => {
        this.formData[formDataKey].valid = true
        this.formData[formDataKey].errorMessage = ''
      })
    }
  }
}
</script>
<style lang="scss">
.edit-compare-save-dialog {
  position: absolute;
  bottom: 0;
  left: 0;
}

.group-info {
  align-items: center;
  flex-direction: column;
}
.group-info-display-name {
  font-size: 1.5rem;
}
</style>
