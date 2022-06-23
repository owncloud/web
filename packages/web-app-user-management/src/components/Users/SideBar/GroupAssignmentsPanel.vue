<template>
  <div v-if="user" class="oc-mt-xl">
    <div class="oc-flex group-info oc-mb-l">
      <avatar-image class="oc-mb-m" :width="80" :userid="user.id" :user-name="user.displayName" />
      <span v-text="user.onPremisesSamAccountName"></span>
      <span class="oc-text-muted group-info-display-name" v-text="user.displayName"></span>
    </div>
    <div v-if="editUser" class="oc-background-highlight oc-p-m">
      <oc-select
        v-model="editUser.memberOf"
        taggable
        multiple
        :options="groups"
        option-label="displayName"
        :label="$gettext('Add or remove groups')"
        :fix-message-line="true"
      />
    </div>
    <compare-save-dialog
      class="edit-compare-save-dialog"
      :original-object="originalObjectUser"
      :compare-object="compareObjectUser"
      @revert="revertChanges"
      @confirm="$emit('confirm', editUser)"
    ></compare-save-dialog>
  </div>
</template>
<script>
import UserInfoBox from './UserInfoBox.vue'
import CompareSaveDialog from '../../CompareSaveDialog.vue'

export default {
  name: 'GroupAssignmentsPanel',
  components: {
    UserInfoBox,
    CompareSaveDialog
  },
  props: {
    users: {
      type: Array,
      required: true
    },
    groups: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      editUser: {},
    }
  },
  computed: {
    user() {
      return this.users.length === 1 ? this.users[0] : null
    },

    originalObjectUser() {
      return { user: { ...this.user} }
    },
    compareObjectUser() {
      return { user: { ...this.editUser } }
    },
  },
  watch: {
    user: {
      handler: function () {
        this.editUser = { ...this.user, }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    revertChanges() {
      this.editUser = { ...this.user} }

  }
}
</script>
<style lang="scss">
.edit-compare-save-dialog {
  position: absolute;
  bottom: 0;
  left: 0;
}
</style>
