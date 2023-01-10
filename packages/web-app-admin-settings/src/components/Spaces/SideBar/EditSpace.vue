<template>
  <div class="oc-mt-xl">
    <div class="oc-flex user-info">
      <oc-icon name="layout-grid" size="xxlarge" />
    </div>
    <form id="edit-space-form" class="oc-background-highlight oc-p-m" autocomplete="off">
      <div>
        <oc-text-input
          class="oc-mb-s"
          :label="$gettext('Name')"
          :fix-message-line="true"
          @input="validateDisplayName"
        />
        <oc-text-input
          class="oc-mb-s"
          :label="$gettext('Subtitle')"
          :fix-message-line="true"
          @input="validateDisplayName"
        />
      </div>
      <compare-save-dialog
          class="edit-compare-save-dialog oc-mb-l"
          :original-object="{'edit': '3455'}"
          :compare-object="{'edit': '123'}"
          :confirm-button-disabled="invalidFormData"
          @revert="revertChanges"
          @confirm="$emit('confirm', {})"
      ></compare-save-dialog>
    </form>
  </div>
</template>
<script>
import CompareSaveDialog from 'web-pkg/src/components/sideBar/CompareSaveDialog.vue'

export default {
  name: 'EditSpace',
  components: {
    CompareSaveDialog
  },
  props: {
    space: {
      type: Object,
      required: false,
      default: []
    }
  },
  computed: {
    invalidFormData() {
      return []
    }
  },
  methods: {
    revertChanges() {
      alert('revert')
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
