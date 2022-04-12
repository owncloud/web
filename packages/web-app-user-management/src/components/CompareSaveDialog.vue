<template>
  <div class="compare-save-dialog oc-p-s oc-width-1-1">
    <div class="oc-flex oc-flex-between oc-flex-middle oc-width-1-1">
      <span>{{ unsavedChangesText }}</span>
      <div>
        <oc-button :disabled="!unsavedChanges" @click="$emit('revert')">
          <translate>Revert</translate>
        </oc-button>
        <oc-button
          appearance="filled"
          variation="primary"
          :disabled="!unsavedChanges || confirmButtonDisabled"
          @click="$emit('confirm')"
        >
          <translate>Save</translate>
        </oc-button>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import isEqual from 'lodash-es/isEqual'

export default {
  name: 'CompareSaveDialog',
  props: {
    originalObject: {
      type: Object,
      required: true
    },
    compareObject: {
      type: Object,
      required: true
    },
    confirmButtonDisabled: {
      type: Boolean,
      default: () => {
        return false
      }
    },
  },
  computed: {
    unsavedChanges(){
      return !isEqual(this.originalObject, this.compareObject)
    },
    unsavedChangesText(){
      return this.unsavedChanges ? this.$gettext('Unsaved changes') : this.$gettext('No changes')
    }
  }
}
</script>
<style lang="scss">
.compare-save-dialog {
  background: var(--oc-color-background-muted);
}
</style>
