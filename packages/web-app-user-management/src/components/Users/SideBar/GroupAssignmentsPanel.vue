<template>
  <div v-if="user" class="oc-mt-xl">
    <UserInfoBox :user="user" />
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
      editUser: {}
    }
  },
  computed: {
    user() {
      return this.users.length === 1 ? this.users[0] : null
    },

    originalObjectUser() {
      return { user: { ...this.user } }
    },
    compareObjectUser() {
      return { user: { ...this.editUser } }
    }
  },
  watch: {
    user: {
      handler: function () {
        this.editUser = { ...this.user }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    revertChanges() {
      this.editUser = { ...this.user }
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
</style>
