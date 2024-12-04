<template>
  <div class="compare-save-dialog oc-width-1-1 oc-flex oc-flex-between oc-flex-middle">
    <span v-if="saved" class="state-indicator oc-flex oc-flex-middle">
      <oc-icon variation="success" name="checkbox-circle" />
      <span v-translate class="changes-saved oc-ml-s">Changes saved</span>
    </span>
    <span v-else class="state-indicator">{{ unsavedChangesText }}</span>
    <div>
      <oc-button
        :disabled="!unsavedChanges"
        class="compare-save-dialog-revert-btn"
        @click="$emit('revert')"
      >
        <span v-text="$gettext('Revert')" />
      </oc-button>
      <oc-button
        appearance="filled"
        variation="primary"
        class="compare-save-dialog-confirm-btn"
        :disabled="!unsavedChanges || confirmButtonDisabled"
        @click="$emit('confirm')"
      >
        <span v-text="$gettext('Save')" />
      </oc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import isEqual from 'lodash-es/isEqual'
import { eventBus } from '../../services/eventBus'

export default defineComponent({
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
    }
  },
  emits: ['confirm', 'revert'],
  setup() {
    const saved = ref(false)
    let savedEventToken: string

    onMounted(() => {
      savedEventToken = eventBus.subscribe('sidebar.entity.saved', () => {
        saved.value = true
      })
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('sidebar.entity.saved', savedEventToken)
    })

    return { saved }
  },
  computed: {
    unsavedChanges() {
      return !isEqual(this.originalObject, this.compareObject)
    },
    unsavedChangesText() {
      return this.unsavedChanges ? this.$gettext('Unsaved changes') : this.$gettext('No changes')
    }
  },
  watch: {
    unsavedChanges() {
      if (this.unsavedChanges) {
        this.saved = false
      }
    },
    'originalObject.id': function () {
      this.saved = false
    }
  }
})
</script>
<style lang="scss" scoped>
.compare-save-dialog {
  background: var(--oc-color-surfaceBright);
  flex-flow: row wrap;
}
.state-indicator {
  line-height: 2rem;
}
.changes-saved {
  color: var(--oc-color-swatch-success-default);
}
</style>
