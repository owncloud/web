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
      <oc-button @click="$emit('confirm', editGroup)">ok</oc-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'EditPanel',
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
    }
  }
}
</script>
<style lang="scss">
.group-info {
  align-items: center;
  flex-direction: column;
}
.group-info-display-name {
  font-size: 1.5rem;
}
</style>
