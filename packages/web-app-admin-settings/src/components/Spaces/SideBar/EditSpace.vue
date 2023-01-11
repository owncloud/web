<template>
  <div class="oc-mt-xl">
    <div class="oc-flex user-info">
      <oc-icon name="layout-grid" size="xxlarge" />
    </div>
    <form id="edit-space-form" class="oc-background-highlight oc-p-m" autocomplete="off">
      <div>
        <oc-text-input
          v-model="editSpace.name"
          class="oc-mb-s"
          :label="$gettext('Name')"
          :error-message="formData.name.errorMessage"
          :fix-message-line="true"
          @input="validateSpaceName"
        />
        <oc-text-input
          v-model="editSpace.description"
          class="oc-mb-s"
          :label="$gettext('Description')"
          :error-message="formData.description.errorMessage"
          :fix-message-line="true"
          @input="validateSpaceDescription"
        />
      </div>
      <compare-save-dialog
          class="edit-compare-save-dialog oc-mb-l"
          :original-object="compareSaveDialogOriginalObject"
          :compare-object="editSpace"
          :confirm-button-disabled="invalidFormData"
          @revert="revertChanges"
          @confirm="$emit('confirm', {})"
      ></compare-save-dialog>
    </form>
  </div>
</template>
<script>
import CompareSaveDialog from 'web-pkg/src/components/sideBar/CompareSaveDialog.vue'
import { cloneDeep } from 'lodash-es'

export default {
  name: 'EditSpace',
  components: {
    CompareSaveDialog
  },
  data() {
    return {
      editSpace: {},
      formData: {
        name: {
          errorMessage: '',
          valid: true
        },
        description: {
          errorMessage: '',
          valid: true
        }
      }
    }
  },
  watch: {
    space: {
      handler: function () {
        this.editSpace = cloneDeep({ ...this.space })
      },
      deep: true,
      immediate: true
    }
  },
  props: {
    space: {
      type: Object,
      required: false,
      default: []
    }
  },
  computed: {
    validateSpaceDescription() {
      this.formData.description.valid = false

      if (this.editSpace.description.trim() === '') {
        this.formData.description.errorMessage = this.$gettext('Space description cannot be empty')
        return false
      }

      this.formData.description.errorMessage = ''
      this.formData.description.valid = true
      return true
    },
    validateSpaceName() {
      this.formData.name.valid = false

      if (this.editSpace.name.trim() === '') {
        this.formData.name.errorMessage = this.$gettext('Space name cannot be empty')
        return false
      }

      this.formData.name.errorMessage = ''
      this.formData.name.valid = true
      return true
    },
    invalidFormData() {
      return []
    },
    compareSaveDialogOriginalObject() {
      return cloneDeep({ ...this.space })
    }
  },
  methods: {
    revertChanges() {
      this.editSpace = cloneDeep({ ...this.space })
      Object.values(this.formData).forEach((formDataValue) => {
        formDataValue.valid = true
        formDataValue.errorMessage = ''
      })
    }
  }
}
</script>
<style lang="scss">
.space-info {
  align-items: center;
  flex-direction: column;
}
.group-info-display-name {
  font-size: 1.5rem;
}
.details-table {
  text-align: left;

  tr {
    height: 1.5rem;
  }

  th {
    font-weight: 600;
  }
}
</style>
