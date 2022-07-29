<template>
  <div class="compare-save-dialog oc-p-s oc-width-1-1">
    <div class="oc-flex oc-flex-between oc-flex-middle oc-width-1-1">
      <span v-if="saved" class="oc-flex oc-flex-middle">
        <oc-icon variation="success" name="checkbox-circle" />
        <span v-translate class="changes-saved oc-ml-s">Changes saved</span>
      </span>
      <span v-else>{{ unsavedChangesText }}</span>
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
import { bus } from 'web-pkg/src/instance'

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
  data: () => ({
    saved: false,
  }),
  computed: {
    unsavedChanges(){
      return !isEqual(this.originalObject, this.compareObject)
    },
    unsavedChangesText(){
      return this.unsavedChanges ? this.$gettext('Unsaved changes') : this.$gettext('No changes')
    }
  },
  watch: {
    unsavedChanges(){
      if(this.unsavedChanges){
        this.saved = false
      }
    }
  },
  mounted() {
    const savedEventToken = bus.subscribe('app.user-management.entity.saved', () => {
      this.saved = true
    })

    this.$on('beforeDestroy', () => bus.unsubscribe('app.user-management.entity.saved', savedEventToken))
  }
}
</script>
<style lang="scss">
.compare-save-dialog {
  background: var(--oc-color-background-highlight);
}
.changes-saved {
  color: var(--oc-color-swatch-success-default);
}
</style>
